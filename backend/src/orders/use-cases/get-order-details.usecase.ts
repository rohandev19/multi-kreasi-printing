import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GetOrderDetailsUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(orderId: string, user?: { id: string, role: string }) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        items: { include: { product: true } },
        timeline: { include: { user: true }, orderBy: { createdAt: 'desc' } },
        designFile: true,
      },
    });

    if (!order) throw new NotFoundException('Pesanan tidak ditemukan');
    
    if (user && user.role === 'Customer' && order.customerId !== user.id) {
      throw new ForbiddenException('You do not have permission to view this order');
    }
    
    return order;
  }
}
