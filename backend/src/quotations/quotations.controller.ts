import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { VerifiedGuard } from '../auth/guards/verified.guard';
import { CreateQuotationDto, UpdateQuotationDto } from './dto/quotation.dto';

import { ConvertQuotationToOrderUseCase } from './use-cases/convert-quotation.usecase';

@Controller('api/v1/quotations')
@UseGuards(VerifiedGuard)
export class QuotationsController {
  constructor(
    private readonly quotationsService: QuotationsService,
    private readonly convertQuotation: ConvertQuotationToOrderUseCase,
  ) {}

  @Post()
  @Roles('Sales', 'Manager', 'Owner')
  create(@Body() createQuotationDto: CreateQuotationDto) {
    return this.quotationsService.create(createQuotationDto);
  }

  @Get()
  @Roles('Sales', 'Manager', 'Owner', 'Customer')
  findAll() {
    return this.quotationsService.findAll();
  }

  @Get(':id')
  @Roles('Sales', 'Manager', 'Owner', 'Customer')
  findOne(@Param('id') id: string) {
    return this.quotationsService.findOne(id);
  }

  @Patch(':id')
  @Roles('Sales', 'Manager', 'Owner')
  update(
    @Param('id') id: string,
    @Body() updateQuotationDto: UpdateQuotationDto,
  ) {
    return this.quotationsService.update(id, updateQuotationDto);
  }

  @Delete(':id')
  @Roles('Sales', 'Manager', 'Owner')
  remove(@Param('id') id: string) {
    return this.quotationsService.remove(id);
  }

  @Post(':id/convert')
  @Roles('Sales', 'Manager', 'Owner', 'Customer')
  convertToOrder(@Param('id') id: string) {
    return this.convertQuotation.execute(id);
  }
}
