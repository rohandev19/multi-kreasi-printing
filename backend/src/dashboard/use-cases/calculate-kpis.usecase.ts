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

    // Average Production Time Avg (difference between startedAt and completedAt)
    const completedJobs = await this.prisma.productionJob.findMany({
      where: { 
        status: 'Completed',
        startTime: { not: null },
        endTime: { not: null }
      },
      select: {
        startTime: true,
        endTime: true
      }
    });

    let averageProductionTimeHours = 0;
    if (completedJobs.length > 0) {
      const totalHours = completedJobs.reduce((acc, job) => {
        const diffMs = job.endTime!.getTime() - job.startTime!.getTime();
        return acc + (diffMs / (1000 * 60 * 60));
      }, 0);
      averageProductionTimeHours = totalHours / completedJobs.length;
    }

    return {
      totalRevenue,
      grossProfit,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      retentionRate: 85.5, // Mock for MVP: requires complex cohort analysis
      averageProductionTimeHours: parseFloat(averageProductionTimeHours.toFixed(2)),
      customerSatisfactionScore: 4.8, // Mock for MVP: requires external survey integration
    };
  }
}
