import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BulkUpdateOrderStatusUseCase } from '../bulk-update-order-status.usecase';
import { BadRequestException } from '@nestjs/common';

describe('BulkUpdateOrderStatusUseCase', () => {
  let useCase: BulkUpdateOrderStatusUseCase;
  let prismaMock: any;
  let auditMock: any;

  beforeEach(() => {
    prismaMock = {
      order: {
        findMany: vi.fn(),
        update: vi.fn(),
      },
      orderTimeline: {
        create: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => cb(prismaMock)),
    };

    auditMock = {
      log: vi.fn().mockResolvedValue({}),
    };

    useCase = new BulkUpdateOrderStatusUseCase(prismaMock, auditMock);
  });

  it('should throw BadRequestException if ids is empty', async () => {
    await expect(
      useCase.execute({ ids: [], status: 'Approved' }, 'user-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException if ids exceeds 500 records', async () => {
    const tooManyIds = Array.from({ length: 501 }, (_, i) => `order-${i}`);
    await expect(
      useCase.execute({ ids: tooManyIds, status: 'Approved' }, 'user-1'),
    ).rejects.toThrow('Maksimal 500 pesanan');
  });

  it('should successfully update valid orders and create single audit log', async () => {
    prismaMock.order.findMany.mockResolvedValue([
      { id: 'order-1', orderNumber: 'ORD-001', status: 'Pending_Approval' },
      { id: 'order-2', orderNumber: 'ORD-002', status: 'Pending_Approval' },
    ]);

    const result = await useCase.execute(
      { ids: ['order-1', 'order-2'], status: 'Approved' },
      'user-1',
    );

    expect(result.total).toBe(2);
    expect(result.successCount).toBe(2);
    expect(result.failedCount).toBe(0);
    expect(auditMock.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'BULK_ORDER_STATUS_UPDATE',
        newValue: expect.objectContaining({ count: 2, targetStatus: 'Approved' }),
      }),
    );
  });

  it('should record errors for invalid transitions without failing the entire batch', async () => {
    prismaMock.order.findMany.mockResolvedValue([
      { id: 'order-1', orderNumber: 'ORD-001', status: 'Pending_Approval' },
      { id: 'order-2', orderNumber: 'ORD-002', status: 'Cancelled' }, // Invalid transition from Cancelled to Approved
    ]);

    const result = await useCase.execute(
      { ids: ['order-1', 'order-2'], status: 'Approved' },
      'user-1',
    );

    expect(result.total).toBe(2);
    expect(result.successCount).toBe(1);
    expect(result.failedCount).toBe(1);
    expect(result.errors[0].orderNumber).toBe('ORD-002');
  });
});
