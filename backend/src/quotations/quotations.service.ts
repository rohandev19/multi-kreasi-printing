import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuotationDto, UpdateQuotationDto } from './dto/quotation.dto';

@Injectable()
export class QuotationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(customerId?: string) {
    const where = customerId ? { customerId } : {};
    return this.prisma.quotation.findMany({
      where,
      include: {
        customer: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }

    return quotation;
  }

  async create(data: CreateQuotationDto) {
    const { items, ...quotationData } = data;

    // Auto-generate quotation number
    const count = await this.prisma.quotation.count();
    const quotationNumber = `QUO-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    return this.prisma.quotation.create({
      data: {
        ...quotationData,
        quotationNumber,
        items: {
          create: items,
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });
  }

  async update(id: string, data: UpdateQuotationDto) {
    const { items, ...quotationData } = data;

    // If items are provided, delete old ones and create new ones (simple approach for now)
    if (items) {
      await this.prisma.quotationItem.deleteMany({
        where: { quotationId: id },
      });

      return this.prisma.quotation.update({
        where: { id },
        data: {
          ...quotationData,
          items: {
            create: items,
          },
        },
        include: {
          customer: true,
          items: true,
        },
      });
    }

    return this.prisma.quotation.update({
      where: { id },
      data: quotationData,
      include: {
        customer: true,
        items: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.quotation.delete({
      where: { id },
    });
  }

  async createCustomQuotation(data: any) {
    // 1. Find or create Customer
    let customer = await this.prisma.customer.findUnique({
      where: { email: data.email },
    });

    if (!customer) {
      customer = await this.prisma.customer.create({
        data: {
          companyName: data.companyName || data.fullName,
          email: data.email,
          phone: data.phone,
        },
      });
    }

    // 2. Auto-generate quotation number
    const count = await this.prisma.quotation.count();
    const quotationNumber = `REQ-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    const notes = `[CUSTOM REQUEST]\nName: ${data.fullName}\nCategory: ${data.productCategory}\nQuantity: ${data.estimatedQuantity}\n\nSpecs:\n${data.specifications}\n\nAdditional Notes:\n${data.notes || 'None'}`;

    // 3. Create Quotation without items initially
    return this.prisma.quotation.create({
      data: {
        quotationNumber,
        customerId: customer.id,
        status: 'Requested',
        subtotal: 0,
        tax: 0,
        totalAmount: 0,
        notes,
      },
    });
  }
}
