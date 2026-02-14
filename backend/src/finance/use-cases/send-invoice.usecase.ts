import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AuditService } from '../../audit/audit.service';
import { InvoiceStatus } from '../domain/invoice.entity';

@Injectable()
export class SendInvoiceUseCase {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    @InjectQueue('pdf-generation') private pdfQueue: Queue,
  ) {}

  async execute(invoiceId: string, currentUserId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) throw new NotFoundException('Invoice not found');

    // Add job to BullMQ queue to generate PDF and send email
    await this.pdfQueue.add('generate-invoice-pdf', {
      invoiceId: invoice.id,
    });

    // Update status to Sent if it's currently Draft
    if (invoice.status === InvoiceStatus.Draft) {
      await this.prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: InvoiceStatus.Sent },
      });
    }

    await this.audit.log({
      userId: currentUserId,
      action: 'INVOICE_SEND_QUEUED',
      entityType: 'Invoice',
      entityId: invoiceId,
      oldValue: null,
      newValue: null,
    });

    return { message: 'Invoice PDF generation and email delivery queued successfully' };
  }
}
