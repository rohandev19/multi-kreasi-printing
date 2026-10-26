import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CreateProductionJobUseCase } from '../use-cases/create-production-job.usecase';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrderProductionListener {
  private readonly logger = new Logger(OrderProductionListener.name);

  constructor(
    private readonly createProductionJob: CreateProductionJobUseCase,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent('order.approved')
  async handleOrderApproved(payload: { orderId: string }) {
    this.logger.log(`Received order.approved for order ${payload.orderId}`);
    try {
      await this.createProductionJob.execute(payload.orderId);
    } catch (error) {
      this.logger.error(
        `Failed to create production job on order.approved for order ${payload.orderId}`,
        error,
      );
    }
  }

  @OnEvent('order.status.changed')
  async handleOrderStatusChanged(payload: {
    orderId: string;
    newStatus: string;
  }) {
    this.logger.log(
      `Received order.status.changed for order ${payload.orderId} -> ${payload.newStatus}`,
    );
    try {
      if (payload.newStatus === 'In_Production') {
        const existingJob = await this.prisma.productionJob.findFirst({
          where: { orderId: payload.orderId },
        });

        if (!existingJob) {
          await this.createProductionJob.execute(payload.orderId);
        }

        await this.prisma.productionJob.updateMany({
          where: { orderId: payload.orderId },
          data: {
            status: 'In_Progress',
            startTime: new Date(),
          },
        });
      } else if (payload.newStatus === 'Approved') {
        await this.createProductionJob.execute(payload.orderId);
      }
    } catch (error) {
      this.logger.error(
        `Failed to process order.status.changed for order ${payload.orderId}`,
        error,
      );
    }
  }
}
