import { Injectable, Logger } from '@nestjs/common';
import { createPrismaClient } from '../../prisma/prisma-client.helper';

@Injectable()
export class GetRevenueChartDataUseCase {
  private readonly logger = new Logger(GetRevenueChartDataUseCase.name);
  private prisma = createPrismaClient();

  async execute() {
    this.logger.log('Fetching Revenue Chart Data...');

    // For MVP, we'll fetch the last 30 days of paid invoices
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const rawData = await this.prisma.$queryRaw<
      { date: Date; total: bigint }[]
    >`
      SELECT 
        DATE(created_at) as date, 
        SUM(amount) as total
      FROM invoices
      WHERE status = 'Fully_Paid' AND created_at >= ${thirtyDaysAgo}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // Map database result to an easily accessible dictionary
    const dataMap = new Map<string, number>();
    rawData.forEach((row) => {
      const dateStr = row.date.toISOString().split('T')[0];
      dataMap.set(dateStr, Number(row.total || 0));
    });

    // Generate last 30 days sequence to ensure no gaps
    const chartData = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      chartData.push({
        date: dateStr,
        total: dataMap.get(dateStr) || 0,
      });
    }

    return chartData;
  }
}
