import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GetOrderDetailsUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        items: { include: { product: true } },
        timeline: { include: { user: true }, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!order) throw new NotFoundException('Pesanan tidak ditemukan');
    return order;
  }
}
