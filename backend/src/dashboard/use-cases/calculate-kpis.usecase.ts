import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CalculateKPIsUseCase {
  private readonly logger = new Logger(CalculateKPIsUseCase.name);

  constructor(private readonly prisma: PrismaService) {}

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

    const [
      completedInvoices,
      prevCompletedInvoices,
      totalOrders,
      approvedOrders,
      prevTotalOrders,
      prevApprovedOrders,
      newCustomers,
      prevNewCustomers,
      currentConsumptions,
      prevConsumptions,
    ] = await Promise.all([
      this.prisma.invoice.aggregate({
        _sum: { amount: true },
        where: { status: 'Fully_Paid', createdAt: { gte: thirtyDaysAgo } },
      }),
      this.prisma.invoice.aggregate({
        _sum: { amount: true },
        where: {
          status: 'Fully_Paid',
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
      }),
      this.prisma.order.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      this.prisma.order.count({
        where: { status: 'Completed', createdAt: { gte: thirtyDaysAgo } },
      }),
      this.prisma.order.count({
        where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      }),
      this.prisma.order.count({
        where: {
          status: 'Completed',
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
      }),
      this.prisma.customer.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      this.prisma.customer.count({
        where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      }),
      this.prisma.materialConsumption.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        take: 2000,
        select: {
          quantity: true,
          material: { select: { costPrice: true } },
        },
      }),
      this.prisma.materialConsumption.findMany({
        where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
        take: 2000,
        select: {
          quantity: true,
          material: { select: { costPrice: true } },
        },
      }),
    ]);

    const totalRevenue = completedInvoices._sum.amount?.toNumber() || 0;
    const prevRevenue = prevCompletedInvoices._sum.amount?.toNumber() || 0;

    // Gross Profit (Revenue - Actual Material Costs, fallback to 30% margin if no consumption logged)
    const actualMaterialCost = currentConsumptions.reduce(
      (sum, c) =>
        sum + Number(c.quantity || 0) * Number(c.material?.costPrice || 0),
      0,
    );
    const prevMaterialCost = prevConsumptions.reduce(
      (sum, c) =>
        sum + Number(c.quantity || 0) * Number(c.material?.costPrice || 0),
      0,
    );

    const grossProfit =
      actualMaterialCost > 0
        ? Math.max(0, totalRevenue - actualMaterialCost)
        : totalRevenue * 0.3;
    const prevGrossProfit =
      prevMaterialCost > 0
        ? Math.max(0, prevRevenue - prevMaterialCost)
        : prevRevenue * 0.3;

    const conversionRate =
      totalOrders > 0 ? (approvedOrders / totalOrders) * 100 : 0;
    const prevConversionRate =
      prevTotalOrders > 0 ? (prevApprovedOrders / prevTotalOrders) * 100 : 0;

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
