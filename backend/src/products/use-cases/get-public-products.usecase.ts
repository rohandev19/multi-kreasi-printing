import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  GetPublicProductsDto,
  SortByOption,
} from '../dto/get-public-products.dto';
import { ProductListResponseDto } from '../dto/product-list-response.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class GetPublicProductsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: GetPublicProductsDto): Promise<ProductListResponseDto> {
    const { search, categoryId, sortBy, page = 1, limit = 20 } = dto;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      status: { in: ['ACTIVE', 'Active'] },
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };

    switch (sortBy) {
      case SortByOption.PRICE_ASC:
        orderBy = { basePrice: 'asc' };
        break;
      case SortByOption.PRICE_DESC:
        orderBy = { basePrice: 'desc' };
        break;
      case SortByOption.NEWEST:
        orderBy = { createdAt: 'desc' };
        break;
      case SortByOption.POPULAR:
        // For now, let's just use createdAt if we don't have order count tracking easily available
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [products, total, categoriesData] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: true,
          images: {
            where: { isPrimary: true },
            take: 1,
          },
        },
      }),
      this.prisma.product.count({ where }),
      this.prisma.category.findMany({
        orderBy: { name: 'asc' },
      }),
    ]);

    return {
      data: products.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        basePrice: Number(p.basePrice),
        categoryId: p.categoryId,
        categoryName: p.category?.name,
        images: p.images.map((img: any) => ({
          url: img.url,
          isPrimary: img.isPrimary,
        })),
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      categories: categoriesData.map((c: any) => ({ id: c.id, name: c.name })),
    };
  }
}
