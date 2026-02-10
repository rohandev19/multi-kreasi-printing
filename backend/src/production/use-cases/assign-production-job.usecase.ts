import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductionJobLogic, ProductionJobStatus } from '../domain/production-job.entity';
import { MachineLogic, MachineStatus } from '../domain/machine.entity';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class AssignProductionJobUseCase {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async execute(jobId: string, machineId: string, assigneeId: string, currentUserId: string) {
    const job = await this.prisma.productionJob.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Production job not found');

    const machine = await this.prisma.machine.findUnique({ where: { id: machineId } });
    if (!machine) throw new NotFoundException('Machine not found');

    if (!MachineLogic.canAssignJob(machine.status as MachineStatus)) {
      throw new BadRequestException(`Machine is currently ${machine.status} and cannot be assigned`);
    }

    ProductionJobLogic.validateTransition(job.status, ProductionJobStatus.Assigned);

    const updatedJob = await this.prisma.productionJob.update({
      where: { id: jobId },
      data: {
        status: ProductionJobStatus.Assigned,
        machineId,
        assignedTo: assigneeId,
      },
    });

    await this.audit.log({
      userId: currentUserId,
      action: 'JOB_ASSIGNED',
      entityType: 'ProductionJob',
      entityId: jobId,
      oldValue: { status: job.status, machineId: job.machineId, assignedTo: job.assignedTo },
      newValue: { status: updatedJob.status, machineId, assignedTo: assigneeId },
    });

    return updatedJob;
  }
}
