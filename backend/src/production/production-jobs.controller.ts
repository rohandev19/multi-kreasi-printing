import {
  Controller,
  Post,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
  Get,
} from '@nestjs/common';
import { CreateProductionJobUseCase } from './use-cases/create-production-job.usecase';
import { AssignProductionJobUseCase } from './use-cases/assign-production-job.usecase';
import { StartProductionUseCase } from './use-cases/start-production.usecase';
import { CompleteProductionUseCase } from './use-cases/complete-production.usecase';
import { RecordMaterialConsumptionUseCase } from './use-cases/record-material-consumption.usecase';
import { CreateReworkJobUseCase } from './use-cases/create-rework-job.usecase';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  AssignProductionJobDto,
  CompleteProductionDto,
  RecordMaterialConsumptionDto,
  CreateReworkJobDto,
} from './dto/production.dto';
import { PrismaService } from '../prisma/prisma.service';
import type { Request } from 'express';

export interface AuthenticatedUser {
  sub: string;
  role: string;
  email: string;
  id?: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
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
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @Roles('Production', 'Production_Staff', 'Manager', 'Owner')
  async list(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    let whereClause = {};

    if (user.role === 'Production_Staff') {
      whereClause = { assignedTo: user.sub };
    }

    const [total, data] = await Promise.all([
      this.prisma.productionJob.count({ where: whereClause }),
      this.prisma.productionJob.findMany({
        where: whereClause,
        include: {
          order: {
            select: {
              orderNumber: true,
              customer: {
                select: {
                  companyName: true,
                },
              },
            },
          },
          machine: {
            select: {
              name: true,
              type: true,
            },
          },
          assignee: {
            select: {
              fullName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  @Post('from-order/:orderId')
  @Roles('Sales', 'Manager', 'Owner', 'Production', 'Production_Staff')
  async createJobFromOrder(@Param('orderId') orderId: string) {
    return this.createProductionJob.execute(orderId);
  }

  @Patch(':id/assign')
  @Roles('Production', 'Production_Staff', 'Manager', 'Owner')
  async assignJob(
    @Param('id') id: string,
    @Body() dto: AssignProductionJobDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    return this.assignProductionJob.execute(
      id,
      dto.machineId,
      dto.assigneeId,
      userId,
    );
  }

  @Patch(':id/start')
  @Roles('Production', 'Production_Staff', 'Manager', 'Owner')
  async startJob(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    return this.startProduction.execute(id, userId);
  }

  @Patch(':id/complete')
  @Roles('Production', 'Production_Staff', 'Manager', 'Owner')
  async completeJob(
    @Param('id') id: string,
    @Body() dto: CompleteProductionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    return this.completeProduction.execute(
      id,
      userId,
      dto.passedQualityCheck,
      dto.notes,
    );
  }

  @Post(':id/materials')
  @Roles('Production', 'Production_Staff', 'Manager', 'Owner')
  async recordMaterial(
    @Param('id') id: string,
    @Body() dto: RecordMaterialConsumptionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    return this.recordMaterialConsumption.execute(
      id,
      dto.materialId,
      dto.quantity,
      dto.notes,
      userId,
    );
  }

  @Post(':id/rework')
  @Roles('Production', 'Production_Staff', 'Manager', 'Owner')
  async reworkJob(
    @Param('id') id: string,
    @Body() dto: CreateReworkJobDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    return this.createReworkJob.execute(id, userId, dto.reason);
  }
}
