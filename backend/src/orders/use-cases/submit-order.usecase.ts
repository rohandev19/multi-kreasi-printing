import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WorkflowService } from '../workflow.service';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class SubmitOrderUseCase {
  constructor(
    private prisma: PrismaService,
    private workflow: WorkflowService,
    private audit: AuditService
  ) {}

  async execute(orderId: string, currentUserId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Pesanan tidak ditemukan');

    if (order.status !== 'Draft') {
      throw new BadRequestException('Hanya pesanan berstatus Draft yang dapat disubmit');
    }

    const result = await this.workflow.processOrderApproval(orderId, currentUserId);

    await this.audit.log({
      userId: currentUserId,
      action: 'ORDER_SUBMITTED',
      entityType: 'Order',
      entityId: orderId,
      oldValue: { status: order.status },
      newValue: { status: result.status },
    });

    return result;
  }
}
