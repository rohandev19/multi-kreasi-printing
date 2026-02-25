import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class GetRevenueChartDataUseCase {
  private readonly logger = new Logger(GetRevenueChartDataUseCase.name);
  private prisma = new PrismaClient();

  async execute() {
    this.logger.log('Fetching Revenue Chart Data...');
    
    // For MVP, we'll fetch the last 30 days of paid invoices
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const rawData = await this.prisma.$queryRaw<{ date: Date; total: bigint }[]>`
      SELECT 
        DATE(created_at) as date, 
        SUM(total_amount) as total
      FROM invoices
      WHERE status = 'Paid' AND created_at >= ${thirtyDaysAgo}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    return rawData.map(row => ({
      date: row.date.toISOString().split('T')[0],
      total: Number(row.total || 0),
    }));
  }
}
