import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ManageMachineUseCase } from './use-cases/manage-machine.usecase';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import {
  CreateMachineDto,
  UpdateMachineStatusDto,
  ScheduleMaintenanceDto,
} from './dto/production.dto';
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
@Controller('api/v1/machines')
@UseGuards(JwtAuthGuard)
export class MachinesController {
  constructor(private readonly manageMachine: ManageMachineUseCase) {}

  @Post()
  @RequirePermissions({ action: 'manage', subject: 'Machine' })
  async createMachine(
    @Body() dto: CreateMachineDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    return this.manageMachine.createMachine(dto.name, dto.type, userId);
  }

  @Patch(':id/status')
  @RequirePermissions({ action: 'manage', subject: 'Machine' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateMachineStatusDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    return this.manageMachine.updateStatus(id, dto.status, userId);
  }

  @Patch(':id/maintenance')
  @RequirePermissions({ action: 'manage', subject: 'Machine' })
  async scheduleMaintenance(
    @Param('id') id: string,
    @Body() dto: ScheduleMaintenanceDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    return this.manageMachine.scheduleMaintenance(
      id,
      dto.maintenanceDate,
      userId,
    );
  }

  @Get(':id/utilization')
  @RequirePermissions({ action: 'read', subject: 'Machine' })
  async getUtilization(@Param('id') id: string) {
    return this.manageMachine.getMachineUtilization(id);
  }
}
