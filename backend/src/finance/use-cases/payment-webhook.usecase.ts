import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RecordPaymentUseCase } from './record-payment.usecase';
import * as crypto from 'crypto';

export interface PaymentWebhookPayload {
  invoiceId: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  status: 'SUCCESS' | 'FAILED';
  timestamp: string;
}

@Injectable()
export class PaymentWebhookUseCase {
  private readonly logger = new Logger(PaymentWebhookUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly recordPaymentUseCase: RecordPaymentUseCase,
  ) {}

  async execute(payload: PaymentWebhookPayload, signature: string) {
    // 1. HMAC Signature Validation
    const secret = this.configService.get<string>('PAYMENT_WEBHOOK_SECRET');
    if (!secret) {
      this.logger.error('PAYMENT_WEBHOOK_SECRET is not configured');
      throw new Error('Internal Server Error: Webhook configuration missing');
    }

    const payloadString = JSON.stringify(payload);
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');

    if (signature !== expectedSignature) {
      this.logger.warn(`Invalid webhook signature for transaction ${payload.transactionId}`);
      throw new BadRequestException('Invalid signature');
    }

    // 2. Idempotency Check
    const existingPayment = await this.prisma.payment.findFirst({
      where: { referenceNumber: payload.transactionId },
    });

    if (existingPayment) {
      this.logger.log(`Webhook ignored: Payment ${payload.transactionId} already processed.`);
      return { status: 'IGNORED', reason: 'Already processed' };
    }

    // 3. Process Only Successful Payments
    if (payload.status !== 'SUCCESS') {
      this.logger.log(`Webhook ignored: Payment ${payload.transactionId} status is ${payload.status}`);
      return { status: 'IGNORED', reason: `Status is ${payload.status}` };
    }

    // 4. Record Payment
    this.logger.log(`Processing payment webhook for invoice ${payload.invoiceId}, amount: ${payload.amount}`);
    
    // We use a system user ID or simply mark it as 'SYSTEM_WEBHOOK'
    const recorded = await this.recordPaymentUseCase.execute(
      payload.invoiceId,
      payload.amount,
      payload.paymentMethod,
      payload.transactionId,
      'SYSTEM_WEBHOOK',
    );

    return { status: 'SUCCESS', paymentId: recorded.id };
  }
}
