import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ProductionJobLogic,
  ProductionJobStatus,
} from '../domain/production-job.entity';
import { MachineStatus } from '../domain/machine.entity';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class CompleteProductionUseCase {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(
    jobId: string,
    currentUserId: string,
    passedQualityCheck: boolean,
    notes?: string,
  ) {
    const job = await this.prisma.productionJob.findUnique({
      where: { id: jobId },
      include: { order: true },
    });
    if (!job) throw new NotFoundException('Production job not found');

    const nextStatus = passedQualityCheck
      ? ProductionJobStatus.Completed
      : ProductionJobStatus.Failed;

    if (job.status === nextStatus) {
      return job;
    }

    ProductionJobLogic.validateTransition(job.status, nextStatus);

    const startTime = job.startTime || job.createdAt || new Date();
    const endTime = new Date();
    const durationSeconds = Math.max(
      0,
      Math.round((endTime.getTime() - startTime.getTime()) / 1000),
    );

    const updatedJob = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.productionJob.update({
        where: { id: jobId },
        data: {
          status: nextStatus,
          endTime,
          notes: notes
            ? job.notes
              ? job.notes + '\n' + notes
              : notes
            : job.notes,
        },
      });

      if (job.machineId) {
        await tx.machine.update({
          where: { id: job.machineId },
          data: {
            status: MachineStatus.Available,
            productionTime: { increment: durationSeconds },
          },
        });
      }

      // Update Order status when production completes!
      if (job.orderId) {
        if (passedQualityCheck) {
          await tx.order.update({
            where: { id: job.orderId },
            data: { status: 'Completed' },
          });

          await tx.orderTimeline.create({
            data: {
              orderId: job.orderId,
              status: 'Completed',
              notes: 'Pekerjaan produksi selesai dan lolos pemeriksaan mutu (QC Passed). Pesanan siap dikirim.',
              createdBy: currentUserId,
            },
          });
        } else {
          await tx.order.update({
            where: { id: job.orderId },
            data: { status: 'Quality_Check' },
          });

          await tx.orderTimeline.create({
            data: {
              orderId: job.orderId,
              status: 'Quality_Check',
              notes: notes
                ? `Pemeriksaan kualitas membutuhkan revisi/perbaikan: ${notes}`
                : 'Pemeriksaan kualitas membutuhkan revisi/perbaikan.',
              createdBy: currentUserId,
            },
          });
        }
      }

      return updated;
    });

    await this.audit.log({
      userId: currentUserId,
      action: passedQualityCheck ? 'JOB_COMPLETED' : 'JOB_FAILED',
      entityType: 'ProductionJob',
      entityId: jobId,
      oldValue: { status: job.status },
      newValue: { status: updatedJob.status, endTime: updatedJob.endTime },
    });

    if (job.orderId && passedQualityCheck) {
      this.eventEmitter.emit('order.status.changed', {
        orderId: job.orderId,
        orderNumber: job.order?.orderNumber,
        customerId: job.order?.customerId,
        oldStatus: job.order?.status,
        newStatus: 'Completed',
      });
      this.eventEmitter.emit('production.completed', {
        jobId: job.id,
        orderId: job.orderId,
      });
    }

    return updatedJob;
  }
}
