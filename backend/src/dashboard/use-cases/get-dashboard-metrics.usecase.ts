import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GetDashboardMetricsUseCase {
  private readonly logger = new Logger(GetDashboardMetricsUseCase.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    this.logger.log('Fetching Dashboard Metrics...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    try {
      const [
        todayInvoices,
        yesterdayInvoices,
        ordersToday,
        pendingQuotes,
        lowStockAlertsRaw,
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
          where: { status: 'Draft' },
        }),
        this.prisma.$queryRaw<{ count: bigint }[]>`
          SELECT COUNT(*) as count
          FROM materials
          WHERE current_stock < min_stock_level
            AND status = 'Active'
        `.catch(() => [{ count: 0n }]),
      ]);

      const revenueToday = todayInvoices._sum.amount?.toNumber() || 0;
      const revenueYesterday = yesterdayInvoices._sum.amount?.toNumber() || 0;
      const lowStockAlerts = Number(lowStockAlertsRaw[0]?.count || 0);

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
