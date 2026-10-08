import { Controller, Post, Body, Headers, HttpCode, HttpStatus, RawBodyRequest, Req } from '@nestjs/common';
import { PaymentWebhookUseCase, PaymentWebhookPayload } from './use-cases/payment-webhook.usecase';
import type { Request } from 'express';

@Controller('api/v1/webhooks')
export class WebhooksController {
  constructor(private readonly paymentWebhookUseCase: PaymentWebhookUseCase) {}

  @Post('payment')
  @HttpCode(HttpStatus.OK)
  async handlePaymentWebhook(
    @Req() req: Request,
    @Headers('x-signature') signature: string,
  ) {
    if (!signature) {
      return { status: 'ERROR', message: 'Missing signature header' };
    }
    
    // For HMAC to work correctly, we usually need the raw string. 
    // Assuming NestJS BodyParser parses it into JSON, we can use the req.body if it's strictly ordered, 
    // but the use-case stringifies it.
    // Ensure payload type safety
    const payload = req.body as PaymentWebhookPayload;
    
    return this.paymentWebhookUseCase.execute(payload, signature);
  }
}
