import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InvoiceLogic, InvoiceStatus } from '../domain/invoice.entity';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class RecordPaymentUseCase {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async execute(invoiceId: string, amount: number, paymentMethod: string, referenceNumber: string | undefined, currentUserId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    InvoiceLogic.validatePaymentAmount(invoice.amount, invoice.payments, amount);

    const updatedInvoice = await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          invoiceId,
          amount,
          paymentMethod: paymentMethod as any,
          referenceNumber,
        },
      });

      // Recalculate status
      const updatedPayments = [...invoice.payments, payment];
      const newStatus = InvoiceLogic.determineStatus(invoice.amount, updatedPayments, invoice.dueDate, invoice.status);

      const updated = await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: newStatus },
      });

      return updated;
    });

    await this.audit.log({
      userId: currentUserId,
      action: 'PAYMENT_RECORDED',
      entityType: 'Invoice',
      entityId: invoiceId,
      oldValue: { status: invoice.status },
      newValue: { status: updatedInvoice.status, amount },
    });

    return updatedInvoice;
  }
}
