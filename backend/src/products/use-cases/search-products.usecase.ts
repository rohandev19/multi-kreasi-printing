import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchProductsDto } from '../dto/search-products.dto';

@Injectable()
export class SearchProductsUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(dto: SearchProductsDto) {
    const { page = 1, limit = 10, search, categoryId, status } = dto;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;

    const [total, items] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: { select: { name: true } },
          pricingTiers: true,
          images: { where: { isPrimary: true }, select: { url: true } }
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
