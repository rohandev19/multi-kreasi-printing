import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ConvertQuotationToOrderUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(quotationId: string) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id: quotationId },
      include: {
        items: true,
      },
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${quotationId} not found`);
    }

    if (quotation.status !== 'Accepted') {
      throw new BadRequestException(
        'Only accepted quotations can be converted to orders',
      );
    }

    // Generate Order Number
    const count = await this.prisma.order.count();
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    // Create the Order
    const newOrder = await this.prisma.order.create({
      data: {
        orderNumber,
        customerId: quotation.customerId,
        status: 'Draft',
        priority: 'Normal',
        subtotal: quotation.subtotal,
        tax: quotation.tax,
        shipping: 0,
        totalAmount: quotation.totalAmount,
        notes: `Converted from Quotation ${quotation.quotationNumber}`,
        items: {
          create: quotation.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
            notes: item.notes,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Update quotation status
    await this.prisma.quotation.update({
      where: { id: quotationId },
      data: { status: 'Converted' },
    });

    return newOrder;
  }
}
