import { describe, it, expect } from 'vitest';
import { CreditLogic, InvoiceAgingItem } from '../credit.entity';

describe('CreditLogic Domain Entity', () => {
  const baseDate = new Date('2026-10-12T10:00:00.000Z');

  describe('calculateAging', () => {
    it('should categorize invoices into accurate aging buckets', () => {
      const invoices: InvoiceAgingItem[] = [
        // Current: Due tomorrow
        {
          id: 'inv-1',
          invoiceNumber: 'INV-2026-0001',
          amount: 10000000,
          paidAmount: 0,
          outstanding: 10000000,
          dueDate: new Date('2026-10-13T10:00:00.000Z'),
          status: 'Sent',
        },
        // 1 - 30 days overdue: Due 10 days ago (2026-10-02)
        {
          id: 'inv-2',
          invoiceNumber: 'INV-2026-0002',
          amount: 5000000,
          paidAmount: 2000000,
          outstanding: 3000000,
          dueDate: new Date('2026-10-02T10:00:00.000Z'),
          status: 'Partially_Paid',
        },
        // 31 - 60 days overdue: Due 45 days ago (2026-08-28)
        {
          id: 'inv-3',
          invoiceNumber: 'INV-2026-0003',
          amount: 4000000,
          paidAmount: 0,
          outstanding: 4000000,
          dueDate: new Date('2026-08-28T10:00:00.000Z'),
          status: 'Overdue',
        },
        // 61 - 90 days overdue: Due 75 days ago (2026-07-29)
        {
          id: 'inv-4',
          invoiceNumber: 'INV-2026-0004',
          amount: 2000000,
          paidAmount: 0,
          outstanding: 2000000,
          dueDate: new Date('2026-07-29T10:00:00.000Z'),
          status: 'Overdue',
        },
        // > 90 days overdue: Due 120 days ago (2026-06-14)
        {
          id: 'inv-5',
          invoiceNumber: 'INV-2026-0005',
          amount: 1500000,
          paidAmount: 0,
          outstanding: 1500000,
          dueDate: new Date('2026-06-14T10:00:00.000Z'),
          status: 'Overdue',
        },
        // Fully paid invoice (should be skipped)
        {
          id: 'inv-paid',
          invoiceNumber: 'INV-2026-0000',
          amount: 8000000,
          paidAmount: 8000000,
          outstanding: 0,
          dueDate: new Date('2026-05-01T10:00:00.000Z'),
          status: 'Fully_Paid',
        },
      ];

      const result = CreditLogic.calculateAging(invoices, baseDate);

      expect(result.current).toBe(10000000);
      expect(result.bucket1_30).toBe(3000000);
      expect(result.bucket31_60).toBe(4000000);
      expect(result.bucket61_90).toBe(2000000);
      expect(result.bucketOver90).toBe(1500000);
      expect(result.totalOutstanding).toBe(20500000);
      expect(result.overdueCount).toBe(4);
      expect(result.overdueAmount).toBe(10500000);
    });
  });

  describe('determineRiskLevel', () => {
    it('should return CRITICAL if creditStatus is SUSPENDED or ON_HOLD', () => {
      const emptyAging = {
        current: 0,
        bucket1_30: 0,
        bucket31_60: 0,
        bucket61_90: 0,
        bucketOver90: 0,
        totalOutstanding: 0,
        overdueCount: 0,
        overdueAmount: 0,
      };

      expect(CreditLogic.determineRiskLevel(emptyAging, 50000000, 'SUSPENDED')).toBe('CRITICAL');
      expect(CreditLogic.determineRiskLevel(emptyAging, 50000000, 'ON_HOLD')).toBe('CRITICAL');
    });

    it('should return CRITICAL if invoices are overdue > 60 days', () => {
      const aging = {
        current: 0,
        bucket1_30: 0,
        bucket31_60: 0,
        bucket61_90: 500000,
        bucketOver90: 0,
        totalOutstanding: 500000,
        overdueCount: 1,
        overdueAmount: 500000,
      };
      expect(CreditLogic.determineRiskLevel(aging, 50000000, 'ACTIVE')).toBe('CRITICAL');
    });

    it('should return HIGH if debts are 31-60 days overdue or limit utilization >= 90%', () => {
      const aging1 = {
        current: 0,
        bucket1_30: 0,
        bucket31_60: 1000000,
        bucket61_90: 0,
        bucketOver90: 0,
        totalOutstanding: 1000000,
        overdueCount: 1,
        overdueAmount: 1000000,
      };
      expect(CreditLogic.determineRiskLevel(aging1, 50000000, 'ACTIVE')).toBe('HIGH');

      const agingHighUtil = {
        current: 46000000,
        bucket1_30: 0,
        bucket31_60: 0,
        bucket61_90: 0,
        bucketOver90: 0,
        totalOutstanding: 46000000, // 92% of 50M
        overdueCount: 0,
        overdueAmount: 0,
      };
      expect(CreditLogic.determineRiskLevel(agingHighUtil, 50000000, 'ACTIVE')).toBe('HIGH');
    });

    it('should return LOW when there are no overdues and utilization is low', () => {
      const agingLow = {
        current: 5000000, // 10% of 50M
        bucket1_30: 0,
        bucket31_60: 0,
        bucket61_90: 0,
        bucketOver90: 0,
        totalOutstanding: 5000000,
        overdueCount: 0,
        overdueAmount: 0,
      };
      expect(CreditLogic.determineRiskLevel(agingLow, 50000000, 'ACTIVE')).toBe('LOW');
    });
  });

  describe('evaluateCreditApproval', () => {
    it('should reject if customer has paymentTermDays <= 0', () => {
      const result = CreditLogic.evaluateCreditApproval({
        creditLimit: 50000000,
        paymentTermDays: 0,
        creditStatus: 'ACTIVE',
        currentOutstanding: 0,
        overdueCount: 0,
        newOrderAmount: 5000000,
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('tidak memiliki fasilitas Term of Payment');
    });

    it('should reject and auto-hold if customer has any overdue invoices', () => {
      const result = CreditLogic.evaluateCreditApproval({
        creditLimit: 50000000,
        paymentTermDays: 30,
        creditStatus: 'ACTIVE',
        currentOutstanding: 5000000,
        overdueCount: 2, // 2 overdue invoices
        newOrderAmount: 2000000,
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Overdue');
    });

    it('should reject if order amount exceeds available credit limit', () => {
      const result = CreditLogic.evaluateCreditApproval({
        creditLimit: 20000000,
        paymentTermDays: 30,
        creditStatus: 'ACTIVE',
        currentOutstanding: 15000000, // Available: 5M
        overdueCount: 0,
        newOrderAmount: 8000000, // 8M > 5M
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('melebihi sisa plafon kredit');
    });

    it('should approve if within credit limit, eligible, and no overdue debts', () => {
      const result = CreditLogic.evaluateCreditApproval({
        creditLimit: 30000000,
        paymentTermDays: 30,
        creditStatus: 'ACTIVE',
        currentOutstanding: 10000000, // Available: 20M
        overdueCount: 0,
        newOrderAmount: 5000000,
      });

      expect(result.allowed).toBe(true);
      expect(result.availableCredit).toBe(20000000);
      expect(result.riskLevel).toBe('LOW');
    });
  });
});
