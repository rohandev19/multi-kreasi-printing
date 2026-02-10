import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductionJobLogic, ProductionJobStatus } from '../domain/production-job.entity';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class CreateReworkJobUseCase {
  private readonly logger = new Logger(CreateReworkJobUseCase.name);

  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async execute(failedJobId: string, currentUserId: string, reason: string) {
    const job = await this.prisma.productionJob.findUnique({ where: { id: failedJobId } });
    if (!job) throw new NotFoundException('Production job not found');

    if (job.status !== ProductionJobStatus.Failed) {
      throw new BadRequestException('Can only create rework for failed jobs');
    }

    ProductionJobLogic.validateTransition(job.status, ProductionJobStatus.Rework);

    const updatedJob = await this.prisma.$transaction(async (tx) => {
      // Mark original job as rework to indicate a rework has been spawned (if we used Rework status)
      // Actually the requirement says [Failed -> Rework] transition. Let's just create a new job and update the old one.
      await tx.productionJob.update({
        where: { id: failedJobId },
        data: { status: ProductionJobStatus.Rework, notes: (job.notes ? job.notes + '\n' : '') + `Rework created due to: ${reason}` },
      });

      const count = await tx.productionJob.count();
      const newJobNumber = ProductionJobLogic.generateJobNumber(count + 1);

      const newJob = await tx.productionJob.create({
        data: {
          jobNumber: newJobNumber,
          orderId: job.orderId,
          status: ProductionJobStatus.Queue,
          notes: `Rework for job ${job.jobNumber}. Reason: ${reason}`,
        }
      });

      return newJob;
    });

    await this.audit.log({
      userId: currentUserId,
      action: 'REWORK_CREATED',
      entityType: 'ProductionJob',
      entityId: updatedJob.id,
      oldValue: null,
      newValue: { failedJobId, reason },
    });

    return updatedJob;
  }
}
