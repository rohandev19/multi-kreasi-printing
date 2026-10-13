import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { OrderLogic } from '../domain/order.entity';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class UpdateOrderStatusUseCase {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(
    orderId: string,
    dto: UpdateOrderStatusDto,
    currentUserId: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Pesanan tidak ditemukan');

    if (order.status === dto.status) {
      return order;
    }

    if (!OrderLogic.isValidTransition(order.status, dto.status)) {
      throw new BadRequestException(
        `Transisi status dari ${order.status} ke ${dto.status} tidak valid`,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: dto.status },
        include: { items: true },
      });

      await tx.orderTimeline.create({
        data: {
          orderId,
          status: dto.status,
          notes: dto.notes,
          createdBy: currentUserId,
        },
      });

      if (dto.status === 'In_Production') {
        const existingJob = await tx.productionJob.findFirst({
          where: { orderId },
        });
        if (!existingJob) {
          const count = await tx.productionJob.count();
          const year = new Date().getFullYear();
          const jobNumber = `PROD-${year}-${(count + 1).toString().padStart(4, '0')}`;
          await tx.productionJob.create({
            data: {
              jobNumber,
              orderId,
              status: 'In_Progress',
              startTime: new Date(),
            },
          });
        } else {
          await tx.productionJob.update({
            where: { id: existingJob.id },
            data: {
              status: 'In_Progress',
              startTime: existingJob.startTime || new Date(),
            },
          });
        }
      } else if (dto.status === 'Approved') {
        const existingJob = await tx.productionJob.findFirst({
          where: { orderId },
        });
        if (!existingJob) {
          const count = await tx.productionJob.count();
          const year = new Date().getFullYear();
          const jobNumber = `PROD-${year}-${(count + 1).toString().padStart(4, '0')}`;
          await tx.productionJob.create({
            data: {
              jobNumber,
              orderId,
              status: 'Queue',
            },
          });
        }
      }

      return updatedOrder;
    });

    await this.audit.log({
      userId: currentUserId,
      action: 'ORDER_STATUS_UPDATED',
      entityType: 'Order',
      entityId: orderId,
      oldValue: { status: order.status },
      newValue: { status: updated.status },
    });

    // Emit event for real-time notification
    this.eventEmitter.emit('order.status.changed', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      oldStatus: order.status,
      newStatus: dto.status,
    });

    return updated;
  }
}
