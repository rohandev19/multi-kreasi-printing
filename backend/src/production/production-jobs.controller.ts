import { Controller, Post, Patch, Body, Param, Req, UseGuards } from '@nestjs/common';
import { CreateProductionJobUseCase } from './use-cases/create-production-job.usecase';
import { AssignProductionJobUseCase } from './use-cases/assign-production-job.usecase';
import { StartProductionUseCase } from './use-cases/start-production.usecase';
import { CompleteProductionUseCase } from './use-cases/complete-production.usecase';
import { RecordMaterialConsumptionUseCase } from './use-cases/record-material-consumption.usecase';
import { CreateReworkJobUseCase } from './use-cases/create-rework-job.usecase';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AssignProductionJobDto, CompleteProductionDto, RecordMaterialConsumptionDto, CreateReworkJobDto } from './dto/production.dto';
import type { Request } from 'express';

@Controller('api/v1/production-jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductionJobsController {
  constructor(
    private readonly createProductionJob: CreateProductionJobUseCase,
    private readonly assignProductionJob: AssignProductionJobUseCase,
    private readonly startProduction: StartProductionUseCase,
    private readonly completeProduction: CompleteProductionUseCase,
    private readonly recordMaterialConsumption: RecordMaterialConsumptionUseCase,
    private readonly createReworkJob: CreateReworkJobUseCase,
  ) {}

  @Post('from-order/:orderId')
  @Roles('Sales', 'Manager', 'Owner', 'Production')
  async createJobFromOrder(@Param('orderId') orderId: string) {
    return this.createProductionJob.execute(orderId);
  }

  @Patch(':id/assign')
  @Roles('Production', 'Manager', 'Owner')
  async assignJob(@Param('id') id: string, @Body() dto: AssignProductionJobDto, @Req() req: Request) {
    const userId = (req as any).user.id;
    return this.assignProductionJob.execute(id, dto.machineId, dto.assigneeId, userId);
  }

  @Patch(':id/start')
  @Roles('Production', 'Manager', 'Owner')
  async startJob(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any).user.id;
    return this.startProduction.execute(id, userId);
  }

  @Patch(':id/complete')
  @Roles('Production', 'Manager', 'Owner')
  async completeJob(@Param('id') id: string, @Body() dto: CompleteProductionDto, @Req() req: Request) {
    const userId = (req as any).user.id;
    return this.completeProduction.execute(id, userId, dto.passedQualityCheck, dto.notes);
  }

  @Post(':id/materials')
  @Roles('Production', 'Manager', 'Owner')
  async recordMaterial(@Param('id') id: string, @Body() dto: RecordMaterialConsumptionDto, @Req() req: Request) {
    const userId = (req as any).user.id;
    return this.recordMaterialConsumption.execute(id, dto.productId, dto.quantity, dto.notes, userId);
  }

  @Post(':id/rework')
  @Roles('Production', 'Manager', 'Owner')
  async reworkJob(@Param('id') id: string, @Body() dto: CreateReworkJobDto, @Req() req: Request) {
    const userId = (req as any).user.id;
    return this.createReworkJob.execute(id, userId, dto.reason);
  }
}
