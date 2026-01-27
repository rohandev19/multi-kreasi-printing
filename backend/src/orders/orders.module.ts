import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { CreateOrderUseCase } from './use-cases/create-order.usecase';
import { UpdateOrderStatusUseCase } from './use-cases/update-order-status.usecase';
import { SubmitOrderUseCase } from './use-cases/submit-order.usecase';
import { ApproveOrderUseCase } from './use-cases/approve-order.usecase';
import { CancelOrderUseCase } from './use-cases/cancel-order.usecase';
import { SearchOrdersUseCase } from './use-cases/search-orders.usecase';
import { GetOrderDetailsUseCase } from './use-cases/get-order-details.usecase';
import { WorkflowService } from './workflow.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [OrdersController],
  providers: [
    WorkflowService,
    CreateOrderUseCase,
    UpdateOrderStatusUseCase,
    SubmitOrderUseCase,
    ApproveOrderUseCase,
    CancelOrderUseCase,
    SearchOrdersUseCase,
    GetOrderDetailsUseCase,
  ],
})
export class OrdersModule {}
