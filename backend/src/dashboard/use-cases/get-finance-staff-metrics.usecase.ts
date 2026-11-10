import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DashboardMetricsResponse } from '../dto/dashboard-metrics-response.dto';

@Injectable()
export class GetFinanceStaffMetricsUseCase {
  private readonly logger = new Logger(GetFinanceStaffMetricsUseCase.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<DashboardMetricsResponse> {
    this.logger.log('Fetching Finance Staff Metrics...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    try {
      const [
        pendingInvoices,
        todayInvoices,
        yesterdayInvoices,
        outstandingInvoicesAgg,
        partialPaymentsAgg,
        overdueInvoices,
      ] = await Promise.all([
        this.prisma.invoice.count({
          where: { status: { in: ['Sent', 'Partially_Paid', 'Overdue'] } },
        }),
        this.prisma.invoice.aggregate({
          _sum: { amount: true },
          where: {
            status: 'Fully_Paid',
            updatedAt: { gte: today },
          },
        }),
        this.prisma.invoice.aggregate({
          _sum: { amount: true },
          where: {
            status: 'Fully_Paid',
            updatedAt: { gte: yesterday, lt: today },
          },
        }),
        this.prisma.invoice.aggregate({
          _sum: { amount: true },
          where: { status: { in: ['Sent', 'Partially_Paid', 'Overdue'] } },
        }),
        this.prisma.payment.aggregate({
          _sum: { amount: true },
          where: {
            invoice: {
              status: { in: ['Sent', 'Partially_Paid', 'Overdue'] },
            },
          },
        }),
        this.prisma.invoice.count({
          where: { status: 'Overdue' },
        }),
      ]);

      const revenueToday = todayInvoices._sum.amount?.toNumber() || 0;
      const revenueYesterday = yesterdayInvoices._sum.amount?.toNumber() || 0;

      // 3. Outstanding Receivables (Total unpaid invoice amount minus partial payments already collected)
      const grossReceivables =
        outstandingInvoicesAgg._sum.amount?.toNumber() || 0;
      const partialPaid = partialPaymentsAgg._sum.amount?.toNumber() || 0;
      const outstandingReceivables = Math.max(
        0,
        grossReceivables - partialPaid,
      );

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
