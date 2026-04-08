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
export class CompleteProductionUseCase {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async execute(
    jobId: string,
    currentUserId: string,
    passedQualityCheck: boolean,
    notes?: string,
  ) {
    const job = await this.prisma.productionJob.findUnique({
      where: { id: jobId },
    });
    if (!job) throw new NotFoundException('Production job not found');

    // Technically in a strict flow, it goes to Quality_Check first.
    // If we assume this use case is called after quality check:
    ProductionJobLogic.validateTransition(
      job.status,
      ProductionJobStatus.Quality_Check,
    );

    // Determine the next status based on QC
    const nextStatus = passedQualityCheck
      ? ProductionJobStatus.Completed
      : ProductionJobStatus.Failed;

    ProductionJobLogic.validateTransition(
      ProductionJobStatus.Quality_Check,
      nextStatus,
    );

    if (!job.startTime) {
      throw new BadRequestException(
        'Job has not started (no start time recorded)',
      );
    }

    const endTime = new Date();
    const durationSeconds = Math.round(
      (endTime.getTime() - job.startTime.getTime()) / 1000,
    );

    const updatedJob = await this.prisma.$transaction(async (tx) => {
      // First, temporarily move to Quality_Check in audit if we want, but here we just go straight to final status
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
        // Free the machine and record production time
        await tx.machine.update({
          where: { id: job.machineId },
          data: {
            status: MachineStatus.Available,
            productionTime: { increment: durationSeconds },
          },
        });
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

    return updatedJob;
  }
}
