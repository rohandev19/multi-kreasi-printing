import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InvoiceStatus } from '../domain/invoice.entity';

@Injectable()
export class SendPaymentReminderUseCase {
  private readonly logger = new Logger(SendPaymentReminderUseCase.name);

  constructor(private prisma: PrismaService) {}

  async execute() {
    this.logger.log('Checking for invoices needing payment reminders...');
    
    // Find invoices approaching due date or overdue
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3); // 3 days before due date
    
    const invoices = await this.prisma.invoice.findMany({
      where: {
        status: {
          in: [InvoiceStatus.Sent, InvoiceStatus.Partially_Paid],
        },
        dueDate: {
          lte: targetDate,
        }
      },
      include: {
        customer: true,
      }
    });

    for (const invoice of invoices) {
      // In a real app, send an email. For now we just log it.
      this.logger.log(`Reminder: Invoice ${invoice.invoiceNumber} is due on ${invoice.dueDate.toISOString()}. Sent reminder to ${invoice.customer.email}`);
    }

    return { remindersSent: invoices.length };
  }
}
