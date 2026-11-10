import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GetProductionStatusUseCase {
  private readonly logger = new Logger(GetProductionStatusUseCase.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    this.logger.log('Fetching Production Status...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [inProgressJobs, queuedJobs, completedJobsToday] = await Promise.all([
      this.prisma.productionJob.count({
        where: { status: 'In_Progress' },
      }),
      this.prisma.productionJob.count({
        where: { status: { in: ['Assigned', 'Pending', 'Queued'] } },
      }),
      this.prisma.productionJob.count({
        where: {
          status: 'Completed',
          endTime: { gte: today },
        },
      }),
    ]);

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
