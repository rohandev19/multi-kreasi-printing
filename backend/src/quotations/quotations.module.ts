import { Module } from '@nestjs/common';
import { QuotationsController } from './quotations.controller';
import { QuotationsService } from './quotations.service';

import { ConvertQuotationToOrderUseCase } from './use-cases/convert-quotation.usecase';

@Module({
  controllers: [QuotationsController],
  providers: [QuotationsService, ConvertQuotationToOrderUseCase],
})
export class QuotationsModule {}
