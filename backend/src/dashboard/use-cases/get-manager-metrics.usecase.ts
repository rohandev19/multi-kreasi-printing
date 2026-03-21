import { Injectable, Logger } from '@nestjs/common';
import { createPrismaClient } from '../../prisma/prisma-client.helper';
import { DashboardMetricsResponse } from '../dto/dashboard-metrics-response.dto';

@Injectable()
export class GetManagerMetricsUseCase {
  private readonly logger = new Logger(GetManagerMetricsUseCase.name);
  private prisma = createPrismaClient();

  async execute(): Promise<DashboardMetricsResponse> {
    this.logger.log('Fetching Manager Metrics...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    try {
      // 1. Orders Created Today
      const ordersToday = await this.prisma.order.count({
        where: {
          createdAt: { gte: today },
        },
      });

      const ordersYesterday = await this.prisma.order.count({
        where: {
          createdAt: { gte: yesterday, lt: today },
        },
      });

      // 2. Pending Approvals
      const pendingApprovals = await this.prisma.order.count({
        where: { status: 'Draft' }, // Assumed pending approval
      });

      // 3. Production Status Summary
      const queuedJobs = await this.prisma.productionJob.count({
        where: { status: 'Pending' },
      });
      const inProgressJobs = await this.prisma.productionJob.count({
        where: { status: 'In_Progress' },
      });
      const completedJobsToday = await this.prisma.productionJob.count({
        where: { status: 'Completed', updatedAt: { gte: today } },
      });

      // 4. Low Stock Alerts
      let lowStockAlerts = 0;
      try {
        const lowStockAlertsRaw = await this.prisma.$queryRaw<{ count: bigint }[]>`
          SELECT COUNT(*) as count 
          FROM raw_materials 
          WHERE current_stock < minimum_stock
        `;
        lowStockAlerts = Number(lowStockAlertsRaw[0]?.count || 0);
      } catch (error) {
        lowStockAlerts = 0;
      }

      // 5. Team Performance (Mocked for now since not fully in schema)
      const activeStaff = await this.prisma.user.count({
        where: { 
          role: {
            name: { in: ['Production_Staff', 'Designer', 'Warehouse_Staff'] }
          },
          status: 'Active'
        }
      });

      return {
        widgets: [
          {
            id: 'manager-orders',
            title: 'Orders Today',
            type: 'stat',
            value: ordersToday,
            trend: {
              value: ordersYesterday > 0 ? ((ordersToday - ordersYesterday) / ordersYesterday) * 100 : 0,
              isPositive: ordersToday >= ordersYesterday,
              label: 'vs yesterday'
            },
            icon: 'orders',
            color: 'blue'
          },
          {
            id: 'manager-pending-approvals',
            title: 'Pending Approvals',
            type: 'stat',
            value: pendingApprovals,
            icon: 'clock',
            color: 'amber'
          },
          {
            id: 'manager-production',
            title: 'Production Status',
            type: 'list',
            data: [
              { label: 'Queued', value: queuedJobs, color: 'text-gray-500' },
              { label: 'In Progress', value: inProgressJobs, color: 'text-blue-500' },
              { label: 'Completed Today', value: completedJobsToday, color: 'text-emerald-500' }
            ],
            icon: 'cogs',
            color: 'indigo'
          },
          {
            id: 'manager-low-stock',
            title: 'Low Stock Alerts',
            type: 'stat',
            value: lowStockAlerts,
            icon: 'alert',
            color: 'red'
          },
          {
            id: 'manager-team',
            title: 'Active Staff',
            type: 'stat',
            value: activeStaff,
            icon: 'users',
            color: 'purple'
          }
        ]
      };
    } catch (error) {
      this.logger.error('Error fetching manager metrics', error);
      return { widgets: [] };
    }
  }
}
