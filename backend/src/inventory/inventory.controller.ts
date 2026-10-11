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
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
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
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @RequirePermissions({ action: 'read', subject: 'Material' })
  async getInventory(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    return this.inventoryService.getMaterials(user.role);
  }

  @Get(':id')
  @RequirePermissions({ action: 'read', subject: 'Material' })
  async getMaterialById(@Param('id') id: string) {
    return this.inventoryService.getMaterialById(id);
  }

  @Post()
  @RequirePermissions({ action: 'manage', subject: 'Material' })
  async createMaterial(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateMaterialDto,
  ) {
    return this.inventoryService.createMaterial(dto, req.user.sub);
  }

  @Put(':id')
  @RequirePermissions({ action: 'manage', subject: 'Material' })
  async updateMaterial(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: Partial<CreateMaterialDto>,
  ) {
    return this.inventoryService.updateMaterial(id, dto, req.user.sub);
  }

  @Post(':id/adjust')
  @RequirePermissions({ action: 'manage', subject: 'Material' })
  async adjustStock(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: AdjustStockDto,
  ) {
    return this.inventoryService.adjustStock(id, dto, req.user.sub);
  }
}
