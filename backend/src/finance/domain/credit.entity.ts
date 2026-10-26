export type CreditStatus = 'ACTIVE' | 'SUSPENDED' | 'ON_HOLD';

export type CreditRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface InvoiceAgingItem {
  id: string;
  invoiceNumber: string;
  amount: number;
  paidAmount: number;
  outstanding: number;
  dueDate: Date;
  status: string;
}

export interface AgingBuckets {
  current: number; // <= 0 days overdue (not due yet)
  bucket1_30: number; // 1 - 30 days overdue
  bucket31_60: number; // 31 - 60 days overdue
  bucket61_90: number; // 61 - 90 days overdue
  bucketOver90: number; // > 90 days overdue
  totalOutstanding: number;
  overdueCount: number;
  overdueAmount: number;
}

export interface CreditApprovalParams {
  creditLimit: number;
  paymentTermDays: number;
  creditStatus: string;
  currentOutstanding: number;
  overdueCount: number;
  newOrderAmount: number;
}

export interface CreditApprovalResult {
  allowed: boolean;
  reason?: string;
  creditLimit: number;
  currentOutstanding: number;
  availableCredit: number;
  overdueCount: number;
  riskLevel: CreditRiskLevel;
}

export class CreditLogic {
  /**
   * Calculates standard accounting AR Aging buckets for a set of invoices
   */
  static calculateAging(
    invoices: InvoiceAgingItem[],
    referenceDate: Date = new Date(),
  ): AgingBuckets {
    let current = 0;
    let bucket1_30 = 0;
    let bucket31_60 = 0;
    let bucket61_90 = 0;
    let bucketOver90 = 0;
    let overdueCount = 0;
    let overdueAmount = 0;

    const refTime = referenceDate.getTime();

    for (const inv of invoices) {
      if (inv.status === 'Fully_Paid' || inv.status === 'Cancelled') {
        continue;
      }

      const outstanding = Math.max(0, inv.outstanding);
      if (outstanding <= 0) continue;

      const dueTime = new Date(inv.dueDate).getTime();
      const diffDays = Math.floor((refTime - dueTime) / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        current += outstanding;
      } else {
        overdueCount += 1;
        overdueAmount += outstanding;

        if (diffDays <= 30) {
          bucket1_30 += outstanding;
        } else if (diffDays <= 60) {
          bucket31_60 += outstanding;
        } else if (diffDays <= 90) {
          bucket61_90 += outstanding;
        } else {
          bucketOver90 += outstanding;
        }
      }
    }

    const totalOutstanding =
      current + bucket1_30 + bucket31_60 + bucket61_90 + bucketOver90;

    return {
      current,
      bucket1_30,
      bucket31_60,
      bucket61_90,
      bucketOver90,
      totalOutstanding,
      overdueCount,
      overdueAmount,
    };
  }

  /**
   * Determines credit risk level based on aging buckets and credit utilization
   */
  static determineRiskLevel(
    aging: AgingBuckets,
    creditLimit: number,
    creditStatus: string,
  ): CreditRiskLevel {
    if (creditStatus === 'SUSPENDED' || creditStatus === 'ON_HOLD') {
      return 'CRITICAL';
    }

    // Critical: Delinquent debts > 60 days
    if (aging.bucket61_90 > 0 || aging.bucketOver90 > 0) {
      return 'CRITICAL';
    }

    const utilization =
      creditLimit > 0 ? (aging.totalOutstanding / creditLimit) * 100 : 100;

    // High: Delinquent debts 31-60 days or > 90% credit limit used
    if (aging.bucket31_60 > 0 || utilization >= 90) {
      return 'HIGH';
    }

    // Medium: Delinquent debts 1-30 days or > 75% credit limit used
    if (aging.bucket1_30 > 0 || utilization >= 75) {
      return 'MEDIUM';
    }

    return 'LOW';
  }

  /**
   * Evaluates if a customer is approved to place a new order using Credit Terms
   */
  static evaluateCreditApproval(
    params: CreditApprovalParams,
  ): CreditApprovalResult {
    const {
      creditLimit,
      paymentTermDays,
      creditStatus,
      currentOutstanding,
      overdueCount,
      newOrderAmount,
    } = params;

    const availableCredit = Math.max(0, creditLimit - currentOutstanding);

    // Default risk level
    const riskLevel: CreditRiskLevel =
      creditStatus !== 'ACTIVE'
        ? 'CRITICAL'
        : overdueCount > 0
          ? 'HIGH'
          : currentOutstanding >= creditLimit * 0.9
            ? 'HIGH'
            : currentOutstanding >= creditLimit * 0.75
              ? 'MEDIUM'
              : 'LOW';

    // 1. Check if eligible for credit terms
    if (paymentTermDays <= 0) {
      return {
        allowed: false,
        reason:
          'Pelanggan tidak memiliki fasilitas Term of Payment (TOP). Pembayaran tunai/DP diperlukan.',
        creditLimit,
        currentOutstanding,
        availableCredit,
        overdueCount,
        riskLevel,
      };
    }

    // 2. Check credit status
    if (creditStatus !== 'ACTIVE') {
      return {
        allowed: false,
        reason: `Fasilitas kredit pelanggan sedang berstatus ${creditStatus}. Transaksi kredit ditangguhkan.`,
        creditLimit,
        currentOutstanding,
        availableCredit,
        overdueCount,
        riskLevel,
      };
    }

    // 3. Auto-hold: Check for any overdue invoices
    if (overdueCount > 0) {
      return {
        allowed: false,
        reason: `Pelanggan memiliki ${overdueCount} tagihan yang telah melewati jatuh tempo (Overdue). Harap selesaikan pembayaran tertunggak terlebih dahulu.`,
        creditLimit,
        currentOutstanding,
        availableCredit,
        overdueCount,
        riskLevel,
      };
    }

    // 4. Check credit limit
    if (currentOutstanding + newOrderAmount > creditLimit) {
      return {
        allowed: false,
        reason: `Nilai pesanan (Rp ${newOrderAmount.toLocaleString('id-ID')}) melebihi sisa plafon kredit yang tersedia (Sisa plafon: Rp ${availableCredit.toLocaleString('id-ID')}).`,
        creditLimit,
        currentOutstanding,
        availableCredit,
        overdueCount,
        riskLevel,
      };
    }

    return {
      allowed: true,
      creditLimit,
      currentOutstanding,
      availableCredit,
      overdueCount,
      riskLevel,
    };
  }
}
