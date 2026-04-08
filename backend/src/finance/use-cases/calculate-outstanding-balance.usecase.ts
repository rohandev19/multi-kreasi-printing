import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InvoiceLogic } from '../domain/invoice.entity';

@Injectable()
export class CalculateOutstandingBalanceUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true },
    });

    if (!invoice) throw new NotFoundException('Invoice not found');

    const outstanding = InvoiceLogic.calculateOutstandingBalance(
      invoice.amount,
      invoice.payments,
    );

    return {
      invoiceId,
      totalAmount: invoice.amount,
      outstandingBalance: outstanding.toNumber(),
      status: invoice.status,
    };
  }
}
