import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CalculateKPIsUseCase } from '../use-cases/calculate-kpis.usecase';
import { GetDashboardMetricsUseCase } from '../use-cases/get-dashboard-metrics.usecase';
import { GetOwnerMetricsUseCase } from '../use-cases/get-owner-metrics.usecase';
import { GetManagerMetricsUseCase } from '../use-cases/get-manager-metrics.usecase';
import { GetWarehouseStaffMetricsUseCase } from '../use-cases/get-warehouse-staff-metrics.usecase';
import { GetFinanceStaffMetricsUseCase } from '../use-cases/get-finance-staff-metrics.usecase';
import { GetReportsMetricsUseCase } from '../use-cases/get-reports-metrics.usecase';
import { GetCustomerMetricsUseCase } from '../use-cases/get-customer-metrics.usecase';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

const Decimal = Prisma.Decimal;

describe('Dashboard Use Cases - Unit & Architecture Tests', () => {
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      invoice: {
        aggregate: vi.fn(),
        count: vi.fn(),
      },
      order: {
        count: vi.fn(),
        aggregate: vi.fn(),
        groupBy: vi.fn(),
      },
      customer: {
        count: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
      user: {
        count: vi.fn(),
        findUnique: vi.fn(),
      },
      cart: {
        findUnique: vi.fn(),
      },
      productionJob: {
        count: vi.fn(),
      },
      materialConsumption: {
        findMany: vi.fn(),
      },
      stockMovement: {
        count: vi.fn(),
      },
      shipment: {
        count: vi.fn(),
      },
      payment: {
        aggregate: vi.fn(),
      },
      $queryRaw: vi.fn(),
    };
  });

  describe('CalculateKPIsUseCase', () => {
    it('should calculate revenue, gross profit with real material consumption, CAC, and conversion rate', async () => {
      // Setup mock returns
      prismaMock.invoice.aggregate
        .mockResolvedValueOnce({ _sum: { amount: new Decimal(10000000) } }) // current revenue
        .mockResolvedValueOnce({ _sum: { amount: new Decimal(8000000) } }); // prev revenue

      prismaMock.order.count
        .mockResolvedValueOnce(100) // current total orders
        .mockResolvedValueOnce(80) // current completed orders
        .mockResolvedValueOnce(50) // prev total orders
        .mockResolvedValueOnce(35); // prev completed orders

      prismaMock.customer.count
        .mockResolvedValueOnce(20) // current new customers
        .mockResolvedValueOnce(15); // prev new customers

      // Real material consumption returns
      prismaMock.materialConsumption.findMany
        .mockResolvedValueOnce([
          {
            quantity: new Decimal(10),
            material: { costPrice: new Decimal(200000) },
          }, // 2,000,000
          {
            quantity: new Decimal(5),
            material: { costPrice: new Decimal(400000) },
          }, // 2,000,000 -> Total 4,000,000
        ])
        .mockResolvedValueOnce([
          {
            quantity: new Decimal(8),
            material: { costPrice: new Decimal(200000) },
          }, // 1,600,000
        ]);

      const useCase = new CalculateKPIsUseCase(prismaMock);
      const result = await useCase.execute();

      // Total Revenue: 10,000,000 (Prev: 8,000,000 -> +25%)
      expect(result.totalRevenue.value).toBe(10000000);
      expect(result.totalRevenue.trend.value).toBe(25);
      expect(result.totalRevenue.trend.isPositive).toBe(true);

      // Gross profit: 10,000,000 - 4,000,000 = 6,000,000
      expect(result.grossProfit.value).toBe(6000000);

      // Conversion Rate: 80 / 100 = 80%
      expect(result.conversionRate.value).toBe(80);

      // CAC: marketingSpend (10% of 10M = 1M) / 20 new customers = 50,000
      expect(result.customerAcquisitionCost.value).toBe(50000);
    });

    it('should fallback to 30% margin if no material consumption recorded', async () => {
      prismaMock.invoice.aggregate
        .mockResolvedValueOnce({ _sum: { amount: new Decimal(5000000) } })
        .mockResolvedValueOnce({ _sum: { amount: new Decimal(0) } });

      prismaMock.order.count.mockResolvedValue(0);
      prismaMock.customer.count.mockResolvedValue(0);

      prismaMock.materialConsumption.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const useCase = new CalculateKPIsUseCase(prismaMock);
      const result = await useCase.execute();

      // Fallback 30% of 5,000,000 = 1,500,000
      expect(result.grossProfit.value).toBe(1500000);
    });
  });

  describe('GetDashboardMetricsUseCase', () => {
    it('should query materials table correctly for low stock alerts and aggregate revenue', async () => {
      prismaMock.invoice.aggregate
        .mockResolvedValueOnce({ _sum: { amount: new Decimal(1500000) } })
        .mockResolvedValueOnce({ _sum: { amount: new Decimal(1000000) } });

      prismaMock.order.count
        .mockResolvedValueOnce(12) // ordersToday
        .mockResolvedValueOnce(3); // pendingQuotes (Draft)

      prismaMock.$queryRaw.mockResolvedValueOnce([{ count: 4n }]);

      const useCase = new GetDashboardMetricsUseCase(prismaMock);
      const result = await useCase.execute();

      expect(result.revenue.today).toBe(1500000);
      expect(result.revenue.yesterday).toBe(1000000);
      expect(result.ordersToday).toBe(12);
      expect(result.pendingApprovals).toBe(3);
      expect(result.lowStockAlerts).toBe(4);

      // Verify that $queryRaw was called with materials table query
      expect(prismaMock.$queryRaw).toHaveBeenCalled();
    });
  });

  describe('GetFinanceStaffMetricsUseCase', () => {
    it('should accurately subtract partial payments from gross receivables', async () => {
      prismaMock.invoice.count
        .mockResolvedValueOnce(7) // pendingInvoices
        .mockResolvedValueOnce(2); // overdueInvoices

      prismaMock.invoice.aggregate
        .mockResolvedValueOnce({ _sum: { amount: new Decimal(2500000) } }) // revenueToday
        .mockResolvedValueOnce({ _sum: { amount: new Decimal(1800000) } }) // revenueYesterday
        .mockResolvedValueOnce({ _sum: { amount: new Decimal(10000000) } }); // gross receivables

      // Partial payments already collected on unpaid invoices: 3,000,000
      prismaMock.payment.aggregate.mockResolvedValueOnce({
        _sum: { amount: new Decimal(3000000) },
      });

      const useCase = new GetFinanceStaffMetricsUseCase(prismaMock);
      const result = await useCase.execute();

      const outstandingWidget = result.widgets.find(
        (w) => w.id === 'finance-outstanding',
      );
      expect(outstandingWidget).toBeDefined();
      // Gross 10M - Paid 3M = 7M net outstanding!
      expect(outstandingWidget?.value).toBe(7000000);

      const pendingWidget = result.widgets.find(
        (w) => w.id === 'finance-pending-payments',
      );
      expect(pendingWidget?.value).toBe(7);

      const overdueWidget = result.widgets.find(
        (w) => w.id === 'finance-overdue',
      );
      expect(overdueWidget?.value).toBe(2);
    });
  });

  describe('GetWarehouseStaffMetricsUseCase', () => {
    it('should query materials and stock movements for warehouse KPIs', async () => {
      // 1. low stock count
      prismaMock.$queryRaw
        .mockResolvedValueOnce([{ count: 5n }]) // lowStockAlerts
        .mockResolvedValueOnce([{ total: 15400000 }]); // total inventory value

      // 2. incoming stock movements
      prismaMock.stockMovement.count.mockResolvedValueOnce(3);

      // 3. outgoing shipments in transit
      prismaMock.shipment.count.mockResolvedValueOnce(2);

      const useCase = new GetWarehouseStaffMetricsUseCase(prismaMock);
      const result = await useCase.execute();

      const lowStockWidget = result.widgets.find(
        (w) => w.id === 'warehouse-low-stock',
      );
      expect(lowStockWidget?.value).toBe(5);

      const incomingWidget = result.widgets.find(
        (w) => w.id === 'warehouse-incoming',
      );
      expect(incomingWidget?.value).toBe(3);

      const outgoingWidget = result.widgets.find(
        (w) => w.id === 'warehouse-outgoing',
      );
      expect(outgoingWidget?.value).toBe(2);

      const valueWidget = result.widgets.find(
        (w) => w.id === 'warehouse-inventory-value',
      );
      expect(valueWidget?.value).toBe(15400000);
    });
  });

  describe('GetCustomerMetricsUseCase', () => {
    it('should prioritize user.customerId over user.email', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        email: 'customer@example.com',
        customerId: 'cust-uuid-1',
      });

      prismaMock.cart.findUnique.mockResolvedValueOnce({
        id: 'cart-1',
        items: [{ quantity: 3 }, { quantity: 2 }],
      });

      prismaMock.customer.findUnique.mockResolvedValueOnce({
        id: 'cust-uuid-1',
        companyName: 'PT Maju Terus',
      });

      prismaMock.order.count
        .mockResolvedValueOnce(2) // active
        .mockResolvedValueOnce(5); // completed

      prismaMock.order.aggregate.mockResolvedValueOnce({
        _sum: { totalAmount: new Decimal(7500000) },
      });

      const useCase = new GetCustomerMetricsUseCase(prismaMock);
      const result = await useCase.execute('user-1');

      // Verify findUnique was called with customerId 'cust-uuid-1'
      expect(prismaMock.customer.findUnique).toHaveBeenCalledWith({
        where: { id: 'cust-uuid-1' },
      });

      const cartWidget = result.widgets.find((w) => w.id === 'customer-cart');
      expect(cartWidget?.value).toBe(5);

      const spentWidget = result.widgets.find(
        (w) => w.id === 'customer-amount-spent',
      );
      expect(spentWidget?.value).toBe(7500000);
    });
  });

  describe('GetReportsMetricsUseCase', () => {
    it('should aggregate orders by status, priority, and top customers', async () => {
      prismaMock.order.groupBy
        .mockResolvedValueOnce([
          { status: 'In_Production', _count: { id: 10 } },
          { status: 'Completed', _count: { id: 25 } },
        ])
        .mockResolvedValueOnce([
          { priority: 'Urgent', _count: { id: 5 } },
          { priority: 'Normal', _count: { id: 30 } },
        ])
        .mockResolvedValueOnce([
          {
            customerId: 'c-1',
            _sum: { totalAmount: new Decimal(20000000) },
            _count: { id: 4 },
          },
        ]);

      prismaMock.customer.findMany.mockResolvedValueOnce([
        { id: 'c-1', companyName: 'PT Sukses Mandiri' },
      ]);

      const useCase = new GetReportsMetricsUseCase(prismaMock);
      const result = await useCase.execute();

      expect(result.ordersByStatus).toEqual([
        { name: 'In Production', value: 10 },
        { name: 'Completed', value: 25 },
      ]);
      expect(result.ordersByPriority).toEqual([
        { name: 'Urgent', value: 5 },
        { name: 'Normal', value: 30 },
      ]);
      expect(result.topCustomers[0].companyName).toBe('PT Sukses Mandiri');
      expect(result.topCustomers[0].revenue).toBe(20000000);
    });
  });
});
