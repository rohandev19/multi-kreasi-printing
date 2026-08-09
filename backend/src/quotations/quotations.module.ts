import { Module } from '@nestjs/common';
import { QuotationsController } from './quotations.controller';
import { QuotationsService } from './quotations.service';

import { ConvertQuotationToOrderUseCase } from './use-cases/convert-quotation.usecase';
import { PublicQuotationsController } from './public-quotations.controller';

@Module({
  controllers: [QuotationsController, PublicQuotationsController],
  providers: [QuotationsService, ConvertQuotationToOrderUseCase],
})
export class QuotationsModule {}
