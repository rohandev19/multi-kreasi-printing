import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CreateCustomerUseCase } from './use-cases/create-customer.usecase';
import { UpdateCustomerUseCase } from './use-cases/update-customer.usecase';
import { SearchCustomersUseCase } from './use-cases/search-customers.usecase';
import { FinanceModule } from '../finance/finance.module';

@Module({
  imports: [FinanceModule],
  controllers: [CustomersController],
  providers: [
    CreateCustomerUseCase,
    UpdateCustomerUseCase,
    SearchCustomersUseCase,
  ],
})
export class CustomersModule {}
