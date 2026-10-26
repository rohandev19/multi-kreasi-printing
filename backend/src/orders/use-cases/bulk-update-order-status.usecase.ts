import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { BulkOrderStatusDto } from '../dto/bulk-orders.dto';
import { OrderLogic } from '../domain/order.entity';

@Injectable()
export class BulkUpdateOrderStatusUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async execute(dto: BulkOrderStatusDto, currentUserId: string) {
    if (!dto.ids || dto.ids.length === 0) {
      throw new BadRequestException(
        'Pilih minimal 1 pesanan untuk operasi massal',
      );
    }

    if (dto.ids.length > 500) {
      throw new BadRequestException('Maksimal 500 pesanan per operasi massal');
    }

    const updatedIds: string[] = [];
    const errors: { orderId: string; orderNumber?: string; reason: string }[] =
      [];

    // Fetch target orders
    const orders = await this.prisma.order.findMany({
      where: { id: { in: dto.ids } },
      select: { id: true, orderNumber: true, status: true },
    });

    const orderMap = new Map(orders.map((o) => [o.id, o]));

    for (const id of dto.ids) {
      const order = orderMap.get(id);
      if (!order) {
        errors.push({ orderId: id, reason: 'Pesanan tidak ditemukan' });
        continue;
      }

      if (order.status === dto.status) {
        updatedIds.push(id);
        continue;
      }

      // Check transition validity
      if (!OrderLogic.isValidTransition(order.status, dto.status)) {
        errors.push({
          orderId: id,
          orderNumber: order.orderNumber,
          reason: `Transisi dari status ${order.status} ke ${dto.status} tidak diizinkan`,
        });
        continue;
      }

      try {
        await this.prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id },
            data: { status: dto.status },
          });

          await tx.orderTimeline.create({
            data: {
              orderId: id,
              status: dto.status,
              notes: dto.reason || `Pembaruan status massal ke ${dto.status}`,
              createdBy: currentUserId,
            },
          });
        });

        updatedIds.push(id);
      } catch (err: any) {
        errors.push({
          orderId: id,
          orderNumber: order.orderNumber,
          reason: err.message || 'Gagal memperbarui pesanan',
        });
      }
    }

    // Consolidated single AuditLog entry for bulk operation (Req 32.9)
    if (updatedIds.length > 0) {
      await this.audit.log({
        userId: currentUserId,
        action: 'BULK_ORDER_STATUS_UPDATE',
        entityType: 'Order',
        entityId: updatedIds.join(','),
        newValue: {
          targetStatus: dto.status,
          count: updatedIds.length,
          affectedOrders: updatedIds,
          reason: dto.reason,
        },
      });
    }

    return {
      total: dto.ids.length,
      successCount: updatedIds.length,
      failedCount: errors.length,
      updatedIds,
      errors,
    };
  }
}
