import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DashboardMetricsResponse } from '../dto/dashboard-metrics-response.dto';

@Injectable()
export class GetDesignerMetricsUseCase {
  private readonly logger = new Logger(GetDesignerMetricsUseCase.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<DashboardMetricsResponse> {
    this.logger.log('Fetching Designer Metrics...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    try {
      const [
        pendingReviews,
        approvedToday,
        approvedYesterday,
        revisionRequests,
        activeProjects,
      ] = await Promise.all([
        this.prisma.designFile.count({
          where: { status: 'Manual_Review' },
        }),
        this.prisma.designFile.count({
          where: {
            status: 'Approved',
            updatedAt: { gte: today },
          },
        }),
        this.prisma.designFile.count({
          where: {
            status: 'Approved',
            updatedAt: { gte: yesterday, lt: today },
          },
        }),
        this.prisma.designFile.count({
          where: {
            status: { in: ['Rejected', 'Revision_Required'] },
          },
        }),
        this.prisma.order.count({
          where: { status: 'Design' },
        }),
      ]);

      return {
        widgets: [
          {
            id: 'designer-pending',
            title: 'Pending Reviews',
            type: 'stat',
            value: pendingReviews,
            icon: 'clock',
            color: 'amber',
          },
          {
            id: 'designer-approved',
            title: 'Approved Today',
            type: 'stat',
            value: approvedToday,
            trend: {
              value:
                approvedYesterday > 0
                  ? ((approvedToday - approvedYesterday) / approvedYesterday) *
                    100
                  : 0,
              isPositive: approvedToday >= approvedYesterday,
              label: 'vs yesterday',
            },
            icon: 'check',
            color: 'emerald',
          },
          {
            id: 'designer-revisions',
            title: 'Revision Requests',
            type: 'stat',
            value: revisionRequests,
            icon: 'alert',
            color: 'red',
          },
          {
            id: 'designer-active-projects',
            title: 'Active Design Projects',
            type: 'stat',
            value: activeProjects,
            icon: 'palette',
            color: 'indigo',
          },
        ],
      };
    } catch (error) {
      this.logger.error('Error fetching designer metrics', error);
      return { widgets: [] };
    }
  }
}
