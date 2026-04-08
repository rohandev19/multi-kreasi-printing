import { Injectable, Logger } from '@nestjs/common';
import { createPrismaClient } from '../../prisma/prisma-client.helper';

@Injectable()
export class GetProductionStatusUseCase {
  private readonly logger = new Logger(GetProductionStatusUseCase.name);
  private prisma = createPrismaClient();

  async execute() {
    this.logger.log('Fetching Production Status...');

    // In Progress Jobs
    const inProgressJobs = await this.prisma.productionJob.count({
      where: { status: 'In_Progress' },
    });

    // Pending/Queued Jobs
    const queuedJobs = await this.prisma.productionJob.count({
      where: { status: 'Assigned' }, // Assuming 'Assigned' means waiting for machine
    });

    // Completed Jobs today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedJobsToday = await this.prisma.productionJob.count({
      where: {
        status: 'Completed',
        endTime: { gte: today },
      },
    });

    // Machine Utilization (mocked for MVP since we don't have deep machine tracking in Prisma)
    return {
      inProgressJobs,
      queuedJobs,
      completedJobsToday,
      machineUtilization: [
        { machineName: 'Printer A', utilization: 85 },
        { machineName: 'Printer B', utilization: 60 },
        { machineName: 'Cutter C', utilization: 92 },
      ],
    };
  }
}
