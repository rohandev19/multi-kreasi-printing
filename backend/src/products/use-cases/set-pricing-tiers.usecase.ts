import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SetPricingTiersDto } from '../dto/set-pricing-tiers.dto';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class SetPricingTiersUseCase {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async execute(productId: string, dto: SetPricingTiersDto, currentUserId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Produk tidak ditemukan');

    // Inside a transaction to replace old tiers
    await this.prisma.$transaction(async (tx) => {
      await tx.pricingTier.deleteMany({ where: { productId } });

      const createData = dto.tiers.map((t) => ({
        productId,
        minQuantity: t.minQuantity,
        maxQuantity: t.maxQuantity ?? null,
        unitPrice: t.unitPrice,
      }));

      await tx.pricingTier.createMany({ data: createData });
    });

    await this.audit.log({
      userId: currentUserId,
      action: 'PRODUCT_PRICING_UPDATED',
      entityType: 'Product',
      entityId: productId,
    });

    return { success: true, message: 'Harga tier berhasil diperbarui' };
  }
}
