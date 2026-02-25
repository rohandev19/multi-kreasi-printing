import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class GetDashboardMetricsUseCase {
  private readonly logger = new Logger(GetDashboardMetricsUseCase.name);
  private prisma = new PrismaClient();

  async execute() {
    this.logger.log('Fetching Dashboard Metrics...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Revenue Today
    const todayInvoices = await this.prisma.invoice.aggregate({
      _sum: { totalAmount: true },
      where: {
        status: 'Paid',
        createdAt: { gte: today },
      },
    });

    const yesterdayInvoices = await this.prisma.invoice.aggregate({
      _sum: { totalAmount: true },
      where: {
        status: 'Paid',
        createdAt: { gte: yesterday, lt: today },
      },
    });

    const revenueToday = todayInvoices._sum.totalAmount?.toNumber() || 0;
    const revenueYesterday = yesterdayInvoices._sum.totalAmount?.toNumber() || 0;

    // Orders Today
    const ordersToday = await this.prisma.order.count({
      where: {
        createdAt: { gte: today },
      },
    });

    // Pending Approvals (Quotes)
    const pendingQuotes = await this.prisma.quote.count({
      where: { status: 'Draft' },
    });

    // Low Stock Alerts
    const lowStockAlertsRaw = await this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count 
      FROM raw_materials 
      WHERE current_stock < minimum_stock
    `;
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
  }
}
