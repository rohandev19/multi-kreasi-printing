import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { InventoryService } from './inventory.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import type { Request } from 'express';

export interface AuthenticatedUser {
  sub: string;
  role: string;
  email: string;
  userId?: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@Controller('api/v1/inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @Roles('Owner', 'Manager', 'Warehouse_Staff', 'Production_Staff')
  async getInventory(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    return this.inventoryService.getMaterials(user.role);
  }

  @Get(':id')
  @Roles('Owner', 'Manager', 'Warehouse_Staff', 'Production_Staff')
  async getMaterialById(@Param('id') id: string) {
    return this.inventoryService.getMaterialById(id);
  }

  @Post()
  @Roles('Owner', 'Manager')
  async createMaterial(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateMaterialDto,
  ) {
    return this.inventoryService.createMaterial(dto, req.user.sub);
  }

  @Put(':id')
  @Roles('Owner', 'Manager')
  async updateMaterial(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: Partial<CreateMaterialDto>,
  ) {
    return this.inventoryService.updateMaterial(id, dto, req.user.sub);
  }

  @Post(':id/adjust')
  @Roles('Owner', 'Manager', 'Warehouse_Staff')
  async adjustStock(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: AdjustStockDto,
  ) {
    return this.inventoryService.adjustStock(id, dto, req.user.sub);
  }
}
