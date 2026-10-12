export type QuotationStatus =
  | 'Draft'
  | 'Pending_Manager_Approval'
  | 'Sent'
  | 'Accepted'
  | 'Rejected'
  | 'Converted';

export const DISCOUNT_APPROVAL_THRESHOLD_PERCENT = 10;

export interface QuotationCalculationInput {
  items: Array<{
    quantity: number;
    unitPrice: number;
  }>;
  discountPercent?: number;
  taxRatePercent?: number;
}

export interface QuotationCalculationResult {
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  tax: number;
  totalAmount: number;
  requiresManagerApproval: boolean;
}

export class QuotationLogic {
  /**
   * Validates state transitions for Quotations
   */
  static isValidTransition(
    currentStatus: QuotationStatus,
    newStatus: QuotationStatus,
  ): boolean {
    const allowedTransitions: Record<QuotationStatus, QuotationStatus[]> = {
      Draft: ['Pending_Manager_Approval', 'Sent', 'Rejected'],
      Pending_Manager_Approval: ['Sent', 'Rejected'],
      Sent: ['Accepted', 'Rejected'],
      Accepted: ['Converted'],
      Rejected: [],
      Converted: [],
    };

    return allowedTransitions[currentStatus]?.includes(newStatus) ?? false;
  }

  /**
   * Evaluates if a given discount requires Sales Manager authorization
   */
  static requiresManagerApproval(discountPercent: number): boolean {
    return discountPercent > DISCOUNT_APPROVAL_THRESHOLD_PERCENT;
  }

  /**
   * Calculates subtotal, discount, tax, and total amount
   */
  static calculateTotals(
    input: QuotationCalculationInput,
  ): QuotationCalculationResult {
    const subtotal = input.items.reduce((acc, item) => {
      return acc + Math.max(0, item.quantity) * Math.max(0, item.unitPrice);
    }, 0);

    const discountPercent = Math.max(0, Math.min(100, input.discountPercent || 0));
    const discountAmount = Math.round((subtotal * discountPercent) / 100);

    const afterDiscount = Math.max(0, subtotal - discountAmount);
    const taxRatePercent = Math.max(0, input.taxRatePercent || 0);
    const tax = Math.round((afterDiscount * taxRatePercent) / 100);

    const totalAmount = afterDiscount + tax;

    return {
      subtotal,
      discountPercent,
      discountAmount,
      tax,
      totalAmount,
      requiresManagerApproval: this.requiresManagerApproval(discountPercent),
    };
  }
}
