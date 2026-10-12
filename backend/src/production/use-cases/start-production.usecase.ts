import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ProductionJobLogic,
  ProductionJobStatus,
} from '../domain/production-job.entity';
import { MachineStatus } from '../domain/machine.entity';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class StartProductionUseCase {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async execute(jobId: string, currentUserId: string) {
    const job = await this.prisma.productionJob.findUnique({
      where: { id: jobId },
      include: { order: true },
    });
    if (!job) throw new NotFoundException('Production job not found');

    // Production Lock: Verify digital proof status
    if (job.order) {
      if (
        job.order.status === 'Proof_Pending_Approval' ||
        job.order.status === 'Proof_Rejected'
      ) {
        throw new BadRequestException(
          'Pekerjaan cetak terkunci: Bukti cetak (Proof) belum disetujui oleh pelanggan.',
        );
      }

      const pendingProofsCount = await this.prisma.proof.count({
        where: {
          orderId: job.orderId,
          status: { in: ['Pending_Approval', 'Rejected'] },
        },
      });

      if (pendingProofsCount > 0) {
        throw new BadRequestException(
          'Pekerjaan cetak terkunci: Terdapat bukti cetak (Proof) yang masih menunggu persetujuan atau revisi pelanggan.',
        );
      }
    }

    ProductionJobLogic.validateTransition(
      job.status,
      ProductionJobStatus.In_Progress,
    );

    if (!job.machineId) {
      throw new BadRequestException(
        'Cannot start job without an assigned machine',
      );
    }

    const updatedJob = await this.prisma.$transaction(async (tx) => {
      // Update machine status
      await tx.machine.update({
        where: { id: job.machineId! },
        data: { status: MachineStatus.In_Use },
      });

      // Update job status and startTime
      const updated = await tx.productionJob.update({
        where: { id: jobId },
        data: {
          status: ProductionJobStatus.In_Progress,
          startTime: new Date(),
        },
      });

      return updated;
    });

    await this.audit.log({
      userId: currentUserId,
      action: 'JOB_STARTED',
      entityType: 'ProductionJob',
      entityId: jobId,
      oldValue: { status: job.status },
      newValue: { status: updatedJob.status, startTime: updatedJob.startTime },
    });

    return updatedJob;
  }
}
