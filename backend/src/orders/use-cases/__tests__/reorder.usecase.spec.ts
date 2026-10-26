import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReorderUseCase } from '../reorder.usecase';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

describe('ReorderUseCase', () => {
  let useCase: ReorderUseCase;
  let prisma: any;
  let cartMergeService: any;

  beforeEach(() => {
    prisma = {
      order: {
        findUnique: vi.fn(),
      },
    };

    cartMergeService = {
      mergeGuestCart: vi.fn(),
    };

    useCase = new ReorderUseCase(prisma, cartMergeService);
  });

  it('should throw NotFoundException if order does not exist', async () => {
    prisma.order.findUnique.mockResolvedValue(null);

    await expect(
      useCase.execute('invalid-id', {
        sub: 'user-1',
        email: 'test@example.com',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException if order belongs to a different customer', async () => {
    prisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      customer: { email: 'another@example.com' },
      items: [{ id: 'item-1', productId: 'prod-1', quantity: 10 }],
    });

    await expect(
      useCase.execute('order-1', {
        sub: 'user-1',
        email: 'hacker@example.com',
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw BadRequestException if order has no items', async () => {
    prisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      orderNumber: 'ORD-001',
      customer: { email: 'test@example.com' },
      items: [],
    });

    await expect(
      useCase.execute('order-1', { sub: 'user-1', email: 'test@example.com' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should successfully reorder active items and merge into customer cart', async () => {
    prisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      orderNumber: 'ORD-202610-001',
      customer: { email: 'test@example.com' },
      items: [
        {
          id: 'item-1',
          productId: 'prod-1',
          quantity: 500,
          product: { id: 'prod-1', name: 'Brosur A4', status: 'Active' },
        },
        {
          id: 'item-2',
          productId: 'prod-2',
          quantity: 200,
          product: { id: 'prod-2', name: 'Kotak Kemasan', status: 'Active' },
        },
      ],
    });

    cartMergeService.mergeGuestCart.mockResolvedValue({
      id: 'cart-1',
      items: [
        { productId: 'prod-1', quantity: 500 },
        { productId: 'prod-2', quantity: 200 },
      ],
      totalAmount: 1500000,
    });

    const result = await useCase.execute('order-1', {
      sub: 'user-1',
      email: 'test@example.com',
    });

    expect(result.success).toBe(true);
    expect(result.reorderedCount).toBe(2);
    expect(result.skippedCount).toBe(0);
    expect(cartMergeService.mergeGuestCart).toHaveBeenCalledWith('user-1', [
      { productId: 'prod-1', quantity: 500 },
      { productId: 'prod-2', quantity: 200 },
    ]);
  });

  it('should skip discontinued products and still reorder active ones', async () => {
    prisma.order.findUnique.mockResolvedValue({
      id: 'order-2',
      orderNumber: 'ORD-202610-002',
      customer: { email: 'test@example.com' },
      items: [
        {
          id: 'item-1',
          productId: 'prod-1',
          quantity: 500,
          product: { id: 'prod-1', name: 'Brosur A4', status: 'Active' },
        },
        {
          id: 'item-2',
          productId: 'prod-old',
          quantity: 100,
          product: {
            id: 'prod-old',
            name: 'Kalender 2024',
            status: 'Discontinued',
          },
        },
      ],
    });

    cartMergeService.mergeGuestCart.mockResolvedValue({
      id: 'cart-1',
      items: [{ productId: 'prod-1', quantity: 500 }],
      totalAmount: 500000,
    });

    const result = await useCase.execute('order-2', {
      sub: 'user-1',
      email: 'test@example.com',
    });

    expect(result.success).toBe(true);
    expect(result.reorderedCount).toBe(1);
    expect(result.skippedCount).toBe(1);
    expect(cartMergeService.mergeGuestCart).toHaveBeenCalledWith('user-1', [
      { productId: 'prod-1', quantity: 500 },
    ]);
  });
});
