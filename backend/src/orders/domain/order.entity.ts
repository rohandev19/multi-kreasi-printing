import * as crypto from 'crypto';

export class OrderLogic {
  static calculateTotal(
    items: { quantity: number; unitPrice: number }[],
    taxRate = 0.11,
  ): {
    subtotal: number;
    tax: number;
    total: number;
  } {
    const subtotalRaw = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );
    // Precise rounding to 2 decimal places to avoid floating point drift
    const subtotal = Math.round(subtotalRaw * 100) / 100;
    const tax = Math.round(subtotal * taxRate * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;
    return { subtotal, tax, total };
  }

  static generateOrderNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `ORD-${year}${month}${day}-${randomHex}`;
  }

  static isValidTransition(currentStatus: string, nextStatus: string): boolean {
    if (currentStatus === nextStatus) return true;
    const transitions: Record<string, string[]> = {
      Draft: ['Pending_Approval', 'Pending', 'Approved', 'Cancelled'],
      Pending_Approval: ['Approved', 'Cancelled'],
      Pending: ['Approved', 'Cancelled'],
      Approved: [
        'Design_In_Progress',
        'Proof_Pending_Approval',
        'In_Production',
        'Cancelled',
      ],
      Design_In_Progress: [
        'Design_Review',
        'Proof_Pending_Approval',
        'Cancelled',
      ],
      Design_Review: [
        'Design_Approved',
        'Proof_Pending_Approval',
        'Design_In_Progress',
        'Cancelled',
      ],
      Design_Approved: ['Proof_Pending_Approval', 'In_Production', 'Cancelled'],
      Proof_Pending_Approval: ['Proof_Approved', 'Proof_Rejected', 'Cancelled'],
      Proof_Rejected: [
        'Design_In_Progress',
        'Proof_Pending_Approval',
        'Cancelled',
      ],
      Proof_Approved: ['In_Production', 'Cancelled'],
      In_Production: [
        'Quality_Check',
        'Completed',
        'Ready',
        'Partially_Shipped',
        'Shipped',
        'Cancelled',
      ],
      Quality_Check: ['Completed', 'Ready', 'In_Production', 'Cancelled'],
      Completed: [
        'Ready',
        'Partially_Shipped',
        'Shipped',
        'Delivered',
        'Cancelled',
      ],
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
