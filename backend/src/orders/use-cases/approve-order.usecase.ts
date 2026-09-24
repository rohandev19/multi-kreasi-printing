import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { WorkflowService } from '../workflow.service';

@Injectable()
export class ApproveOrderUseCase {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private workflow: WorkflowService,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(
    orderId: string,
    currentUserId: string,
    currentUserRole: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Pesanan tidak ditemukan');

    if (order.status !== 'Pending_Approval') {
      throw new BadRequestException(
        `Pesanan dalam status ${order.status} tidak dapat disetujui`,
      );
    }

    const requiredRole = this.workflow.determineApprovalRequired(
      Number(order.totalAmount),
    );
    if (requiredRole === 'Owner' && currentUserRole !== 'Owner') {
      throw new ForbiddenException(
        'Persetujuan Owner diperlukan untuk nominal pesanan ini',
      );
    }
    if (
      requiredRole === 'Manager' &&
      !['Manager', 'Owner'].includes(currentUserRole)
    ) {
      throw new ForbiddenException(
        'Persetujuan Manager diperlukan untuk nominal pesanan ini',
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: 'Approved' },
        include: { items: true },
      });

      await tx.orderTimeline.create({
        data: {
          orderId,
          status: 'Approved',
          notes: `Disetujui oleh ${currentUserRole}`,
          createdBy: currentUserId,
        },
      });

      return updatedOrder;
    });

    await this.audit.log({
      userId: currentUserId,
      action: 'ORDER_APPROVED',
      entityType: 'Order',
      entityId: orderId,
      oldValue: { status: order.status },
      newValue: { status: updated.status },
    });

    this.eventEmitter.emit('order.approved', {
      orderId: updated.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      approvedBy: currentUserRole,
    });

    return updated;
  }
}
