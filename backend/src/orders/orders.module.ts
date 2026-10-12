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
import { PresignDesignFileUseCase } from './use-cases/presign-design-file.usecase';
import { ConfirmDesignFileUseCase } from './use-cases/confirm-design-file.usecase';
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
import { ProofsController } from './proofs.controller';
import { ShipmentsController } from './shipments.controller';
import { CreateProofUseCase } from './use-cases/create-proof.usecase';
import { ApproveProofUseCase } from './use-cases/approve-proof.usecase';
import { RejectProofUseCase } from './use-cases/reject-proof.usecase';
import { GetOrderProofsUseCase } from './use-cases/get-order-proofs.usecase';
import { CreateShipmentUseCase } from './use-cases/create-shipment.usecase';
import { GetOrderShipmentsUseCase } from './use-cases/get-order-shipments.usecase';
import { ConfirmDeliveryUseCase } from './use-cases/confirm-delivery.usecase';
import { GetShipmentDetailsUseCase } from './use-cases/get-shipment-details.usecase';

@Module({
  imports: [PrismaModule, AuditModule, StorageModule],
  controllers: [
    OrdersController,
    DesignFilesController,
    CustomerOrdersController,
    ProofsController,
    ShipmentsController,
  ],
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
    PresignDesignFileUseCase,
    ConfirmDesignFileUseCase,
    ReviewDesignFileUseCase,
    GetDesignFileUseCase,
    DownloadDesignFileUseCase,
    GenerateThumbnailUseCase,
    CreateProofUseCase,
    ApproveProofUseCase,
    RejectProofUseCase,
    GetOrderProofsUseCase,
    CreateShipmentUseCase,
    GetOrderShipmentsUseCase,
    ConfirmDeliveryUseCase,
    GetShipmentDetailsUseCase,
  ],
})
export class OrdersModule {}
