import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GetOrderProofsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(orderId: string, currentUser: { id: string; role: string }) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    if (currentUser.role === 'Customer') {
      const user = await this.prisma.user.findUnique({
        where: { id: currentUser.id },
      });
      if (user && order.customer.email && user.email !== order.customer.email) {
        throw new ForbiddenException(
          'Anda tidak memiliki akses ke berkas proof pesanan ini',
        );
      }
    }

    return this.prisma.proof.findMany({
      where: { orderId },
      include: {
        designer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { version: 'desc' },
    });
  }
}
