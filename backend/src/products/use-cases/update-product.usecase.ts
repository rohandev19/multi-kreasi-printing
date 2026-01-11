import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProductDto } from '../dto/update-product.dto';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class UpdateProductUseCase {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async execute(id: string, dto: UpdateProductDto, currentUserId: string) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Produk tidak ditemukan');

    const updated = await this.prisma.product.update({
      where: { id },
      data: dto,
    });

    await this.audit.log({
      userId: currentUserId,
      action: 'PRODUCT_UPDATED',
      entityType: 'Product',
      entityId: id,
      oldValue: { basePrice: existing.basePrice, status: existing.status },
      newValue: { basePrice: updated.basePrice, status: updated.status },
    });

    return updated;
  }
}
