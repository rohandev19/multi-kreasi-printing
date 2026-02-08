import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductionJobLogic } from '../domain/production-job.entity';

@Injectable()
export class CreateProductionJobUseCase {
  private readonly logger = new Logger(CreateProductionJobUseCase.name);

  constructor(private prisma: PrismaService) {}

  async execute(orderId: string): Promise<void> {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        this.logger.error(`Order ${orderId} not found, cannot create production job.`);
        return;
      }

      // Check if job already exists
      const existingJob = await this.prisma.productionJob.findFirst({
        where: { orderId },
      });

      if (existingJob) {
        this.logger.warn(`Production job already exists for order ${orderId}`);
        return;
      }

      // Get next sequence number
      const count = await this.prisma.productionJob.count();
      const jobNumber = ProductionJobLogic.generateJobNumber(count + 1);

      await this.prisma.productionJob.create({
        data: {
          jobNumber,
          orderId,
          status: 'Queue',
        }
      });

      this.logger.log(`Created production job ${jobNumber} for order ${orderId}`);
    } catch (error) {
      this.logger.error(`Failed to create production job for order ${orderId}`, error);
      throw error;
    }
  }
}
