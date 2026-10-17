import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GlobalSearchUseCase } from '../global-search.usecase';
import { PrismaService } from '../../../prisma/prisma.service';

describe('GlobalSearchUseCase', () => {
  let useCase: GlobalSearchUseCase;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      customer: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      order: {
        findMany: vi.fn(),
      },
      invoice: {
        findMany: vi.fn(),
      },
      product: {
        findMany: vi.fn(),
      },
      quotation: {
        findMany: vi.fn(),
      },
    };
    useCase = new GlobalSearchUseCase(prisma as unknown as PrismaService);
  });

  it('should return empty results if query is less than 2 characters', async () => {
    const result = await useCase.execute(
      { q: 'a' },
      { sub: 'user-1', email: 'user@test.com', role: 'Owner' },
    );

    expect(result.total).toBe(0);
    expect(result.results.orders).toHaveLength(0);
    expect(prisma.order.findMany).not.toHaveBeenCalled();
  });

  it('should scope customer searches strictly to their own data and hide internal entities', async () => {
    prisma.customer.findFirst.mockResolvedValue({ id: 'cust-123' });
    prisma.order.findMany.mockResolvedValue([
      {
        id: 'ord-1',
        orderNumber: 'ORD-20261017-001',
        status: 'Completed',
        totalAmount: 150000,
        createdAt: new Date(),
      },
    ]);
    prisma.invoice.findMany.mockResolvedValue([]);
    prisma.product.findMany.mockResolvedValue([
      {
        id: 'prod-1',
        sku: 'BOX-01',
        name: 'Kemasan Box Custom',
        basePrice: 5000,
        unitOfMeasure: 'pcs',
      },
    ]);

    const result = await useCase.execute(
      { q: 'box' },
      { sub: 'user-cust', email: 'cust@client.com', role: 'Customer' },
    );

    expect(prisma.customer.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [
          { email: 'cust@client.com' },
          { members: { some: { id: 'user-cust' } } },
        ],
      },
      select: { id: true },
    });

    // Orders scoped to cust-123
    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          customerId: 'cust-123',
        }),
      }),
    );

    // Customer should NOT see internal CRM customers or quotations
    expect(result.results.customers).toHaveLength(0);
    expect(result.results.quotations).toHaveLength(0);
    expect(result.results.orders).toHaveLength(1);
    expect(result.results.products).toHaveLength(1);
    expect(result.total).toBe(2);
  });

  it('should allow Owner/Manager to search across all entities', async () => {
    prisma.order.findMany.mockResolvedValue([
      {
        id: 'ord-1',
        orderNumber: 'ORD-999',
        status: 'In_Production',
        totalAmount: 500000,
        customer: { name: 'Budi', companyName: 'PT Maju' },
      },
    ]);
    prisma.product.findMany.mockResolvedValue([]);
    prisma.customer.findMany.mockResolvedValue([
      {
        id: 'cust-1',
        name: 'Budi',
        companyName: 'PT Maju',
        email: 'budi@maju.com',
        phone: '08123456789',
        loyaltyTier: 'Gold',
      },
    ]);
    prisma.invoice.findMany.mockResolvedValue([]);
    prisma.quotation.findMany.mockResolvedValue([
      {
        id: 'quot-1',
        quotationNumber: 'QUO-001',
        status: 'Sent',
        totalAmount: 1000000,
        customer: { companyName: 'PT Maju' },
      },
    ]);

    const result = await useCase.execute(
      { q: 'Maju' },
      { sub: 'admin-1', email: 'owner@mkp.com', role: 'Owner' },
    );

    expect(result.results.orders).toHaveLength(1);
    expect(result.results.customers).toHaveLength(1);
    expect(result.results.quotations).toHaveLength(1);
    expect(result.total).toBe(3);
    expect(result.results.orders[0].title).toBe('#ORD-999');
    expect(result.results.customers[0].title).toBe('PT Maju');
    expect(result.results.quotations[0].title).toBe('Penawaran #QUO-001');
  });
});
