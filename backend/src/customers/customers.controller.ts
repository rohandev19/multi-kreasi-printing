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
import type { Request } from 'express';

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
  @Roles('Owner', 'Manager', 'Finance_Staff')
  async search(@Query() query: SearchCustomersDto, @Req() req: Request) {
    const result = await this.searchCustomersUseCase.execute(query);
    const user = (req as any).user;
    
    // Inject financial data for authorized roles
    const data = result.data.map(customer => {
      const baseCustomer = { ...customer };
      if (user.role === 'Owner' || user.role === 'Manager' || user.role === 'Finance_Staff') {
        // Mock financial data since it's not in the DB yet
        return {
          ...baseCustomer,
          totalRevenue: Math.floor(Math.random() * 10000000),
          outstandingBalance: Math.floor(Math.random() * 2000000),
        };
      }
      return baseCustomer;
    });

    return {
      ...result,
      data,
    };
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
