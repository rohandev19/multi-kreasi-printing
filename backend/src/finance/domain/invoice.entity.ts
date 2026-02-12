import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import Decimal = Prisma.Decimal;

export enum InvoiceStatus {
  Draft = 'Draft',
  Sent = 'Sent',
  Partially_Paid = 'Partially_Paid',
  Fully_Paid = 'Fully_Paid',
  Overdue = 'Overdue',
  Cancelled = 'Cancelled',
}

export class InvoiceLogic {
  /**
   * Generates a new invoice number format INV-YYYY-9999
   */
  static generateInvoiceNumber(sequence: number): string {
    const year = new Date().getFullYear();
    const paddedSequence = sequence.toString().padStart(4, '0');
    return `INV-${year}-${paddedSequence}`;
  }

  static calculateOutstandingBalance(totalAmount: Decimal | number, payments: Array<{ amount: Decimal | number }>): Decimal {
    const total = new Decimal(totalAmount);
    const paid = payments.reduce((sum, payment) => sum.plus(new Decimal(payment.amount)), new Decimal(0));
    return total.minus(paid);
  }

  static determineStatus(totalAmount: Decimal | number, payments: Array<{ amount: Decimal | number }>, dueDate: Date, currentStatus: string): InvoiceStatus {
    if (currentStatus === InvoiceStatus.Cancelled || currentStatus === InvoiceStatus.Draft) {
      return currentStatus as InvoiceStatus;
    }

    const outstanding = this.calculateOutstandingBalance(totalAmount, payments);

    if (outstanding.lte(0)) {
      return InvoiceStatus.Fully_Paid;
    }

    if (outstanding.lt(new Decimal(totalAmount))) {
      // Check overdue even if partially paid
      if (new Date() > dueDate) {
        return InvoiceStatus.Overdue;
      }
      return InvoiceStatus.Partially_Paid;
    }

    // No payments yet
    if (new Date() > dueDate) {
      return InvoiceStatus.Overdue;
    }

    return currentStatus as InvoiceStatus;
  }

  static validatePaymentAmount(totalAmount: Decimal | number, payments: Array<{ amount: Decimal | number }>, incomingAmount: Decimal | number): void {
    const outstanding = this.calculateOutstandingBalance(totalAmount, payments);
    if (new Decimal(incomingAmount).gt(outstanding)) {
      throw new BadRequestException('Payment amount exceeds outstanding balance');
    }
  }
}
