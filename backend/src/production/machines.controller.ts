import { Controller, Post, Patch, Get, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ManageMachineUseCase } from './use-cases/manage-machine.usecase';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateMachineDto, UpdateMachineStatusDto, ScheduleMaintenanceDto } from './dto/production.dto';
import type { Request } from 'express';

@Controller('api/v1/machines')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MachinesController {
  constructor(
    private readonly manageMachine: ManageMachineUseCase,
  ) {}

  @Post()
  @Roles('Manager', 'Owner')
  async createMachine(@Body() dto: CreateMachineDto, @Req() req: Request) {
    const userId = (req as any).user.id;
    return this.manageMachine.createMachine(dto.name, dto.type, userId);
  }

  @Patch(':id/status')
  @Roles('Production', 'Manager', 'Owner')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateMachineStatusDto, @Req() req: Request) {
    const userId = (req as any).user.id;
    return this.manageMachine.updateStatus(id, dto.status, userId);
  }

  @Patch(':id/maintenance')
  @Roles('Manager', 'Owner')
  async scheduleMaintenance(@Param('id') id: string, @Body() dto: ScheduleMaintenanceDto, @Req() req: Request) {
    const userId = (req as any).user.id;
    return this.manageMachine.scheduleMaintenance(id, dto.maintenanceDate, userId);
  }

  @Get(':id/utilization')
  @Roles('Manager', 'Owner', 'Sales')
  async getUtilization(@Param('id') id: string) {
    return this.manageMachine.getMachineUtilization(id);
  }
}
