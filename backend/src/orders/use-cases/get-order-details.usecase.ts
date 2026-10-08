import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

import { Prisma } from '@prisma/client';

@Injectable()
export class GetOrderDetailsUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(
    orderId: string,
    user?: { id: string; role: string; email?: string; sub?: string },
  ) {
    const whereClause: Prisma.OrderWhereInput = { id: orderId };
    
    // Prevent IDOR: If Customer, only query if it belongs to them
    if (user && user.role === 'Customer') {
      whereClause.customer = { email: user.email };
    }

    const order = await this.prisma.order.findFirst({
      where: whereClause,
      include: {
        customer: true,
        items: { include: { product: true } },
        timeline: { include: { user: true }, orderBy: { createdAt: 'desc' } },
        designFiles: true,
      },
    });

    if (!order) throw new NotFoundException('Pesanan tidak ditemukan');

    return order;
  }
}
