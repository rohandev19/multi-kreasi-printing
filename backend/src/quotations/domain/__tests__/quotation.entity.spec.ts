import { describe, it, expect } from 'vitest';
import {
  QuotationLogic,
  DISCOUNT_APPROVAL_THRESHOLD_PERCENT,
} from '../quotation.entity';

describe('QuotationLogic Domain Tests', () => {
  describe('isValidTransition', () => {
    it('allows Draft to Sent or Pending_Manager_Approval', () => {
      expect(QuotationLogic.isValidTransition('Draft', 'Sent')).toBe(true);
      expect(QuotationLogic.isValidTransition('Draft', 'Pending_Manager_Approval')).toBe(true);
      expect(QuotationLogic.isValidTransition('Draft', 'Rejected')).toBe(true);
      expect(QuotationLogic.isValidTransition('Draft', 'Accepted')).toBe(false);
      expect(QuotationLogic.isValidTransition('Draft', 'Converted')).toBe(false);
    });

    it('allows Pending_Manager_Approval to Sent on approval, or Rejected on decline', () => {
      expect(QuotationLogic.isValidTransition('Pending_Manager_Approval', 'Sent')).toBe(true);
      expect(QuotationLogic.isValidTransition('Pending_Manager_Approval', 'Rejected')).toBe(true);
      expect(QuotationLogic.isValidTransition('Pending_Manager_Approval', 'Accepted')).toBe(false);
    });

    it('allows Sent to Accepted or Rejected by customer', () => {
      expect(QuotationLogic.isValidTransition('Sent', 'Accepted')).toBe(true);
      expect(QuotationLogic.isValidTransition('Sent', 'Rejected')).toBe(true);
      expect(QuotationLogic.isValidTransition('Sent', 'Draft')).toBe(false);
    });

    it('allows Accepted to Converted', () => {
      expect(QuotationLogic.isValidTransition('Accepted', 'Converted')).toBe(true);
      expect(QuotationLogic.isValidTransition('Accepted', 'Draft')).toBe(false);
    });

    it('does not allow transitions out of terminal states (Rejected, Converted)', () => {
      expect(QuotationLogic.isValidTransition('Rejected', 'Draft')).toBe(false);
      expect(QuotationLogic.isValidTransition('Converted', 'Accepted')).toBe(false);
    });
  });

  describe('requiresManagerApproval', () => {
    it(`returns false when discount is <= ${DISCOUNT_APPROVAL_THRESHOLD_PERCENT}%`, () => {
      expect(QuotationLogic.requiresManagerApproval(0)).toBe(false);
      expect(QuotationLogic.requiresManagerApproval(5)).toBe(false);
      expect(QuotationLogic.requiresManagerApproval(10)).toBe(false);
    });

    it(`returns true when discount is > ${DISCOUNT_APPROVAL_THRESHOLD_PERCENT}%`, () => {
      expect(QuotationLogic.requiresManagerApproval(10.1)).toBe(true);
      expect(QuotationLogic.requiresManagerApproval(15)).toBe(true);
      expect(QuotationLogic.requiresManagerApproval(25)).toBe(true);
    });
  });

  describe('calculateTotals', () => {
    it('correctly calculates subtotal, discount, tax, and manager approval flag', () => {
      const result = QuotationLogic.calculateTotals({
        items: [
          { quantity: 1000, unitPrice: 5000 }, // 5,000,000
          { quantity: 2, unitPrice: 500000 },   // 1,000,000
        ],
        discountPercent: 15,
        taxRatePercent: 11,
      });

      expect(result.subtotal).toBe(6000000);
      expect(result.discountPercent).toBe(15);
      expect(result.discountAmount).toBe(900000); // 15% of 6,000,000
      expect(result.tax).toBe(561000); // 11% of (6,000,000 - 900,000 = 5,100,000)
      expect(result.totalAmount).toBe(5661000);
      expect(result.requiresManagerApproval).toBe(true);
    });

    it('handles zero discount without requiring manager approval', () => {
      const result = QuotationLogic.calculateTotals({
        items: [{ quantity: 10, unitPrice: 20000 }],
        discountPercent: 0,
      });

      expect(result.subtotal).toBe(200000);
      expect(result.discountAmount).toBe(0);
      expect(result.totalAmount).toBe(200000);
      expect(result.requiresManagerApproval).toBe(false);
    });
  });
});
