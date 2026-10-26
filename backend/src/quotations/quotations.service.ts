import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateQuotationDto,
  UpdateQuotationDto,
  ApproveQuotationDiscountDto,
  RejectQuotationDiscountDto,
  AcceptQuotationDto,
  RejectQuotationDto,
  CreateQuotationRevisionDto,
} from './dto/quotation.dto';
import { QuotationLogic } from './domain/quotation.entity';

@Injectable()
export class QuotationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(customerId?: string) {
    const where = customerId ? { customerId } : {};
    return this.prisma.quotation.findMany({
      where,
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
        managerApprover: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
          },
        },
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
        managerApprover: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
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

    // Calculate totals using domain entity
    const totals = QuotationLogic.calculateTotals({
      items: items.map((i) => ({
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      discountPercent: data.discountPercent,
      taxRatePercent: 11,
    });

    // Determine initial status based on discount matrix
    const initialStatus = totals.requiresManagerApproval
      ? 'Pending_Manager_Approval'
      : 'Sent';

    // Auto-generate quotation number
    const count = await this.prisma.quotation.count();
    const quotationNumber = `QUO-${new Date().getFullYear()}-${(count + 1)
      .toString()
      .padStart(4, '0')}`;

    return this.prisma.quotation.create({
      data: {
        ...quotationData,
        quotationNumber,
        status: initialStatus,
        version: 1,
        subtotal: totals.subtotal,
        discountPercent: totals.discountPercent,
        discountAmount: totals.discountAmount,
        tax: totals.tax,
        totalAmount: totals.totalAmount,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.quantity * item.unitPrice,
            notes: item.notes,
          })),
        },
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
        managerApprover: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateQuotationDto) {
    const existing = await this.findOne(id);
    const { items, ...quotationData } = data;

    // Recalculate totals if items or discount changed
    const subtotal = Number(existing.subtotal);
    const discountPercent =
      data.discountPercent !== undefined
        ? data.discountPercent
        : Number(existing.discountPercent);

    if (items) {
      const totals = QuotationLogic.calculateTotals({
        items: items.map((i) => ({
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
        discountPercent,
        taxRatePercent: 11,
      });

      const requiresApproval = totals.requiresManagerApproval;
      const status = requiresApproval
        ? 'Pending_Manager_Approval'
        : quotationData.status || existing.status;

      await this.prisma.quotationItem.deleteMany({
        where: { quotationId: id },
      });

      return this.prisma.quotation.update({
        where: { id },
        data: {
          ...quotationData,
          status,
          subtotal: totals.subtotal,
          discountPercent: totals.discountPercent,
          discountAmount: totals.discountAmount,
          tax: totals.tax,
          totalAmount: totals.totalAmount,
          items: {
            create: items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              subtotal: i.quantity * i.unitPrice,
              notes: i.notes,
            })),
          },
        },
        include: {
          customer: true,
          items: true,
        },
      });
    }

    if (data.discountPercent !== undefined) {
      const currentItems = (existing as any).items.map((i: any) => ({
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
      }));
      const totals = QuotationLogic.calculateTotals({
        items: currentItems,
        discountPercent,
        taxRatePercent: 11,
      });

      const status = totals.requiresManagerApproval
        ? 'Pending_Manager_Approval'
        : quotationData.status || existing.status;

      return this.prisma.quotation.update({
        where: { id },
        data: {
          ...quotationData,
          status,
          discountPercent: totals.discountPercent,
          discountAmount: totals.discountAmount,
          tax: totals.tax,
          totalAmount: totals.totalAmount,
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

  async approveDiscount(
    id: string,
    managerUserId: string,
    dto?: ApproveQuotationDiscountDto,
  ) {
    const quotation = await this.findOne(id);

    if (quotation.status !== 'Pending_Manager_Approval') {
      throw new BadRequestException(
        `Quotation ${quotation.quotationNumber} is not pending manager approval (current status: ${quotation.status})`,
      );
    }

    const updatedNotes = dto?.notes
      ? `${quotation.notes ? quotation.notes + '\n' : ''}[Manager Approval]: ${dto.notes}`
      : quotation.notes;

    return this.prisma.quotation.update({
      where: { id },
      data: {
        status: 'Sent',
        managerApprovedBy: managerUserId,
        managerApprovedAt: new Date(),
        notes: updatedNotes,
      },
      include: {
        customer: true,
        items: true,
        managerApprover: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
  }

  async rejectDiscount(
    id: string,
    managerUserId: string,
    dto: RejectQuotationDiscountDto,
  ) {
    const quotation = await this.findOne(id);

    if (quotation.status !== 'Pending_Manager_Approval') {
      throw new BadRequestException(
        `Quotation ${quotation.quotationNumber} is not pending manager approval`,
      );
    }

    return this.prisma.quotation.update({
      where: { id },
      data: {
        status: 'Rejected',
        rejectionReason: dto.reason,
      },
      include: {
        customer: true,
        items: true,
      },
    });
  }

  async accept(
    id: string,
    customerId: string | undefined,
    dto: AcceptQuotationDto,
  ) {
    const quotation = await this.findOne(id);

    if (customerId && quotation.customerId !== customerId) {
      throw new ForbiddenException(
        'You do not have permission to accept this quotation',
      );
    }

    if (quotation.status !== 'Sent') {
      throw new BadRequestException(
        `Only quotations with "Sent" status can be accepted by customer (current status: ${quotation.status})`,
      );
    }

    const updatedNotes = dto.notes
      ? `${quotation.notes ? quotation.notes + '\n' : ''}[Customer Note]: ${dto.notes}`
      : quotation.notes;

    return this.prisma.quotation.update({
      where: { id },
      data: {
        status: 'Accepted',
        poNumber: dto.poNumber || quotation.poNumber || null,
        poFileUrl: dto.poFileUrl || quotation.poFileUrl || null,
        customerAcceptedAt: new Date(),
        notes: updatedNotes,
      },
      include: {
        customer: true,
        items: true,
      },
    });
  }

  async reject(
    id: string,
    customerId: string | undefined,
    dto: RejectQuotationDto,
  ) {
    const quotation = await this.findOne(id);

    if (customerId && quotation.customerId !== customerId) {
      throw new ForbiddenException(
        'You do not have permission to reject this quotation',
      );
    }

    if (
      quotation.status === 'Accepted' ||
      quotation.status === 'Converted' ||
      quotation.status === 'Rejected'
    ) {
      throw new BadRequestException(
        `Cannot reject quotation that is already ${quotation.status}`,
      );
    }

    return this.prisma.quotation.update({
      where: { id },
      data: {
        status: 'Rejected',
        rejectionReason: dto.reason,
      },
      include: {
        customer: true,
        items: true,
      },
    });
  }

  async createRevision(id: string, dto: CreateQuotationRevisionDto) {
    const quotation = await this.findOne(id);

    const newVersion = (quotation.version || 1) + 1;
    const baseNumber = quotation.quotationNumber.replace(/-R\d+$/, '');
    const revisionNumber = `${baseNumber}-R${newVersion}`;

    const discountPercent =
      dto.discountPercent !== undefined
        ? dto.discountPercent
        : Number(quotation.discountPercent);

    const quotationItems = (quotation as any).items || [];
    const totals = QuotationLogic.calculateTotals({
      items: quotationItems.map((i: any) => ({
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
      })),
      discountPercent,
      taxRatePercent: 11,
    });

    const initialStatus = totals.requiresManagerApproval
      ? 'Pending_Manager_Approval'
      : 'Sent';

    const revisionNotes = dto.notes
      ? `${dto.notes}\n[Revised from ${quotation.quotationNumber} v${quotation.version}]`
      : `Revision v${newVersion} of ${quotation.quotationNumber}`;

    return this.prisma.quotation.create({
      data: {
        quotationNumber: revisionNumber,
        customerId: quotation.customerId,
        status: initialStatus,
        version: newVersion,
        subtotal: totals.subtotal,
        discountPercent: totals.discountPercent,
        discountAmount: totals.discountAmount,
        tax: totals.tax,
        totalAmount: totals.totalAmount,
        validUntil: quotation.validUntil,
        notes: revisionNotes,
        items: {
          create: quotationItems.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: Number(item.unitPrice) * item.quantity,
            notes: item.notes,
          })),
        },
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
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
    const quotationNumber = `REQ-${new Date().getFullYear()}-${(count + 1)
      .toString()
      .padStart(4, '0')}`;

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
