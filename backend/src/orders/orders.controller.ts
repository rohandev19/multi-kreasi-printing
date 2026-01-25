import { Body, Controller, Param, Patch, Post, Req } from '@nestjs/common';
import { CreateOrderUseCase } from './use-cases/create-order.usecase';
import { UpdateOrderStatusUseCase } from './use-cases/update-order-status.usecase';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import type { Request } from 'express';

@Controller('api/v1/orders')
export class OrdersController {
  constructor(
    private readonly createOrder: CreateOrderUseCase,
    private readonly updateOrderStatus: UpdateOrderStatusUseCase,
  ) {}

  @Post()
  @Roles('Sales', 'Manager', 'Owner')
  async create(@Body() dto: CreateOrderDto, @Req() req: Request) {
    const userId = (req as any).user.id;
    return this.createOrder.execute(dto, userId);
  }

  @Patch(':id/status')
  @Roles('Production', 'Sales', 'Manager', 'Owner')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).user.id;
    return this.updateOrderStatus.execute(id, dto, userId);
  }
}
