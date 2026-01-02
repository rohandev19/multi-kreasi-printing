import {
  Controller,
  Post,
  Body,
  Req,
  Get,
  Query,
  Param,
  Patch,
} from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { SearchCustomersDto } from './dto/search-customers.dto';
import { CreateCustomerUseCase } from './use-cases/create-customer.usecase';
import { UpdateCustomerUseCase } from './use-cases/update-customer.usecase';
import { SearchCustomersUseCase } from './use-cases/search-customers.usecase';
import { Roles } from '../auth/decorators/roles.decorator';
import { Request } from 'express';

@Controller('api/v1/customers')
export class CustomersController {
  constructor(
    private createCustomerUseCase: CreateCustomerUseCase,
    private updateCustomerUseCase: UpdateCustomerUseCase,
    private searchCustomersUseCase: SearchCustomersUseCase,
  ) {}

  @Post()
  @Roles('Owner', 'Manager', 'Finance_Staff', 'Production_Staff', 'Designer')
  async create(@Body() dto: CreateCustomerDto, @Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.createCustomerUseCase.execute(dto, userId);
  }

  @Get()
  async search(@Query() query: SearchCustomersDto) {
    return this.searchCustomersUseCase.execute(query);
  }

  @Patch(':id')
  @Roles('Owner', 'Manager', 'Finance_Staff')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).user.sub;
    return this.updateCustomerUseCase.execute(id, dto, userId);
  }
}
