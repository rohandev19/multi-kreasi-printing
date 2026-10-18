import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateShipmentUseCase } from '../create-shipment.usecase';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('CreateShipmentUseCase', () => {
  let useCase: CreateShipmentUseCase;
  let prisma: any;
  let audit: any;
  let eventEmitter: any;

  beforeEach(() => {
    prisma = {
      order: {
        findUnique: vi.fn(),
      },
      shipment: {
        count: vi.fn(),
        create: vi.fn(),
      },
      orderTimeline: {
        create: vi.fn(),
      },
      $transaction: vi.fn(async (cb: any) => cb(prisma)),
    };

    audit = {
      log: vi.fn().mockResolvedValue(undefined),
    };

    eventEmitter = {
      emit: vi.fn(),
    };

    useCase = new CreateShipmentUseCase(prisma, audit, eventEmitter);
  });

  it('should throw NotFoundException if order does not exist', async () => {
    prisma.order.findUnique.mockResolvedValue(null);

    await expect(
      useCase.execute(
        {
          orderId: 'non-existent-order',
          recipientName: 'Budi Handoko',
          deliveryAddress: 'Jl. Merdeka No. 1, Jakarta',
          items: [{ orderItemId: 'item-1', quantity: 100 }],
        },
        'user-1',
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if order is in Draft status', async () => {
    prisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      status: 'Draft',
      items: [{ id: 'item-1', quantity: 500 }],
      shipments: [],
    });

    await expect(
      useCase.execute(
        {
          orderId: 'order-1',
          recipientName: 'Budi Handoko',
          deliveryAddress: 'Jl. Merdeka No. 1, Jakarta',
          items: [{ orderItemId: 'item-1', quantity: 100 }],
        },
        'user-1',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException if quantity exceeds remaining quantity', async () => {
    prisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      status: 'In_Production',
      items: [{ id: 'item-1', quantity: 500 }],
      shipments: [
        {
          items: [{ orderItemId: 'item-1', quantity: 400 }],
        },
      ],
    });

    await expect(
      useCase.execute(
        {
          orderId: 'order-1',
          recipientName: 'Budi Handoko',
          deliveryAddress: 'Jl. Merdeka No. 1, Jakarta',
          items: [{ orderItemId: 'item-1', quantity: 200 }], // only 100 remaining!
        },
        'user-1',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('should successfully create shipment with generated Surat Jalan number', async () => {
    prisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      orderNumber: 'ORD-2026-001',
      status: 'In_Production',
      items: [{ id: 'item-1', quantity: 1000 }],
      shipments: [],
    });

    prisma.shipment.count.mockResolvedValue(0);

    const createdMock = {
      id: 'shipment-1',
      shipmentNumber: 'SJ-2026-0001',
      orderId: 'order-1',
      recipientName: 'PT Sukses Mandiri',
      status: 'Preparing',
      items: [{ orderItemId: 'item-1', quantity: 500 }],
    };
    prisma.shipment.create.mockResolvedValue(createdMock);

    const result = await useCase.execute(
      {
        orderId: 'order-1',
        recipientName: 'PT Sukses Mandiri',
        deliveryAddress: 'Gedung Wisma 46 Lt. 12, Jakarta',
        driverName: 'Pak Joko',
        vehicleNumber: 'B 1234 MKP',
        items: [{ orderItemId: 'item-1', quantity: 500 }],
      },
      'user-warehouse-1',
    );

    expect(result.shipmentNumber).toContain('SJ-');
    expect(prisma.shipment.create).toHaveBeenCalled();
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'SHIPMENT_CREATED',
        entityId: 'shipment-1',
      }),
    );
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'shipment.created',
      expect.objectContaining({
        shipmentNumber: result.shipmentNumber,
      }),
    );
  });
});
