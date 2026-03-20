import { Injectable, Logger } from '@nestjs/common';
import { createPrismaClient } from '../../prisma/prisma-client.helper';

@Injectable()
export class GetDashboardMetricsUseCase {
  private readonly logger = new Logger(GetDashboardMetricsUseCase.name);
  private prisma = createPrismaClient();

  async execute() {
    this.logger.log('Fetching Dashboard Metrics...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    try {
      // Revenue Today
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

      // Orders Today
      const ordersToday = await this.prisma.order.count({
        where: {
          createdAt: { gte: today },
        },
      });

      // Pending Approvals (Draft Orders)
      const pendingQuotes = await this.prisma.order.count({
        where: { status: 'Draft' },
      });

      // Low Stock Alerts - gracefully handle if table doesn't exist
      let lowStockAlerts = 0;
      try {
        const lowStockAlertsRaw = await this.prisma.$queryRaw<{ count: bigint }[]>`
          SELECT COUNT(*) as count 
          FROM raw_materials 
          WHERE current_stock < minimum_stock
        `;
        lowStockAlerts = Number(lowStockAlertsRaw[0]?.count || 0);
      } catch (error) {
        this.logger.warn('raw_materials table not found, using fallback value');
        lowStockAlerts = 0;
      }

      return {
        revenue: {
          today: revenueToday,
          yesterday: revenueYesterday,
        },
        ordersToday,
        pendingApprovals: pendingQuotes,
        lowStockAlerts,
      };
    } catch (error) {
      this.logger.error('Error fetching dashboard metrics', error);
      // Return fallback data if database queries fail
      return {
        revenue: {
          today: 0,
          yesterday: 0,
        },
        ordersToday: 0,
        pendingApprovals: 0,
        lowStockAlerts: 0,
      };
    }
  }
}
