import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchCustomersDto } from '../dto/search-customers.dto';

@Injectable()
export class SearchCustomersUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(dto: SearchCustomersDto) {
    const { page = 1, limit = 10, search, loyaltyTier } = dto;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (loyaltyTier) where.loyaltyTier = loyaltyTier;

    const [total, items] = await Promise.all([
      this.prisma.customer.count({ where }),
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
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
