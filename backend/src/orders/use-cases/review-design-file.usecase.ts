import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import {
  DesignFileLogic,
  DesignFileStatus,
} from '../domain/design-file.entity';
import { AuditService } from '../../audit/audit.service';
import { ReviewDesignFileDto } from '../dto/review-design-file.dto';

@Injectable()
export class ReviewDesignFileUseCase {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(
    fileId: string,
    dto: ReviewDesignFileDto,
    currentUserId: string,
  ) {
    const file = await this.prisma.designFile.findUnique({
      where: { id: fileId },
      include: { order: true },
    });
    if (!file) throw new NotFoundException('File desain tidak ditemukan');

    if (!DesignFileLogic.isValidTransition(file.status, dto.status)) {
      throw new BadRequestException(
        `Transisi status file dari ${file.status} ke ${dto.status} tidak valid`,
      );
    }

    if (
      (dto.status === DesignFileStatus.Rejected ||
        dto.status === DesignFileStatus.Revision_Required) &&
      !dto.notes
    ) {
      throw new BadRequestException('Alasan penolakan atau revisi harus diisi');
    }

    const { updatedFile, updatedOrder } = await this.prisma.$transaction(
      async (tx) => {
        const updated = await tx.designFile.update({
          where: { id: fileId },
          data: {
            status: dto.status,
            notes: dto.notes,
          },
        });

        let orderStatus = file.order.status;
        if (dto.status === DesignFileStatus.Approved) {
          orderStatus = 'Design_Approved';
        } else if (
          dto.status === DesignFileStatus.Rejected ||
          dto.status === DesignFileStatus.Revision_Required
        ) {
          orderStatus = 'Design_In_Progress';
        }

        let updatedOrderInfo = file.order;
        if (orderStatus !== file.order.status) {
          updatedOrderInfo = await tx.order.update({
            where: { id: file.orderId },
            data: { status: orderStatus },
          });

          await tx.orderTimeline.create({
            data: {
              orderId: file.orderId,
              status: orderStatus,
              notes: `Status diperbarui karena file desain ${updated.originalName} direview (${dto.status})`,
              createdBy: currentUserId,
            },
          });
        }

        return { updatedFile: updated, updatedOrder: updatedOrderInfo };
      },
    );

    await this.audit.log({
      userId: currentUserId,
      action: 'DESIGN_FILE_REVIEWED',
      entityType: 'DesignFile',
      entityId: fileId,
      oldValue: { status: file.status },
      newValue: { status: updatedFile.status, notes: dto.notes },
    });

    // Emit event for real-time notification to the uploader
    this.eventEmitter.emit('design.reviewed', {
      fileId: file.id,
      orderId: file.orderId,
      fileName: file.originalName,
      uploadedByUserId: file.uploadedBy,
      newStatus: dto.status,
      notes: dto.notes,
    });

    if (updatedOrder.status !== file.order.status) {
      this.eventEmitter.emit('order.status.changed', {
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        customerId: updatedOrder.customerId,
        oldStatus: file.order.status,
        newStatus: updatedOrder.status,
      });
    }

    return updatedFile;
  }
}
