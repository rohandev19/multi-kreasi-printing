import {
  Controller,
  Post,
  Headers,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  PaymentWebhookUseCase,
  PaymentWebhookPayload,
} from './use-cases/payment-webhook.usecase';
import { Public } from '../auth/decorators/public.decorator';
import type { Request } from 'express';

@Controller('api/v1/webhooks')
export class WebhooksController {
  constructor(private readonly paymentWebhookUseCase: PaymentWebhookUseCase) {}

  @Public()
  @Post('payment')
  @HttpCode(HttpStatus.OK)
  async handlePaymentWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('x-signature') xSignature?: string,
    @Headers('x-webhook-signature') xWebhookSignature?: string,
  ) {
    const signature = xSignature || xWebhookSignature;
    if (!signature) {
      return { status: 'ERROR', message: 'Missing signature header' };
    }

    const payload = req.body as PaymentWebhookPayload;
    const rawBody = req.rawBody ? req.rawBody.toString('utf8') : undefined;

    return this.paymentWebhookUseCase.execute(payload, signature, rawBody);
  }
}
