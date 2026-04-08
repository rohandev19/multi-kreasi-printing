import { Injectable, Logger } from '@nestjs/common';
import { createPrismaClient } from '../../prisma/prisma-client.helper';
import { DashboardMetricsResponse } from '../dto/dashboard-metrics-response.dto';

@Injectable()
export class GetFinanceStaffMetricsUseCase {
  private readonly logger = new Logger(GetFinanceStaffMetricsUseCase.name);
  private prisma = createPrismaClient();

  async execute(): Promise<DashboardMetricsResponse> {
    this.logger.log('Fetching Finance Staff Metrics...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    try {
      // 1. Pending Payments (Invoices with Sent, Partially_Paid, Overdue status)
      const pendingInvoices = await this.prisma.invoice.count({
        where: { status: { in: ['Sent', 'Partially_Paid', 'Overdue'] } },
      });

      // 2. Revenue Today (Fully paid invoices today)
      const todayInvoices = await this.prisma.invoice.aggregate({
        _sum: { amount: true },
        where: {
          status: 'Fully_Paid',
          updatedAt: { gte: today },
        },
      });

      const yesterdayInvoices = await this.prisma.invoice.aggregate({
        _sum: { amount: true },
        where: {
          status: 'Fully_Paid',
          updatedAt: { gte: yesterday, lt: today },
        },
      });

      const revenueToday = todayInvoices._sum.amount?.toNumber() || 0;
      const revenueYesterday = yesterdayInvoices._sum.amount?.toNumber() || 0;

      // 3. Outstanding Receivables (Total amount of unpaid invoices)
      const outstandingReceivablesRaw = await this.prisma.invoice.aggregate({
        _sum: { amount: true },
        where: { status: { in: ['Sent', 'Partially_Paid', 'Overdue'] } },
      });
      const outstandingReceivables =
        outstandingReceivablesRaw._sum.amount?.toNumber() || 0;

      // 4. Overdue Invoices
      const overdueInvoices = await this.prisma.invoice.count({
        where: { status: 'Overdue' },
      });

      return {
        widgets: [
          {
            id: 'finance-pending-payments',
            title: 'Pending Payments',
            type: 'stat',
            value: pendingInvoices,
            icon: 'clock',
            color: 'amber',
          },
          {
            id: 'finance-revenue-today',
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
            id: 'finance-outstanding',
            title: 'Outstanding Receivables',
            type: 'stat',
            value: outstandingReceivables,
            icon: 'document',
            color: 'blue',
          },
          {
            id: 'finance-overdue',
            title: 'Overdue Invoices',
            type: 'stat',
            value: overdueInvoices,
            icon: 'alert',
            color: 'red',
          },
        ],
      };
    } catch (error) {
      this.logger.error('Error fetching finance staff metrics', error);
      return { widgets: [] };
    }
  }
}
