import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductionJobLogic, ProductionJobStatus } from '../domain/production-job.entity';
import { MachineStatus } from '../domain/machine.entity';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class StartProductionUseCase {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async execute(jobId: string, currentUserId: string) {
    const job = await this.prisma.productionJob.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Production job not found');

    ProductionJobLogic.validateTransition(job.status, ProductionJobStatus.In_Progress);

    if (!job.machineId) {
      throw new BadRequestException('Cannot start job without an assigned machine');
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
      entityName: 'ProductionJob',
      entityId: jobId,
      oldData: { status: job.status },
      newData: { status: updatedJob.status, startTime: updatedJob.startTime },
    });

    return updatedJob;
  }
}
