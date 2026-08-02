import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
  ForbiddenException,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { VerifiedGuard } from '../auth/guards/verified.guard';
import { GetOrderDetailsUseCase } from './use-cases/get-order-details.usecase';
import type { Request, Response } from 'express';

export interface AuthenticatedUser {
  sub: string;
  role: string;
  email: string;
  id: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
@Controller('api/v1/my-orders')
@UseGuards(VerifiedGuard)
export class CustomerOrdersController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly getOrderDetails: GetOrderDetailsUseCase,
  ) {}

  @Get()
  @Roles('Customer')
  async getMyOrders(@Req() req: AuthenticatedRequest) {
    const user = req.user;

    const orders = await this.prisma.order.findMany({
      where: { customer: { email: user.email } },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders;
  }

  @Get(':id')
  @Roles('Customer')
  async getMyOrderDetails(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const user = req.user;

    // The getOrderDetails use case already has IDOR protection for Customer role
    return this.getOrderDetails.execute(id, user);
  }

  @Get(':id/invoice')
  @Roles('Customer')
  async downloadInvoice(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const user = req.user;

    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.customer.email !== user.email) {
      throw new ForbiddenException('Access denied');
    }

    // In a real app, we would generate a PDF here
    // For now, return a placeholder JSON or text response indicating the invoice
    // Or we could send a simple HTML invoice.

    // Using a basic string response for the mock
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=invoice-${order.orderNumber}.txt`,
    );

    const invoiceContent = `
=========================================
INVOICE
=========================================
Order Number: ${order.orderNumber}
Date: ${order.createdAt.toISOString()}
Status: ${order.status}

Customer: ${order.customer.companyName}
Email: ${order.customer.email}

Items:
${order.items.map((item) => `- ${item.product.name} (x${item.quantity}): Rp ${item.subtotal.toString()}`).join('\n')}

Total Amount: Rp ${order.totalAmount.toString()}
=========================================
Thank you for your business!
    `;

    return res.send(invoiceContent.trim());
  }
}
