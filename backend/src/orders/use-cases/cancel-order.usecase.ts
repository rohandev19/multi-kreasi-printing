import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { OrderLogic } from '../domain/order.entity';

@Injectable()
export class CancelOrderUseCase {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async execute(orderId: string, reason: string, currentUserId: string) {
    if (!reason) {
      throw new BadRequestException('Alasan pembatalan harus diisi');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Pesanan tidak ditemukan');

    if (!OrderLogic.isValidTransition(order.status, 'Cancelled')) {
      throw new BadRequestException(
        `Pesanan dalam status ${order.status} tidak dapat dibatalkan`,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: 'Cancelled' },
        include: { items: true },
      });

      await tx.orderTimeline.create({
        data: {
          orderId,
          status: 'Cancelled',
          notes: `Dibatalkan: ${reason}`,
          createdBy: currentUserId,
        },
      });

      return updatedOrder;
    });

    await this.audit.log({
      userId: currentUserId,
      action: 'ORDER_CANCELLED',
      entityType: 'Order',
      entityId: orderId,
      oldValue: { status: order.status },
      newValue: { status: updated.status, reason },
    });

    return updated;
  }
}
