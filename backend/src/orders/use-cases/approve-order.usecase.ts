import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { WorkflowService } from '../workflow.service';
import { OrderLogic } from '../domain/order.entity';

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

    try {
      const updated = await this.prisma.$transaction(
        async (tx) => {
          const updatedOrder = await tx.order.update({
            where: { id: orderId, version: order.version }, // Pilar 1: Optimistic Locking
            data: { status: 'Approved', version: { increment: 1 } },
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

          const signature = OrderLogic.generateLedgerSignature(
            updatedOrder.id,
            updatedOrder.status,
            Number(updatedOrder.totalAmount),
          );

          await tx.orderLedger.create({
            data: {
              orderId: updatedOrder.id,
              status: updatedOrder.status,
              amount: updatedOrder.totalAmount,
              signature,
            },
          });

          return updatedOrder;
        },
        { timeout: 5000 },
      );

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
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025' // Record to update not found (Optimistic Locking failure)
      ) {
        throw new ConflictException(
          'Gagal menyetujui pesanan. Status atau versi pesanan telah diubah oleh pengguna lain (Race Condition). Silakan muat ulang data.',
        );
      }
      throw error;
    }
  }
}
