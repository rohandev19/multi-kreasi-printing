import { Injectable, Logger } from '@nestjs/common';
import { createPrismaClient } from '../../prisma/prisma-client.helper';
import { DashboardMetricsResponse } from '../dto/dashboard-metrics-response.dto';

@Injectable()
export class GetDesignerMetricsUseCase {
  private readonly logger = new Logger(GetDesignerMetricsUseCase.name);
  private prisma = createPrismaClient();

  async execute(): Promise<DashboardMetricsResponse> {
    this.logger.log('Fetching Designer Metrics...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    try {
      // 1. Pending Design Reviews
      const pendingReviews = await this.prisma.designFile.count({
        where: { status: 'Manual_Review' },
      });

      // 2. Approved Designs Today
      const approvedToday = await this.prisma.designFile.count({
        where: {
          status: 'Approved',
          updatedAt: { gte: today },
        },
      });

      const approvedYesterday = await this.prisma.designFile.count({
        where: {
          status: 'Approved',
          updatedAt: { gte: yesterday, lt: today },
        },
      });

      // 3. Revision Requests
      const revisionRequests = await this.prisma.designFile.count({
        where: {
          status: { in: ['Rejected', 'Revision_Required'] },
        },
      });

      // 4. Active Design Projects (orders in Design status)
      // Since order status enum isn't strictly documented in schema but typically includes 'Design' or 'In_Design'
      const activeProjects = await this.prisma.order.count({
        where: { status: 'Design' },
      });

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
