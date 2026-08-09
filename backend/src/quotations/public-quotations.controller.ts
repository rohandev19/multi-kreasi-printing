import { Controller, Post, Body } from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { CreateCustomQuotationDto } from './dto/create-custom-quotation.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('api/v1/public/quotations')
export class PublicQuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Public()
  @Post('custom-request')
  async createCustomRequest(@Body() dto: CreateCustomQuotationDto) {
    return this.quotationsService.createCustomQuotation(dto);
  }
}
