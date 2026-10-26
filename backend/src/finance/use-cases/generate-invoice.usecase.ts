import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InvoiceLogic, InvoiceStatus } from '../domain/invoice.entity';

@Injectable()
export class GenerateInvoiceUseCase {
  private readonly logger = new Logger(GenerateInvoiceUseCase.name);

  constructor(private prisma: PrismaService) {}

  async execute(orderId: string): Promise<void> {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        this.logger.error(
          `Order ${orderId} not found, cannot generate invoice.`,
        );
        return;
      }

      const existingInvoice = await this.prisma.invoice.findFirst({
        where: { orderId },
      });

      if (existingInvoice) {
        this.logger.warn(`Invoice already exists for order ${orderId}`);
        return;
      }

      const count = await this.prisma.invoice.count();
      const invoiceNumber = InvoiceLogic.generateInvoiceNumber(count + 1);

      // Determine due date according to customer credit terms (TOP)
      const customer = await this.prisma.customer.findUnique({
        where: { id: order.customerId },
      });
      const termDays =
        customer && customer.paymentTermDays > 0
          ? customer.paymentTermDays
          : 14;

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + termDays);

      await this.prisma.invoice.create({
        data: {
          invoiceNumber,
          orderId,
          customerId: order.customerId,
          amount: order.totalAmount,
          status: InvoiceStatus.Draft,
          dueDate,
        },
      });

      this.logger.log(
        `Generated invoice ${invoiceNumber} for order ${orderId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to generate invoice for order ${orderId}`,
        error,
      );
      throw error;
    }
  }
}
