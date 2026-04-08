import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { CreateOrderUseCase } from './use-cases/create-order.usecase';
import { UpdateOrderStatusUseCase } from './use-cases/update-order-status.usecase';
import { SubmitOrderUseCase } from './use-cases/submit-order.usecase';
import { ApproveOrderUseCase } from './use-cases/approve-order.usecase';
import { CancelOrderUseCase } from './use-cases/cancel-order.usecase';
import { SearchOrdersUseCase } from './use-cases/search-orders.usecase';
import { GetOrderDetailsUseCase } from './use-cases/get-order-details.usecase';
import { UploadDesignFileUseCase } from './use-cases/upload-design-file.usecase';
import { ReviewDesignFileUseCase } from './use-cases/review-design-file.usecase';
import { GetDesignFileUseCase } from './use-cases/get-design-file.usecase';
import { DownloadDesignFileUseCase } from './use-cases/download-design-file.usecase';
import { GenerateThumbnailUseCase } from './use-cases/generate-thumbnail.usecase';
import { WorkflowService } from './workflow.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { StorageModule } from '../storage/storage.module';
import { DesignFilesController } from './design-files.controller';
import { CustomerOrdersController } from './customer-orders.controller';

@Module({
  imports: [PrismaModule, AuditModule, StorageModule],
  controllers: [OrdersController, DesignFilesController, CustomerOrdersController],
  providers: [
    WorkflowService,
    CreateOrderUseCase,
    UpdateOrderStatusUseCase,
    SubmitOrderUseCase,
    ApproveOrderUseCase,
    CancelOrderUseCase,
    SearchOrdersUseCase,
    GetOrderDetailsUseCase,
    UploadDesignFileUseCase,
    ReviewDesignFileUseCase,
    GetDesignFileUseCase,
    DownloadDesignFileUseCase,
    GenerateThumbnailUseCase,
  ],
})
export class OrdersModule {}
