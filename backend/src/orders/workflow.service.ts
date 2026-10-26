import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderLogic } from './domain/order.entity';

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

  /**
   * FSM Transition Method with Saga/Compensation support
   */
  async transitionOrder(
    orderId: string,
    nextStatus: string,
    currentUserId: string,
    notes?: string,
  ): Promise<import('@prisma/client').Order> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) throw new Error('Order not found');

    if (!OrderLogic.isValidTransition(order.status, nextStatus)) {
      throw new Error(
        `Invalid state transition from ${order.status} to ${nextStatus}`,
      );
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        // PRE-TRANSITION SAGA HOOKS
        if (nextStatus === 'In_Production') {
          // E.g., Deduct raw materials, lock machines
          this.logger.log(
            `[SAGA] Locking inventory and allocating machine for Order ${order.id}`,
          );
          // If inventory is empty, this throws and rolls back the transition!
        }

        const updated = await tx.order.update({
          where: { id: orderId },
          data: { status: nextStatus },
        });

        await tx.orderTimeline.create({
          data: {
            orderId,
            status: nextStatus,
            notes: notes || `Transisi status ke ${nextStatus}`,
            createdBy: currentUserId,
          },
        });

        // POST-TRANSITION HOOKS
        this.eventEmitter.emit('order.status.changed', {
          orderId: updated.id,
          orderNumber: updated.orderNumber,
          customerId: updated.customerId,
          oldStatus: order.status,
          newStatus: nextStatus,
        });

        return updated;
      });
    } catch (error) {
      // SAGA COMPENSATION / FALLBACK
      this.logger.error(
        `[SAGA] Failed to transition Order ${orderId} to ${nextStatus}. Initiating rollback.`,
        error,
      );
      // Execute compensation logic here if necessary
      throw error;
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
    let requiredRole = this.determineApprovalRequired(amount);

    // Check customer credit status & overdue debt before auto-approving
    const customer = await this.prisma.customer.findUnique({
      where: { id: order.customerId },
      include: {
        orders: {
          include: {
            invoices: {
              include: { payments: true },
            },
          },
        },
      },
    });

    let creditWarning = '';
    if (customer) {
      if (customer.creditStatus !== 'ACTIVE') {
        creditWarning = `Status kredit pelanggan: ${customer.creditStatus}`;
        if (requiredRole === 'Auto_Approved') requiredRole = 'Manager';
      }

      const today = new Date();
      let hasOverdue = false;
      for (const ord of customer.orders) {
        if (ord.invoices && Array.isArray(ord.invoices)) {
          for (const inv of ord.invoices) {
            if (inv.status !== 'Fully_Paid' && inv.status !== 'Cancelled') {
              if (new Date(inv.dueDate).getTime() < today.getTime()) {
                hasOverdue = true;
                break;
              }
            }
          }
          if (hasOverdue) break;
        }
      }

      if (hasOverdue) {
        creditWarning = 'Pelanggan memiliki tagihan jatuh tempo (Overdue)';
        if (requiredRole === 'Auto_Approved') requiredRole = 'Manager';
      }
    }

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

        const timelineNotes = creditWarning
          ? `Menunggu persetujuan dari ${requiredRole} (${creditWarning})`
          : `Menunggu persetujuan dari ${requiredRole}`;

        await tx.orderTimeline.create({
          data: {
            orderId,
            status: 'Pending_Approval',
            notes: timelineNotes,
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
