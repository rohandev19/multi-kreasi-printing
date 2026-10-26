import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShipmentsController } from '../shipments.controller';
import { NotFoundException } from '@nestjs/common';

describe('ShipmentsController', () => {
  let controller: ShipmentsController;
  let createShipmentUseCase: any;
  let getOrderShipmentsUseCase: any;
  let confirmDeliveryUseCase: any;
  let getShipmentDetailsUseCase: any;
  let prisma: any;

  beforeEach(() => {
    createShipmentUseCase = { execute: vi.fn() };
    getOrderShipmentsUseCase = { execute: vi.fn() };
    confirmDeliveryUseCase = { execute: vi.fn() };
    getShipmentDetailsUseCase = { execute: vi.fn() };
    prisma = {
      shipment: {
        findMany: vi.fn(),
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

    controller = new ShipmentsController(
      createShipmentUseCase,
      getOrderShipmentsUseCase,
      confirmDeliveryUseCase,
      getShipmentDetailsUseCase,
      prisma,
    );
  });

  it('should update tracking information successfully', async () => {
    const existingShipment = {
      id: 'shipment-1',
      shipmentNumber: 'SJ-2026-0001',
      orderId: 'order-1',
      carrier: 'Armada MKP',
      trackingNumber: null,
      driverName: 'Pak Joko',
      status: 'In_Transit',
    };

    prisma.shipment.findUnique.mockResolvedValue(existingShipment);
    prisma.shipment.update.mockResolvedValue({
      ...existingShipment,
      carrier: 'JNE Express',
      trackingNumber: 'JNE-882910283',
    });

    const req = { user: { userId: 'user-1' } } as any;
    const result = await controller.updateShipmentTracking(
      'shipment-1',
      {
        carrier: 'JNE Express',
        trackingNumber: 'JNE-882910283',
      },
      req,
    );

    expect(prisma.shipment.update).toHaveBeenCalledWith({
      where: { id: 'shipment-1' },
      data: expect.objectContaining({
        carrier: 'JNE Express',
        trackingNumber: 'JNE-882910283',
      }),
    });

    expect(prisma.orderTimeline.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        orderId: 'order-1',
        notes: expect.stringContaining('JNE-882910283'),
      }),
    });

    expect(result.trackingNumber).toBe('JNE-882910283');
  });

  it('should throw NotFoundException if shipment not found when updating tracking', async () => {
    prisma.shipment.findUnique.mockResolvedValue(null);
    const req = { user: { userId: 'user-1' } } as any;

    await expect(
      controller.updateShipmentTracking(
        'invalid-id',
        { trackingNumber: '123' },
        req,
      ),
    ).rejects.toThrow(NotFoundException);
  });
});
