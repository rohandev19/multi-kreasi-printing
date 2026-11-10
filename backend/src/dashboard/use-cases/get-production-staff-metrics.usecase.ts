import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DashboardMetricsResponse } from '../dto/dashboard-metrics-response.dto';

@Injectable()
export class GetProductionStaffMetricsUseCase {
  private readonly logger = new Logger(GetProductionStaffMetricsUseCase.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string): Promise<DashboardMetricsResponse> {
    this.logger.log(`Fetching Production Staff Metrics for user ${userId}...`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    try {
      const [
        queuedJobs,
        inProgressJobs,
        completedToday,
        completedYesterday,
        totalMachines,
        availableMachines,
      ] = await Promise.all([
        this.prisma.productionJob.count({
          where: { status: { in: ['Queue', 'Queued', 'Pending'] } },
        }),
        this.prisma.productionJob.count({
          where: {
            status: 'In_Progress',
            assignedTo: userId,
          },
        }),
        this.prisma.productionJob.count({
          where: {
            status: 'Completed',
            updatedAt: { gte: today },
          },
        }),
        this.prisma.productionJob.count({
          where: {
            status: 'Completed',
            updatedAt: { gte: yesterday, lt: today },
          },
        }),
        this.prisma.machine.count(),
        this.prisma.machine.count({
          where: { status: 'Available' },
        }),
      ]);

      return {
        widgets: [
          {
            id: 'production-queued',
            title: 'Jobs in Queue',
            type: 'stat',
            value: queuedJobs,
            icon: 'clock',
            color: 'amber',
          },
          {
            id: 'production-in-progress',
            title: 'My Active Jobs',
            type: 'stat',
            value: inProgressJobs,
            icon: 'cogs',
            color: 'blue',
          },
          {
            id: 'production-completed',
            title: 'Completed Today',
            type: 'stat',
            value: completedToday,
            trend: {
              value:
                completedYesterday > 0
                  ? ((completedToday - completedYesterday) /
                      completedYesterday) *
                    100
                  : 0,
              isPositive: completedToday >= completedYesterday,
              label: 'vs yesterday',
            },
            icon: 'check',
            color: 'emerald',
          },
          {
            id: 'production-machines',
            title: 'Available Machines',
            type: 'stat',
            value: `${availableMachines}/${totalMachines}`,
            icon: 'server',
            color: 'indigo',
          },
        ],
      };
    } catch (error) {
      this.logger.error('Error fetching production staff metrics', error);
      return { widgets: [] };
    }
  }
}
