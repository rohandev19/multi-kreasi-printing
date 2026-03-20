import { Injectable, Logger } from '@nestjs/common';
import { createPrismaClient } from '../../prisma/prisma-client.helper';
import { DashboardMetricsResponse } from '../dto/dashboard-metrics-response.dto';

@Injectable()
export class GetOwnerMetricsUseCase {
  private readonly logger = new Logger(GetOwnerMetricsUseCase.name);
  private prisma = createPrismaClient();

  async execute(): Promise<DashboardMetricsResponse> {
    this.logger.log('Fetching Owner Metrics...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    try {
      // 1. Total Revenue Today
      const todayInvoices = await this.prisma.invoice.aggregate({
        _sum: { amount: true },
        where: {
          status: 'Fully_Paid',
          createdAt: { gte: today },
        },
      });

      const yesterdayInvoices = await this.prisma.invoice.aggregate({
        _sum: { amount: true },
        where: {
          status: 'Fully_Paid',
          createdAt: { gte: yesterday, lt: today },
        },
      });

      const revenueToday = todayInvoices._sum.amount?.toNumber() || 0;
      const revenueYesterday = yesterdayInvoices._sum.amount?.toNumber() || 0;

      // 2. Orders Created Today
      const ordersToday = await this.prisma.order.count({
        where: {
          createdAt: { gte: today },
        },
      });

      // 3. Pending Approvals
      const pendingApprovals = await this.prisma.order.count({
        where: { status: 'Draft' }, // Assumed as pending approval based on previous code
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
        // Table might not exist yet if raw_materials is implemented later
        lowStockAlerts = 0;
      }

      // 5. Active Production Jobs
      const activeProductionJobs = await this.prisma.productionJob.count({
        where: { status: 'In_Progress' },
      });

      // 6. Total Customers
      const totalCustomers = await this.prisma.customer.count({
        where: { deletedAt: null },
      });

      return {
        widgets: [
          {
            id: 'owner-revenue',
            title: 'Revenue Today',
            type: 'stat',
            value: revenueToday,
            trend: {
              value: revenueYesterday > 0 ? ((revenueToday - revenueYesterday) / revenueYesterday) * 100 : 0,
              isPositive: revenueToday >= revenueYesterday,
              label: 'vs yesterday'
            },
            icon: 'revenue',
            color: 'emerald'
          },
          {
            id: 'owner-orders',
            title: 'Orders Today',
            type: 'stat',
            value: ordersToday,
            icon: 'orders',
            color: 'blue'
          },
          {
            id: 'owner-pending-approvals',
            title: 'Pending Approvals',
            type: 'stat',
            value: pendingApprovals,
            icon: 'clock',
            color: 'amber'
          },
          {
            id: 'owner-low-stock',
            title: 'Low Stock Alerts',
            type: 'stat',
            value: lowStockAlerts,
            icon: 'alert',
            color: 'red'
          },
          {
            id: 'owner-active-jobs',
            title: 'Active Production Jobs',
            type: 'stat',
            value: activeProductionJobs,
            icon: 'cogs',
            color: 'indigo'
          },
          {
            id: 'owner-customers',
            title: 'Total Customers',
            type: 'stat',
            value: totalCustomers,
            icon: 'users',
            color: 'purple'
          }
        ]
      };
    } catch (error) {
      this.logger.error('Error fetching owner metrics', error);
      return { widgets: [] };
    }
  }
}
