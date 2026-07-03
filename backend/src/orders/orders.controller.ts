import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Req,
  Get,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateOrderUseCase } from './use-cases/create-order.usecase';
import { UpdateOrderStatusUseCase } from './use-cases/update-order-status.usecase';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { SubmitOrderUseCase } from './use-cases/submit-order.usecase';
import { ApproveOrderUseCase } from './use-cases/approve-order.usecase';
import { CancelOrderUseCase } from './use-cases/cancel-order.usecase';
import { SearchOrdersUseCase } from './use-cases/search-orders.usecase';
import { GetOrderDetailsUseCase } from './use-cases/get-order-details.usecase';
import { PrismaService } from '../prisma/prisma.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { VerifiedGuard } from '../auth/guards/verified.guard';
import { UseGuards } from '@nestjs/common';
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
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @Roles('Sales', 'Manager', 'Owner', 'Customer')
  @UseGuards(VerifiedGuard)
  async create(@Body() dto: CreateOrderDto, @Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.createOrder.execute(dto, userId);
  }

  @Get()
  @Roles(
    'Production',
    'Sales',
    'Manager',
    'Owner',
    'Designer',
    'Production_Staff',
    'Finance_Staff',
    'Customer',
  )
  async list(@Req() req: Request) {
    const user = (req as any).user;

    // Determine which role context to use (either query param or actual user role)
    // Only Owner/Manager can view as other roles
    const queryRole = req.query.role as string;
    const effectiveRole =
      (user.role === 'Owner' || user.role === 'Manager') && queryRole
        ? queryRole
        : user.role;

    // If user is Customer, only show their orders
    if (effectiveRole === 'Customer') {
      return this.prisma.order.findMany({
        where: { customer: { email: user.email } },
        include: { customer: { select: { companyName: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    }

    const whereClause: any = {};

    if (effectiveRole === 'Designer') {
      whereClause.status = {
        in: [
          'Draft',
          'Pending_Approval',
          'Design_In_Progress',
          'Design_Review',
          'Design_Approved',
        ],
      };
    } else if (
      effectiveRole === 'Production_Staff' ||
      effectiveRole === 'Production'
    ) {
      whereClause.status = {
        in: ['Approved', 'In_Production', 'Quality_Check', 'Completed'],
      };
    }

    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.createdAt.lte = end;
      }
    }

    return this.prisma.order.findMany({
      where: whereClause,
      include: {
        customer: {
          select: { companyName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  @Patch(':id/status')
  @Roles('Production', 'Sales', 'Manager', 'Owner')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).user.sub;
    return this.updateOrderStatus.execute(id, dto, userId);
  }

  @Post(':id/submit')
  @Roles('Sales', 'Manager', 'Owner')
  async submit(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.submitOrder.execute(id, userId);
  }

  @Post(':id/approve')
  @Roles('Manager', 'Owner')
  async approve(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any).user.sub;
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
    const userId = (req as any).user.sub;
    return this.cancelOrder.execute(id, reason, userId);
  }

  @Post('search')
  @Roles('Production', 'Sales', 'Manager', 'Owner')
  async search(@Body() query: any) {
    return this.searchOrders.execute(query);
  }

  @Get(':id')
  @Roles('Production', 'Sales', 'Manager', 'Owner', 'Customer')
  async getDetails(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    return this.getOrderDetails.execute(id, user);
  }

  @Get(':orderId/design-files')
  @Roles('Customer', 'Production', 'Sales', 'Manager', 'Owner')
  async getOrderDesignFiles(
    @Param('orderId') orderId: string,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });
    if (!order) return [];

    if (user.role === 'Customer' && order.customer.email !== user.email) {
      return []; // Prevent IDOR, hide existence of order
    }

    return this.prisma.designFile.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
