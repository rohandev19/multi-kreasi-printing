import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class CalculateKPIsUseCase {
  private readonly logger = new Logger(CalculateKPIsUseCase.name);
  private prisma = new PrismaClient();

  async execute() {
    this.logger.log('Calculating Dashboard KPIs...');
    
    // Revenue
    const completedInvoices = await this.prisma.invoice.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        status: 'Paid',
      },
    });

    const totalRevenue = completedInvoices._sum.totalAmount?.toNumber() || 0;

    // Gross Profit (Revenue - Material Costs) -> Simplified to 30% margin for MVP if no clear materials cost logged
    const grossProfit = totalRevenue * 0.3;

    // Conversion Rate: Completed Orders / Total Leads (We'll use Total Quotes instead of Leads for this MVP context)
    const totalQuotes = await this.prisma.quote.count();
    const approvedQuotes = await this.prisma.quote.count({ where: { status: 'Approved' } });
    
    const conversionRate = totalQuotes > 0 ? (approvedQuotes / totalQuotes) * 100 : 0;

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
