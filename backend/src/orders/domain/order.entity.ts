import * as crypto from 'crypto';

export class OrderLogic {
  static calculateTotal(items: { quantity: number; unitPrice: number }[]): {
    subtotal: number;
    tax: number;
    total: number;
  } {
    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );
    const tax = subtotal * 0.11; // 11% tax
    const total = subtotal + tax; // shipping handled separately for MVP if not in items
    return { subtotal, tax, total };
  }

  static generateOrderNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${year}-${random}`;
  }

  static isValidTransition(currentStatus: string, nextStatus: string): boolean {
    if (currentStatus === nextStatus) return true;
    const transitions: Record<string, string[]> = {
      Draft: ['Pending_Approval', 'Pending', 'Approved', 'Cancelled'],
      Pending_Approval: ['Approved', 'Cancelled'],
      Pending: ['Approved', 'Cancelled'],
      Approved: ['Design_In_Progress', 'Proof_Pending_Approval', 'In_Production', 'Cancelled'],
      Design_In_Progress: ['Design_Review', 'Proof_Pending_Approval', 'Cancelled'],
      Design_Review: ['Design_Approved', 'Proof_Pending_Approval', 'Design_In_Progress', 'Cancelled'],
      Design_Approved: ['Proof_Pending_Approval', 'In_Production', 'Cancelled'],
      Proof_Pending_Approval: ['Proof_Approved', 'Proof_Rejected', 'Cancelled'],
      Proof_Rejected: ['Design_In_Progress', 'Proof_Pending_Approval', 'Cancelled'],
      Proof_Approved: ['In_Production', 'Cancelled'],
      In_Production: ['Quality_Check', 'Completed', 'Ready', 'Partially_Shipped', 'Shipped', 'Cancelled'],
      Quality_Check: ['Completed', 'Ready', 'In_Production', 'Cancelled'],
      Completed: ['Ready', 'Partially_Shipped', 'Shipped', 'Delivered', 'Cancelled'],
      Ready: ['Partially_Shipped', 'Shipped', 'Delivered', 'Cancelled'],
      Partially_Shipped: ['Shipped', 'Delivered', 'Cancelled'],
      Shipped: ['Delivered', 'Cancelled'],
      Delivered: [],
      Cancelled: [],
    };
    return transitions[currentStatus]?.includes(nextStatus) || false;
  }

  static generateLedgerSignature(
    orderId: string,
    status: string,
    amount: number,
  ): string {
    const secret =
      process.env.AUDIT_SECRET || 'fallback_secret_for_ledger_signature';
    return crypto
      .createHmac('sha256', secret)
      .update(`${orderId}:${status}:${amount}`)
      .digest('hex');
  }
}
