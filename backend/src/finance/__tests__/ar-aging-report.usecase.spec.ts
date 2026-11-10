import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetArAgingReportUseCase } from '../use-cases/get-ar-aging-report.usecase';
import { ValidateCustomerCreditUseCase } from '../use-cases/validate-customer-credit.usecase';
import { PrismaService } from '../../prisma/prisma.service';

describe('AR Aging & Credit Validation Use Cases', () => {
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      customer: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
    };
  });

  describe('GetArAgingReportUseCase', () => {
    it('should query only active customers and only unpaid invoices', async () => {
      const refDate = new Date('2026-11-10T00:00:00Z');

      // Due 15 days ago -> Bucket 1-30
      const dueDate15DaysAgo = new Date('2026-10-26T00:00:00Z');
      // Due 45 days ago -> Bucket 31-60
      const dueDate45DaysAgo = new Date('2026-09-26T00:00:00Z');
      // Due in 10 days -> Current
      const dueDateFuture = new Date('2026-11-20T00:00:00Z');

      prismaMock.customer.findMany.mockResolvedValueOnce([
        {
          id: 'cust-1',
          companyName: 'PT Maju Bersama',
          email: 'maju@example.com',
          phone: '08123456789',
          creditLimit: 50000000,
          paymentTermDays: 30,
          creditStatus: 'ACTIVE',
          creditNotes: null,
          orders: [
            {
              invoices: [
                {
                  id: 'inv-1',
                  invoiceNumber: 'INV-001',
                  amount: 10000000,
                  dueDate: dueDate15DaysAgo,
                  status: 'Sent',
                  payments: [{ amount: 2000000 }], // 8,000,000 outstanding (Bucket 1-30)
                },
                {
                  id: 'inv-2',
                  invoiceNumber: 'INV-002',
                  amount: 5000000,
                  dueDate: dueDateFuture,
                  status: 'Sent',
                  payments: [], // 5,000,000 outstanding (Current)
                },
              ],
            },
          ],
        },
        {
          id: 'cust-2',
          companyName: 'CV Sumber Rezeki',
          email: 'sumber@example.com',
          phone: '08198765432',
          creditLimit: 10000000,
          paymentTermDays: 14,
          creditStatus: 'ACTIVE',
          creditNotes: null,
          orders: [
            {
              invoices: [
                {
                  id: 'inv-3',
                  invoiceNumber: 'INV-003',
                  amount: 15000000,
                  dueDate: dueDate45DaysAgo,
                  status: 'Overdue',
                  payments: [], // 15,000,000 outstanding (Bucket 31-60), exceeds limit -> High/Critical risk
                },
              ],
            },
          ],
        },
      ]);

      const useCase = new GetArAgingReportUseCase(prismaMock);
      const report = await useCase.execute(refDate);

      // Verify targeted query filters
      expect(prismaMock.customer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deletedAt: null },
          include: expect.objectContaining({
            orders: expect.objectContaining({
              where: {
                invoices: {
                  some: {
                    status: { notIn: ['Fully_Paid', 'Cancelled'] },
                  },
                },
              },
            }),
          }),
        }),
      );

      // Verify Summary Totals
      // Total Outstanding: Cust 1 (8M + 5M = 13M) + Cust 2 (15M) = 28,000,000
      expect(report.summary.totalReceivables).toBe(28000000);
      expect(report.summary.totalCurrent).toBe(5000000);
      expect(report.summary.totalOverdue).toBe(23000000); // 8M + 15M
      expect(report.summary.bucket1_30Total).toBe(8000000);
      expect(report.summary.bucket31_60Total).toBe(15000000);
      expect(report.summary.totalCustomersWithOutstanding).toBe(2);

      // Verify sorting: Cust 2 (15M) should be first, Cust 1 (13M) second
      expect(report.customers[0].customerId).toBe('cust-2');
      expect(report.customers[0].aging.totalOutstanding).toBe(15000000);
      expect(report.customers[0].riskLevel).toBe('HIGH'); // Delinquent debts in bucket 31-60 days & >90% utilization

      expect(report.customers[1].customerId).toBe('cust-1');
      expect(report.customers[1].aging.totalOutstanding).toBe(13000000);
      expect(report.customers[1].riskLevel).toBe('MEDIUM'); // Bucket 1-30 days
    });
  });

  describe('ValidateCustomerCreditUseCase', () => {
    it('should evaluate credit approval correctly and detect overdue debt', async () => {
      const today = new Date();
      const pastDueDate = new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000);

      prismaMock.customer.findUnique.mockResolvedValueOnce({
        id: 'cust-1',
        creditLimit: 20000000,
        paymentTermDays: 30,
        creditStatus: 'ACTIVE',
        orders: [
          {
            invoices: [
              {
                amount: 5000000,
                dueDate: pastDueDate,
                status: 'Overdue',
                payments: [],
              },
            ],
          },
        ],
      });

      const useCase = new ValidateCustomerCreditUseCase(prismaMock);
      const result = await useCase.execute('cust-1', 10000000);

      // Customer has 5M overdue, asking for 10M more
      expect(result.currentOutstanding).toBe(5000000);
      expect(result.overdueCount).toBe(1);
      // Auto-hold / rejection triggered because of overdue debt!
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Overdue');
      expect(result.riskLevel).toBe('HIGH');
    });
  });
});
