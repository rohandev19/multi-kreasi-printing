import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { GenerateInvoiceUseCase } from '../use-cases/generate-invoice.usecase';

@Injectable()
export class OrderApprovedListener {
  private readonly logger = new Logger(OrderApprovedListener.name);

  constructor(private readonly generateInvoiceUseCase: GenerateInvoiceUseCase) {}

  @OnEvent('order.approved')
  async handleOrderApprovedEvent(payload: { orderId: string }) {
    this.logger.log(`Handling order.approved event for order ${payload.orderId}`);
    try {
      await this.generateInvoiceUseCase.execute(payload.orderId);
    } catch (error) {
      this.logger.error(`Error generating invoice for order ${payload.orderId}`, error);
    }
  }
}
