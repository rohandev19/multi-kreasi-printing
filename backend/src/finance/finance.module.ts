import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { StorageModule } from '../storage/storage.module';
import { AuthModule } from '../auth/auth.module';

import { FinanceController } from './finance.controller';
import { GenerateInvoiceUseCase } from './use-cases/generate-invoice.usecase';
import { RecordPaymentUseCase } from './use-cases/record-payment.usecase';
import { CalculateOutstandingBalanceUseCase } from './use-cases/calculate-outstanding-balance.usecase';
import { SendInvoiceUseCase } from './use-cases/send-invoice.usecase';
import { SendPaymentReminderUseCase } from './use-cases/send-payment-reminder.usecase';
import { PdfGenerationProcessor } from './jobs/pdf-generation.processor';

@Module({
  imports: [
    PrismaModule,
    AuditModule,
    StorageModule,
    AuthModule,
    BullModule.registerQueue({
      name: 'pdf-generation',
    }),
  ],
  controllers: [FinanceController],
  providers: [
    GenerateInvoiceUseCase,
    RecordPaymentUseCase,
    CalculateOutstandingBalanceUseCase,
    SendInvoiceUseCase,
    SendPaymentReminderUseCase,
    PdfGenerationProcessor,
  ],
  exports: [GenerateInvoiceUseCase],
})
export class FinanceModule {}
