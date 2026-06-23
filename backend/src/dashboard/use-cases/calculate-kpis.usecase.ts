import { Injectable, Logger } from '@nestjs/common';
import { createPrismaClient } from '../../prisma/prisma-client.helper';

@Injectable()
export class CalculateKPIsUseCase {
  private readonly logger = new Logger(CalculateKPIsUseCase.name);
  private prisma = createPrismaClient();

  async execute() {
    this.logger.log('Calculating Dashboard KPIs...');

    // Current period (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Previous period (31-60 days ago)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Helper to calculate trend
    const calcTrend = (current: number, previous: number) => {
      if (previous === 0)
        return { value: 100, isPositive: current >= 0, label: 'vs last month' };
      const change = ((current - previous) / previous) * 100;
      return {
        value: parseFloat(Math.abs(change).toFixed(1)),
        isPositive: change >= 0,
        label: 'vs last month',
      };
    };

    // Revenue
    const completedInvoices = await this.prisma.invoice.aggregate({
      _sum: { amount: true },
      where: { status: 'Fully_Paid', createdAt: { gte: thirtyDaysAgo } },
    });
    const prevCompletedInvoices = await this.prisma.invoice.aggregate({
      _sum: { amount: true },
      where: {
        status: 'Fully_Paid',
        createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
      },
    });

    const totalRevenue = completedInvoices._sum.amount?.toNumber() || 0;
    const prevRevenue = prevCompletedInvoices._sum.amount?.toNumber() || 0;

    // Gross Profit (Revenue - Material Costs) -> Simplified to 30% margin for MVP
    const grossProfit = totalRevenue * 0.3;
    const prevGrossProfit = prevRevenue * 0.3;

    // Conversion Rate: Completed Orders / Total Orders
    const totalOrders = await this.prisma.order.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });
    const approvedOrders = await this.prisma.order.count({
      where: { status: 'Completed', createdAt: { gte: thirtyDaysAgo } },
    });
    const conversionRate =
      totalOrders > 0 ? (approvedOrders / totalOrders) * 100 : 0;

    const prevTotalOrders = await this.prisma.order.count({
      where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
    });
    const prevApprovedOrders = await this.prisma.order.count({
      where: {
        status: 'Completed',
        createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
      },
    });
    const prevConversionRate =
      prevTotalOrders > 0 ? (prevApprovedOrders / prevTotalOrders) * 100 : 0;

    // Customer Acquisition Cost (CAC) -> Marketing spend / New customers (Mock marketing spend to 10% of revenue)
    const newCustomers = await this.prisma.customer.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });
    const prevNewCustomers = await this.prisma.customer.count({
      where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
    });

    const marketingSpend = totalRevenue * 0.1;
    const prevMarketingSpend = prevRevenue * 0.1;

    const cac = newCustomers > 0 ? marketingSpend / newCustomers : 0;
    const prevCac =
      prevNewCustomers > 0 ? prevMarketingSpend / prevNewCustomers : 0;

    return {
      totalRevenue: {
        value: totalRevenue,
        trend: calcTrend(totalRevenue, prevRevenue),
      },
      grossProfit: {
        value: grossProfit,
        trend: calcTrend(grossProfit, prevGrossProfit),
      },
      conversionRate: {
        value: parseFloat(conversionRate.toFixed(2)),
        trend: calcTrend(conversionRate, prevConversionRate),
      },
      customerAcquisitionCost: {
        value: parseFloat(cac.toFixed(2)),
        trend: calcTrend(cac, prevCac),
      },
    };
  }
}
