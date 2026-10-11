import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductDetailResponseDto } from '../dto/product-detail-response.dto';
import { CacheService } from '../../cache/cache.service';

@Injectable()
export class GetPublicProductDetailUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async execute(id: string): Promise<ProductDetailResponseDto> {
    const cacheKey = `product:detail:${id}`;
    const cachedData = await this.cache.get<ProductDetailResponseDto>(cacheKey);

    if (cachedData) {
      return cachedData;
    }

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

    const responseData = {
      product: {
        id: product.id,
        sku: product.sku,
        name: product.name,
        description: product.description || '',
        basePrice: Number(product.basePrice),
        unitOfMeasure: product.unitOfMeasure,
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

    // Store in cache for 1 hour (3600 seconds)
    await this.cache.set(cacheKey, responseData, 3600);

    return responseData;
  }
}
