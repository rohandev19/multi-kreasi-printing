import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderLogic } from '../domain/order.entity';
import { AuditService } from '../../audit/audit.service';
import { PricingTierLogic } from '../../products/domain/pricing-tier';

@Injectable()
export class CreateOrderUseCase {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async execute(dto: CreateOrderDto, currentUserId: string) {
    if (dto.items.length === 0)
      throw new BadRequestException('Order must have at least one item');

    let finalCustomerId = dto.customerId;

    if (!finalCustomerId) {
      // Find current user
      const currentUser = await this.prisma.user.findUnique({
        where: { id: currentUserId },
      });
      if (!currentUser) throw new BadRequestException('User tidak ditemukan');

      // Check if they have a Customer profile
      let customer = await this.prisma.customer.findFirst({
        where: { email: currentUser.email },
      });

      // If not, create one automatically
      if (!customer) {
        customer = await this.prisma.customer.create({
          data: {
            companyName: currentUser.fullName || 'Customer Individual',
            email: currentUser.email,
            loyaltyTier: 'Bronze',
          },
        });
      }
      finalCustomerId = customer.id;
    } else {
      const customer = await this.prisma.customer.findUnique({
        where: { id: finalCustomerId },
      });
      if (!customer) throw new BadRequestException('Customer tidak ditemukan');
    }

    // Fetch product details for validation and pricing
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { pricingTiers: true },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('Satu atau lebih produk tidak ditemukan');
    }

    const orderItemsData = dto.items.map((itemDto) => {
      const product = products.find((p) => p.id === itemDto.productId)!;
      if (product.status !== 'Active') {
        throw new BadRequestException(`Produk ${product.name} tidak aktif`);
      }

      const unitPrice =
        product.pricingTiers.length > 0
          ? PricingTierLogic.calculateUnitPrice(
              product.pricingTiers.map((t) => ({
                minQuantity: t.minQuantity,
                maxQuantity: t.maxQuantity,
                unitPrice: Number(t.unitPrice),
              })),
              itemDto.quantity,
            )
          : Number(product.basePrice);

      const subtotal = unitPrice * itemDto.quantity;
      return {
        productId: product.id,
        quantity: itemDto.quantity,
        unitPrice,
        subtotal,
        notes: itemDto.notes,
      };
    });

    const { subtotal, tax, total } = OrderLogic.calculateTotal(orderItemsData);
    const orderNumber = OrderLogic.generateOrderNumber();

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber,
          customerId: finalCustomerId,
          priority: dto.priority || 'Normal',
          subtotal,
          tax,
          shipping: 0, // Set to 0 for MVP
          totalAmount: total,
          estimatedDeliveryDate: dto.estimatedDeliveryDate
            ? new Date(dto.estimatedDeliveryDate)
            : null,
          notes: dto.notes,
          status: 'Draft',
          items: {
            create: orderItemsData,
          },
          timeline: {
            create: {
              status: 'Draft',
              createdBy: currentUserId,
              notes: 'Pesanan dibuat (Draft)',
            },
          },
        },
        include: { items: true, timeline: true },
      });

      return created;
    });

    await this.audit.log({
      userId: currentUserId,
      action: 'ORDER_CREATED',
      entityType: 'Order',
      entityId: order.id,
      newValue: { orderNumber: order.orderNumber, total: order.totalAmount },
    });

    return order;
  }
}
