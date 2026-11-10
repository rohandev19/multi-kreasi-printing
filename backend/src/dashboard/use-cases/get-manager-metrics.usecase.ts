import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DashboardMetricsResponse } from '../dto/dashboard-metrics-response.dto';

@Injectable()
export class GetManagerMetricsUseCase {
  private readonly logger = new Logger(GetManagerMetricsUseCase.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<DashboardMetricsResponse> {
    this.logger.log('Fetching Manager Metrics...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    try {
      const [
        ordersToday,
        ordersYesterday,
        pendingApprovals,
        queuedJobs,
        inProgressJobs,
        completedJobsToday,
        lowStockAlertsRaw,
        activeStaff,
      ] = await Promise.all([
        this.prisma.order.count({
          where: {
            createdAt: { gte: today },
          },
        }),
        this.prisma.order.count({
          where: {
            createdAt: { gte: yesterday, lt: today },
          },
        }),
        this.prisma.order.count({
          where: { status: { in: ['Draft', 'Pending_Approval'] } },
        }),
        this.prisma.productionJob.count({
          where: { status: { in: ['Pending', 'Queued', 'Queue'] } },
        }),
        this.prisma.productionJob.count({
          where: { status: 'In_Progress' },
        }),
        this.prisma.productionJob.count({
          where: { status: 'Completed', updatedAt: { gte: today } },
        }),
        this.prisma.$queryRaw<{ count: bigint }[]>`
          SELECT COUNT(*) as count
          FROM materials
          WHERE current_stock < min_stock_level
            AND status = 'Active'
        `.catch(() => [{ count: 0n }]),
        this.prisma.user.count({
          where: {
            role: {
              name: {
                in: [
                  'Production',
                  'Production_Staff',
                  'Designer',
                  'Warehouse',
                  'Warehouse_Staff',
                ],
              },
            },
            status: { in: ['ACTIVE', 'Active'] },
          },
        }),
      ]);

      const lowStockAlerts = Number(lowStockAlertsRaw[0]?.count || 0);

      return {
        widgets: [
          {
            id: 'manager-orders',
            title: 'Orders Today',
            type: 'stat',
            value: ordersToday,
            trend: {
              value:
                ordersYesterday > 0
                  ? ((ordersToday - ordersYesterday) / ordersYesterday) * 100
                  : 0,
              isPositive: ordersToday >= ordersYesterday,
              label: 'vs yesterday',
            },
            icon: 'orders',
            color: 'blue',
          },
          {
            id: 'manager-pending-approvals',
            title: 'Pending Approvals',
            type: 'stat',
            value: pendingApprovals,
            icon: 'clock',
            color: 'amber',
          },
          {
            id: 'manager-production',
            title: 'Production Status',
            type: 'list',
            data: [
              { label: 'Queued', value: queuedJobs, color: 'text-gray-500' },
              {
                label: 'In Progress',
                value: inProgressJobs,
                color: 'text-blue-500',
              },
              {
                label: 'Completed Today',
                value: completedJobsToday,
                color: 'text-emerald-500',
              },
            ],
            icon: 'cogs',
            color: 'indigo',
          },
          {
            id: 'manager-low-stock',
            title: 'Low Stock Alerts',
            type: 'stat',
            value: lowStockAlerts,
            icon: 'alert',
            color: 'red',
          },
          {
            id: 'manager-team',
            title: 'Active Staff',
            type: 'stat',
            value: activeStaff,
            icon: 'users',
            color: 'purple',
          },
        ],
      };
    } catch (error) {
      this.logger.error('Error fetching manager metrics', error);
      return { widgets: [] };
    }
  }
}
