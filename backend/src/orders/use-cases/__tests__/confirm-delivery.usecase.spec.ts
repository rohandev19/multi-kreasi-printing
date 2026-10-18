import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfirmDeliveryUseCase } from '../confirm-delivery.usecase';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ConfirmDeliveryUseCase', () => {
  let useCase: ConfirmDeliveryUseCase;
  let prisma: any;
  let audit: any;
  let eventEmitter: any;

  beforeEach(() => {
    prisma = {
      shipment: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      order: {
        update: vi.fn(),
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

    useCase = new ConfirmDeliveryUseCase(prisma, audit, eventEmitter);
  });

  it('should throw NotFoundException if shipment does not exist', async () => {
    prisma.shipment.findUnique.mockResolvedValue(null);

    await expect(
      useCase.execute('invalid-id', { receivedBy: 'Ibu Rina' }, 'user-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if shipment is already Delivered', async () => {
    prisma.shipment.findUnique.mockResolvedValue({
      id: 'shipment-1',
      status: 'Delivered',
      orderId: 'order-1',
      order: { items: [], shipments: [] },
    });

    await expect(
      useCase.execute('shipment-1', { receivedBy: 'Ibu Rina' }, 'user-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should confirm delivery and update order status to Delivered when 100% fulfilled', async () => {
    const shipmentMock = {
      id: 'shipment-1',
      shipmentNumber: 'SJ-2026-0001',
      orderId: 'order-1',
      status: 'In_Transit',
      order: {
        id: 'order-1',
        status: 'In_Production',
        items: [{ id: 'item-1', quantity: 500 }],
        shipments: [
          {
            id: 'shipment-1',
            status: 'In_Transit',
            items: [{ orderItemId: 'item-1', quantity: 500 }],
          },
        ],
      },
    };

    prisma.shipment.findUnique.mockResolvedValue(shipmentMock);
    prisma.shipment.update.mockResolvedValue({
      ...shipmentMock,
      status: 'Delivered',
      receivedBy: 'Ibu Rina (GA Staff)',
    });

    const result = await useCase.execute(
      'shipment-1',
      {
        receivedBy: 'Ibu Rina (GA Staff)',
        podNotes: 'Diterima dalam kondisi baik dan tersegel rapi.',
      },
      'driver-1',
    );

    expect(result.status).toBe('Delivered');
    expect(prisma.shipment.update).toHaveBeenCalled();
    expect(prisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'order-1' },
        data: { status: 'Delivered' },
      }),
    );
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'shipment.delivered',
      expect.objectContaining({
        receivedBy: 'Ibu Rina (GA Staff)',
      }),
    );
  });
});
