import { Injectable, Logger } from '@nestjs/common';
import { createPrismaClient } from '../../prisma/prisma-client.helper';

@Injectable()
export class CalculateKPIsUseCase {
  private readonly logger = new Logger(CalculateKPIsUseCase.name);
  private prisma = createPrismaClient();

  async execute() {
    this.logger.log('Calculating Dashboard KPIs...');

    // Revenue
    const completedInvoices = await this.prisma.invoice.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: 'Fully_Paid',
      },
    });

    const totalRevenue = completedInvoices._sum.amount?.toNumber() || 0;

    // Gross Profit (Revenue - Material Costs) -> Simplified to 30% margin for MVP if no clear materials cost logged
    const grossProfit = totalRevenue * 0.3;

    // Conversion Rate: Completed Orders / Total Orders
    const totalOrders = await this.prisma.order.count();
    const approvedOrders = await this.prisma.order.count({
      where: { status: 'Completed' },
    });

    const conversionRate =
      totalOrders > 0 ? (approvedOrders / totalOrders) * 100 : 0;

    // Production Time Avg (difference between startedAt and completedAt)
    // We would need to calculate average from production_jobs. For MVP, mock if data isn't easily aggregatable.

    return {
      totalRevenue,
      grossProfit,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      retentionRate: 85.5, // Mock for MVP
      averageProductionTimeHours: 12.4, // Mock for MVP
      customerSatisfactionScore: 4.8, // Mock for MVP
    };
  }
}
