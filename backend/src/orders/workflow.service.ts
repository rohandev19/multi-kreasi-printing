import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  determineApprovalRequired(totalAmount: number): string {
    if (totalAmount < 2000000) {
      return 'Auto_Approved';
    } else if (totalAmount <= 10000000) {
      return 'Manager';
    } else {
      return 'Owner';
    }
  }

  async processOrderApproval(
    orderId: string,
    currentUserId: string,
  ): Promise<import('@prisma/client').Order> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new Error('Order not found');

    const amount = Number(order.totalAmount);
    const requiredRole = this.determineApprovalRequired(amount);

    if (requiredRole === 'Auto_Approved') {
      return this.prisma.$transaction(async (tx) => {
        const updated = await tx.order.update({
          where: { id: orderId },
          data: { status: 'Approved' },
        });

        await tx.orderTimeline.create({
          data: {
            orderId,
            status: 'Approved',
            notes: 'Auto-approved (Amount < 2M IDR)',
            createdBy: currentUserId,
          },
        });

        // Emit actual event for auto-approval
        this.eventEmitter.emit('order.approved', {
          orderId: updated.id,
          orderNumber: updated.orderNumber,
          customerId: updated.customerId,
          approvedBy: 'System (Auto)',
        });

        return updated;
      });
    } else {
      return this.prisma.$transaction(async (tx) => {
        const updated = await tx.order.update({
          where: { id: orderId },
          data: { status: 'Pending_Approval' },
        });

        await tx.orderTimeline.create({
          data: {
            orderId,
            status: 'Pending_Approval',
            notes: `Menunggu persetujuan dari ${requiredRole}`,
            createdBy: currentUserId,
          },
        });

        // Emit event for status change to Pending_Approval
        this.eventEmitter.emit('order.status.changed', {
          orderId: updated.id,
          orderNumber: updated.orderNumber,
          customerId: updated.customerId,
          oldStatus: order.status,
          newStatus: 'Pending_Approval',
        });

        return updated;
      });
    }
  }
}
