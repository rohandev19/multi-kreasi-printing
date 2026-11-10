import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DashboardMetricsResponse } from '../dto/dashboard-metrics-response.dto';

@Injectable()
export class GetOwnerMetricsUseCase {
  private readonly logger = new Logger(GetOwnerMetricsUseCase.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<DashboardMetricsResponse> {
    this.logger.log('Fetching Owner Metrics...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    try {
      const [
        todayInvoices,
        yesterdayInvoices,
        ordersToday,
        pendingApprovals,
        lowStockAlertsRaw,
        activeProductionJobs,
        totalCustomers,
      ] = await Promise.all([
        this.prisma.invoice.aggregate({
          _sum: { amount: true },
          where: {
            status: 'Fully_Paid',
            createdAt: { gte: today },
          },
        }),
        this.prisma.invoice.aggregate({
          _sum: { amount: true },
          where: {
            status: 'Fully_Paid',
            createdAt: { gte: yesterday, lt: today },
          },
        }),
        this.prisma.order.count({
          where: {
            createdAt: { gte: today },
          },
        }),
        this.prisma.order.count({
          where: { status: { in: ['Draft', 'Pending_Approval'] } },
        }),
        this.prisma.$queryRaw<{ count: bigint }[]>`
          SELECT COUNT(*) as count
          FROM materials
          WHERE current_stock < min_stock_level
            AND status = 'Active'
        `.catch(() => [{ count: 0n }]),
        this.prisma.productionJob.count({
          where: { status: 'In_Progress' },
        }),
        this.prisma.customer.count({
          where: { deletedAt: null },
        }),
      ]);

      const revenueToday = todayInvoices._sum.amount?.toNumber() || 0;
      const revenueYesterday = yesterdayInvoices._sum.amount?.toNumber() || 0;
      const lowStockAlerts = Number(lowStockAlertsRaw[0]?.count || 0);

      return {
        widgets: [
          {
            id: 'owner-revenue',
            title: 'Revenue Today',
            type: 'stat',
            value: revenueToday,
            trend: {
              value:
                revenueYesterday > 0
                  ? ((revenueToday - revenueYesterday) / revenueYesterday) * 100
                  : 0,
              isPositive: revenueToday >= revenueYesterday,
              label: 'vs yesterday',
            },
            icon: 'revenue',
            color: 'emerald',
          },
          {
            id: 'owner-orders',
            title: 'Orders Today',
            type: 'stat',
            value: ordersToday,
            icon: 'orders',
            color: 'blue',
          },
          {
            id: 'owner-pending-approvals',
            title: 'Pending Approvals',
            type: 'stat',
            value: pendingApprovals,
            icon: 'clock',
            color: 'amber',
          },
          {
            id: 'owner-low-stock',
            title: 'Low Stock Alerts',
            type: 'stat',
            value: lowStockAlerts,
            icon: 'alert',
            color: 'red',
          },
          {
            id: 'owner-active-jobs',
            title: 'Active Production Jobs',
            type: 'stat',
            value: activeProductionJobs,
            icon: 'cogs',
            color: 'indigo',
          },
          {
            id: 'owner-customers',
            title: 'Total Customers',
            type: 'stat',
            value: totalCustomers,
            icon: 'users',
            color: 'purple',
          },
        ],
      };
    } catch (error) {
      this.logger.error('Error fetching owner metrics', error);
      return { widgets: [] };
    }
  }
}
