import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  constructor(private prisma: PrismaService) {}

  async determineApprovalRequired(totalAmount: number): Promise<string> {
    if (totalAmount < 2000000) {
      return 'Auto_Approved';
    } else if (totalAmount <= 10000000) {
      return 'Manager';
    } else {
      return 'Owner';
    }
  }

  async processOrderApproval(orderId: string, currentUserId: string): Promise<any> {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error('Order not found');

    const amount = Number(order.totalAmount);
    const requiredRole = await this.determineApprovalRequired(amount);

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

        // Simulating notification sending
        this.logger.log(`Notification sent for auto-approval of order ${order.orderNumber}`);

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

        // Simulating notification sending
        this.logger.log(`Notification sent to ${requiredRole} for approval of order ${order.orderNumber}`);

        return updated;
      });
    }
  }
}
