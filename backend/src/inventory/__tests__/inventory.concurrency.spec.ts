import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { InventoryService } from '../inventory.service';
import { StockMovementType } from '../dto/adjust-stock.dto';

describe('InventoryService — High-Concurrency Stock Deduction (Stock = 1, 5 Concurrent Checkouts)', () => {
  let service: InventoryService;
  let currentDbStock: number;
  let currentVersion: number;
  let prismaMock: any;
  let auditMock: any;

  beforeEach(() => {
    currentDbStock = 1;
    currentVersion = 1;

    prismaMock = {
      material: {
        findUnique: vi.fn(async ({ where }: any) => {
          if (where.id !== 'mat-1') return null;
          return {
            id: 'mat-1',
            name: 'Art Carton 260gr',
            currentStock: currentDbStock,
            minStockLevel: 5,
            version: currentVersion,
            status: currentDbStock <= 5 ? 'Low_Stock' : 'In_Stock',
          };
        }),
        updateMany: vi.fn(async ({ where, data }: any) => {
          // Simulates PostgreSQL row-locked atomic conditional UPDATE:
          // UPDATE materials SET current_stock = current_stock - qty WHERE id = $1 AND current_stock >= qty
          const requiredGte = where.currentStock?.gte ?? 0;
          if (where.id === 'mat-1' && currentDbStock >= requiredGte) {
            if (data.currentStock?.decrement) {
              currentDbStock -= data.currentStock.decrement;
            } else if (data.currentStock?.increment) {
              currentDbStock += data.currentStock.increment;
            }
            currentVersion += 1;
            return { count: 1 };
          }
          return { count: 0 };
        }),
        update: vi.fn(async ({ data }: any) => ({
          id: 'mat-1',
          name: 'Art Carton 260gr',
          currentStock: currentDbStock,
          minStockLevel: 5,
          version: currentVersion,
          status: data.status || 'Low_Stock',
        })),
      },
      stockMovement: {
        create: vi.fn(async ({ data }: any) => ({
          id: `mov-${Math.random()}`,
          ...data,
        })),
      },
      $transaction: vi.fn(async (cb: any) => cb(prismaMock)),
    };

    auditMock = {
      log: vi.fn().mockResolvedValue(undefined),
    };

    service = new InventoryService(prismaMock, auditMock);
  });

  it('allows exactly 1 deduction and rejects the other 4 with ConflictException when stock = 1 and 5 users checkout simultaneously', async () => {
    const concurrentRequests = Array.from({ length: 5 }, (_, idx) =>
      service.adjustStock(
        'mat-1',
        {
          type: StockMovementType.OUT,
          quantity: 1,
          reason: `Concurrent checkout user-${idx + 1}`,
        },
        `user-${idx + 1}`,
      ),
    );

    const results = await Promise.allSettled(concurrentRequests);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter(
      (r): r is PromiseRejectedResult => r.status === 'rejected',
    );

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(4);
    for (const r of rejected) {
      expect(r.reason).toBeInstanceOf(ConflictException);
    }

    // Final stock is strictly 0 and never negative (-4)
    expect(currentDbStock).toBe(0);
    expect(prismaMock.stockMovement.create).toHaveBeenCalledTimes(1);
  });

  it('rejects non-positive quantities for OUT stock movements', async () => {
    await expect(
      service.adjustStock(
        'mat-1',
        {
          type: StockMovementType.OUT,
          quantity: 0,
        },
        'user-1',
      ),
    ).rejects.toThrow(BadRequestException);
  });
});
