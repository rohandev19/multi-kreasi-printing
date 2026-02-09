import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { ProductionJobsController } from './production-jobs.controller';
import { MachinesController } from './machines.controller';
import { CreateProductionJobUseCase } from './use-cases/create-production-job.usecase';
import { AssignProductionJobUseCase } from './use-cases/assign-production-job.usecase';
import { StartProductionUseCase } from './use-cases/start-production.usecase';
import { CompleteProductionUseCase } from './use-cases/complete-production.usecase';
import { RecordMaterialConsumptionUseCase } from './use-cases/record-material-consumption.usecase';
import { CreateReworkJobUseCase } from './use-cases/create-rework-job.usecase';
import { ManageMachineUseCase } from './use-cases/manage-machine.usecase';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [ProductionJobsController, MachinesController],
  providers: [
    CreateProductionJobUseCase,
    AssignProductionJobUseCase,
    StartProductionUseCase,
    CompleteProductionUseCase,
    RecordMaterialConsumptionUseCase,
    CreateReworkJobUseCase,
    ManageMachineUseCase,
  ],
  exports: [CreateProductionJobUseCase], // Might be needed by order approval event
})
export class ProductionModule {}
