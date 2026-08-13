import {
  Controller,
  Post,
  Body,
  Req,
  Get,
  Query,
  Param,
  Patch,
  NotFoundException,
} from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { SearchCustomersDto } from './dto/search-customers.dto';
import { CreateCustomerUseCase } from './use-cases/create-customer.usecase';
import { UpdateCustomerUseCase } from './use-cases/update-customer.usecase';
import { SearchCustomersUseCase } from './use-cases/search-customers.usecase';
import { PrismaService } from '../prisma/prisma.service';
import { Roles } from '../auth/decorators/roles.decorator';
import type { Request } from 'express';

@Controller('api/v1/customers')
export class CustomersController {
  constructor(
    private createCustomerUseCase: CreateCustomerUseCase,
    private updateCustomerUseCase: UpdateCustomerUseCase,
    private searchCustomersUseCase: SearchCustomersUseCase,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @Roles('Owner', 'Manager', 'Finance_Staff', 'Production_Staff', 'Designer', 'Sales')
  async create(@Body() dto: CreateCustomerDto, @Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.createCustomerUseCase.execute(dto, userId);
  }

  @Get()
  @Roles('Owner', 'Manager', 'Finance_Staff', 'Sales')
  async search(@Query() query: SearchCustomersDto, @Req() req: Request) {
    const result = await this.searchCustomersUseCase.execute(query);
    const user = (req as any).user;

    let metrics: Record<
      string,
      { totalRevenue: number; outstandingBalance: number; totalOrders: number }
    > = {};
    if (
      user.role === 'Owner' ||
      user.role === 'Manager' ||
      user.role === 'Finance_Staff'
    ) {
      const customerIds = result.data.map((c) => c.id);
      metrics = await this.getFinancialMetrics(customerIds);
    }

    const data = result.data.map((customer) => {
      const baseCustomer = { ...customer };
      if (metrics[customer.id]) {
        return {
          ...baseCustomer,
          totalRevenue: metrics[customer.id].totalRevenue,
          outstandingBalance: metrics[customer.id].outstandingBalance,
        };
      }
      return baseCustomer;
    });

    return {
      ...result,
      data,
    };
  }

  @Get(':id')
  @Roles('Owner', 'Manager', 'Finance_Staff', 'Sales')
  async findOne(@Param('id') id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    const metrics = await this.getFinancialMetrics([customer.id]);
    const customerMetrics = metrics[customer.id] || {
      totalOrders: 0,
      totalRevenue: 0,
      outstandingBalance: 0,
    };

    return {
      ...customer,
      totalOrders: customerMetrics.totalOrders,
      totalRevenue: customerMetrics.totalRevenue,
      outstandingBalance: customerMetrics.outstandingBalance,
    };
  }

  @Get(':id/payments')
  @Roles('Owner', 'Manager', 'Finance_Staff', 'Sales')
  async getPaymentHistory(@Param('id') id: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { customerId: id },
      include: { payments: true },
    });

    const payments = invoices.flatMap((inv) =>
      inv.payments.map((p) => ({
        id: p.id,
        date: p.date,
        amount: p.amount,
        method: p.paymentMethod,
        status: 'Completed', // All recorded payments are completed
        invoiceNumber: inv.invoiceNumber,
      })),
    );

    // Sort by date descending
    return payments.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  @Patch(':id')
  @Roles('Owner', 'Manager', 'Finance_Staff', 'Sales')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).user.sub;
    return this.updateCustomerUseCase.execute(id, dto, userId);
  }

  private async getFinancialMetrics(customerIds: string[]) {
    if (!customerIds.length) return {};

    const invoices = await this.prisma.invoice.findMany({
      where: { customerId: { in: customerIds } },
      include: { payments: true },
    });

    const metrics: Record<
      string,
      { totalRevenue: number; outstandingBalance: number; totalOrders: number }
    > = {};
    for (const id of customerIds) {
      metrics[id] = { totalRevenue: 0, outstandingBalance: 0, totalOrders: 0 };
    }

    for (const inv of invoices) {
      const amount = Number(inv.amount);
      const paid = inv.payments.reduce((sum, p) => sum + Number(p.amount), 0);
      metrics[inv.customerId].totalRevenue += paid;
      metrics[inv.customerId].outstandingBalance += Math.max(0, amount - paid);
    }

    const orders = await this.prisma.order.groupBy({
      by: ['customerId'],
      where: { customerId: { in: customerIds } },
      _count: { _all: true },
    });

    for (const o of orders) {
      metrics[o.customerId].totalOrders = o._count._all;
    }

    return metrics;
  }
}
