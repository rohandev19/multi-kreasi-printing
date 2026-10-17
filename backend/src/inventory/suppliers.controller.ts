import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';
import type { Request } from 'express';

export interface AuthenticatedUser {
  sub: string;
  role: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@Controller('api/v1/suppliers')
@UseGuards(JwtAuthGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  @RequirePermissions({ action: 'read', subject: 'Material' })
  async getSuppliers() {
    return this.suppliersService.getSuppliers();
  }

  @Get(':id')
  @RequirePermissions({ action: 'read', subject: 'Material' })
  async getSupplierById(@Param('id') id: string) {
    return this.suppliersService.getSupplierById(id);
  }

  @Post()
  @RequirePermissions({ action: 'manage', subject: 'Material' })
  async createSupplier(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateSupplierDto,
  ) {
    return this.suppliersService.createSupplier(dto, req.user.sub);
  }

  @Put(':id')
  @RequirePermissions({ action: 'manage', subject: 'Material' })
  async updateSupplier(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateSupplierDto,
  ) {
    return this.suppliersService.updateSupplier(id, dto, req.user.sub);
  }

  @Delete(':id')
  @RequirePermissions({ action: 'manage', subject: 'Material' })
  async deleteSupplier(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.suppliersService.deleteSupplier(id, req.user.sub);
  }
}
