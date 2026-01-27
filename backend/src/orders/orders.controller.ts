import { Body, Controller, Param, Patch, Post, Req, Get } from '@nestjs/common';
import { CreateOrderUseCase } from './use-cases/create-order.usecase';
import { UpdateOrderStatusUseCase } from './use-cases/update-order-status.usecase';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { SubmitOrderUseCase } from './use-cases/submit-order.usecase';
import { ApproveOrderUseCase } from './use-cases/approve-order.usecase';
import { CancelOrderUseCase } from './use-cases/cancel-order.usecase';
import { SearchOrdersUseCase } from './use-cases/search-orders.usecase';
import { GetOrderDetailsUseCase } from './use-cases/get-order-details.usecase';
import { Roles } from '../auth/decorators/roles.decorator';
import type { Request } from 'express';

@Controller('api/v1/orders')
export class OrdersController {
  constructor(
    private readonly createOrder: CreateOrderUseCase,
    private readonly updateOrderStatus: UpdateOrderStatusUseCase,
    private readonly submitOrder: SubmitOrderUseCase,
    private readonly approveOrder: ApproveOrderUseCase,
    private readonly cancelOrder: CancelOrderUseCase,
    private readonly searchOrders: SearchOrdersUseCase,
    private readonly getOrderDetails: GetOrderDetailsUseCase,
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

  @Post(':id/submit')
  @Roles('Sales', 'Manager', 'Owner')
  async submit(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any).user.id;
    return this.submitOrder.execute(id, userId);
  }

  @Post(':id/approve')
  @Roles('Manager', 'Owner')
  async approve(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    return this.approveOrder.execute(id, userId, userRole);
  }

  @Post(':id/cancel')
  @Roles('Sales', 'Manager', 'Owner')
  async cancel(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Req() req: Request,
  ) {
    const userId = (req as any).user.id;
    return this.cancelOrder.execute(id, reason, userId);
  }

  @Post('search')
  @Roles('Production', 'Sales', 'Manager', 'Owner')
  async search(@Body() query: any) {
    return this.searchOrders.execute(query);
  }

  @Get(':id')
  @Roles('Production', 'Sales', 'Manager', 'Owner')
  async getDetails(@Param('id') id: string) {
    return this.getOrderDetails.execute(id);
  }
}
