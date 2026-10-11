import { Body, Controller, Param, Patch, Post, Req, Get } from '@nestjs/common';
import { CreateOrderUseCase } from './use-cases/create-order.usecase';
import { UpdateOrderStatusUseCase } from './use-cases/update-order-status.usecase';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { SubmitOrderUseCase } from './use-cases/submit-order.usecase';
import { ApproveOrderUseCase } from './use-cases/approve-order.usecase';
import { CancelOrderUseCase } from './use-cases/cancel-order.usecase';
import { SearchOrdersUseCase } from './use-cases/search-orders.usecase';
import type { SearchOrdersQuery } from './use-cases/search-orders.usecase';
import { GetOrderDetailsUseCase } from './use-cases/get-order-details.usecase';
import { PrismaService } from '../prisma/prisma.service';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { VerifiedGuard } from '../auth/guards/verified.guard';
import { UseGuards } from '@nestjs/common';
import type { Request } from 'express';

export interface AuthenticatedUser {
  sub: string;
  role: string;
  email: string;
  id: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
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
  @RequirePermissions({ action: 'create', subject: 'Order' })
  @UseGuards(VerifiedGuard)
  async create(@Body() dto: CreateOrderDto, @Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;

    // Prevent IDOR: Customers cannot create orders for other customers
    if (req.user.role === 'Customer') {
      dto.customerId = undefined; // Force usecase to resolve their own customer profile
    }

    return this.createOrder.execute(dto, userId);
  }

  @Get()
  @RequirePermissions({ action: 'read', subject: 'Orders' })
  async list(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Determine which role context to use (either query param or actual user role)
    // Only Owner/Manager can view as other roles
    const queryRole = req.query.role as string;
    const effectiveRole =
      (user.role === 'Owner' || user.role === 'Manager') && queryRole
        ? queryRole
        : user.role;

    if (effectiveRole === 'Customer') {
      const where = { customer: { email: user.email } };
      const [total, data] = await Promise.all([
        this.prisma.order.count({ where }),
        this.prisma.order.findMany({
          where,
          include: { customer: { select: { companyName: true, email: true } } },
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

    const whereClause: import('@prisma/client').Prisma.OrderWhereInput = {};

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

    const [total, data] = await Promise.all([
      this.prisma.order.count({ where: whereClause }),
      this.prisma.order.findMany({
        where: whereClause,
        include: {
          customer: {
            select: { companyName: true, email: true },
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

  @Patch(':id/status')
  @RequirePermissions({ action: 'manage', subject: 'Orders' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    return this.updateOrderStatus.execute(id, dto, userId);
  }

  @Post(':id/submit')
  @RequirePermissions({ action: 'manage', subject: 'Orders' })
  async submit(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    return this.submitOrder.execute(id, userId);
  }

  @Post(':id/approve')
  @RequirePermissions({ action: 'manage', subject: 'Orders' })
  async approve(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    const userRole = req.user.role;
    return this.approveOrder.execute(id, userId, userRole);
  }

  @Post(':id/cancel')
  @RequirePermissions({ action: 'manage', subject: 'Orders' })
  async cancel(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    return this.cancelOrder.execute(id, reason, userId);
  }

  @Post(':id/reject')
  @RequirePermissions({ action: 'manage', subject: 'Orders' })
  async reject(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    // We update status to 'Rejected'
    return this.updateOrderStatus.execute(id, { status: 'Rejected' }, userId);
  }

  @Post('search')
  @RequirePermissions({ action: 'manage', subject: 'Orders' })
  async search(@Body() query: SearchOrdersQuery) {
    return this.searchOrders.execute(query);
  }

  @Get(':id')
  @RequirePermissions({ action: 'manage', subject: 'Orders' })
  async getDetails(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const user = req.user;
    return this.getOrderDetails.execute(id, user);
  }

  @Get(':orderId/design-files')
  @RequirePermissions({ action: 'manage', subject: 'Orders' })
  async getOrderDesignFiles(
    @Param('orderId') orderId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const user = req.user;
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
