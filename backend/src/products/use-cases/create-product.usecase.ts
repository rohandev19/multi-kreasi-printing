import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class CreateProductUseCase {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async execute(dto: CreateProductDto, currentUserId: string) {
    const existing = await this.prisma.product.findUnique({
      where: { sku: dto.sku },
    });
    if (existing) throw new ConflictException('SKU produk sudah terdaftar');

    const product = await this.prisma.product.create({
      data: {
        sku: dto.sku,
        name: dto.name,
        description: dto.description,
        categoryId: dto.categoryId,
        basePrice: dto.basePrice,
        unitOfMeasure: dto.unitOfMeasure,
        status: 'Active',
      },
    });

    await this.audit.log({
      userId: currentUserId,
      action: 'PRODUCT_CREATED',
      entityType: 'Product',
      entityId: product.id,
      newValue: { sku: product.sku, name: product.name },
    });

    return product;
  }
}
