import { Injectable, Logger } from '@nestjs/common';
import { createPrismaClient } from '../../prisma/prisma-client.helper';
import { DashboardMetricsResponse } from '../dto/dashboard-metrics-response.dto';

@Injectable()
export class GetProductionStaffMetricsUseCase {
  private readonly logger = new Logger(GetProductionStaffMetricsUseCase.name);
  private prisma = createPrismaClient();

  async execute(userId: string): Promise<DashboardMetricsResponse> {
    this.logger.log(`Fetching Production Staff Metrics for user ${userId}...`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    try {
      // 1. Jobs in Queue (status 'Queue' or 'Pending')
      const queuedJobs = await this.prisma.productionJob.count({
        where: { status: { in: ['Queue', 'Pending'] } },
      });

      // 2. Jobs In Progress (assigned to current user)
      const inProgressJobs = await this.prisma.productionJob.count({
        where: {
          status: 'In_Progress',
          assignedTo: userId,
        },
      });

      // 3. Completed Jobs Today
      const completedToday = await this.prisma.productionJob.count({
        where: {
          status: 'Completed',
          updatedAt: { gte: today },
        },
      });

      const completedYesterday = await this.prisma.productionJob.count({
        where: {
          status: 'Completed',
          updatedAt: { gte: yesterday, lt: today },
        },
      });

      // 4. Machine Availability
      const totalMachines = await this.prisma.machine.count();
      const availableMachines = await this.prisma.machine.count({
        where: { status: 'Available' },
      });

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
