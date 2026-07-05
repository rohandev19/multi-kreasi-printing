import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductDetailResponseDto } from '../dto/product-detail-response.dto';

@Injectable()
export class GetPublicProductDetailUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<ProductDetailResponseDto> {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        status: { in: ['ACTIVE', 'Active'] },
      },
      include: {
        category: true,
        images: {
          orderBy: { isPrimary: 'desc' },
        },
        pricingTiers: {
          orderBy: { minQuantity: 'asc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(
        `Product with ID ${id} not found or not active`,
      );
    }

    return {
      product: {
        id: product.id,
        name: product.name,
        description: product.description || '',
        basePrice: Number(product.basePrice),
        categoryId: product.categoryId,
        categoryName: product.category?.name,
        images: product.images.map((img) => ({
          url: img.url,
          isPrimary: img.isPrimary,
        })),
      },
      pricingTiers: product.pricingTiers.map((tier) => ({
        minQuantity: tier.minQuantity,
        pricePerUnit: Number(tier.unitPrice),
      })),
    };
  }
}
