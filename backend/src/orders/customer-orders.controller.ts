import {
  Controller,
  Get,
  Post,
  Param,
  Req,
  UseGuards,
  ForbiddenException,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
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
  @RequirePermissions({ action: 'read', subject: 'Order' })
  async getMyOrders(@Req() req: AuthenticatedRequest) {
    const user = req.user;

    const orders = await this.prisma.order.findMany({
      where: { customer: { email: user.email } },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders;
  }

  @Get(':id')
  @RequirePermissions({ action: 'read', subject: 'Order' })
  async getMyOrderDetails(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const user = req.user;

    // The getOrderDetails use case already has IDOR protection for Customer role
    return this.getOrderDetails.execute(id, user);
  }

  @Post(':id/payment-proof')
  @RequirePermissions({ action: 'read', subject: 'Order' })
  async uploadPaymentProof(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const user = req.user;

    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.customer.email !== user.email) {
      throw new ForbiddenException('Access denied');
    }

    // In a real app we upload the file to S3 and save the URL.
    // For now we just update the order status
    await this.prisma.order.update({
      where: { id },
      data: { status: 'Pending' },
    });

    return {
      success: true,
      message: 'Payment proof uploaded successfully',
      status: 'Pending',
    };
  }

  @Get(':id/invoice')
  @RequirePermissions({ action: 'read', subject: 'Order' })
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
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Invoice-${order.orderNumber}.txt"`,
    );

    const invoiceContent = `
================================================================================
                    PT MULTI KREASI PRINTING
       Jl. Industri Grafika No. 88, Jakarta | Telp: (021) 555-8900
                     Email: finance@mkprinting.com
================================================================================
                                INVOICE
================================================================================
Nomor Pesanan  : ${order.orderNumber}
Tanggal Order  : ${new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
Status Pesanan : ${order.status.replace(/_/g, ' ')}
Estimasi Kirim : ${order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleDateString('id-ID') : '-'}

INFORMASI PELANGGAN:
Nama / Bisnis  : ${order.customer.companyName || order.customer.email || 'Customer'}
Email          : ${order.customer.email || '-'}
Telepon        : ${order.customer.phone || '-'}

RINCIAN PESANAN:
--------------------------------------------------------------------------------
${order.items.map((item, index) => `${index + 1}. ${item.product.name}\n   Jumlah: ${item.quantity} pcs  x  Rp ${Number(item.unitPrice).toLocaleString('id-ID')}  =  Rp ${Number(item.subtotal).toLocaleString('id-ID')}`).join('\n\n')}
--------------------------------------------------------------------------------
TOTAL TAGIHAN  : Rp ${Number(order.totalAmount).toLocaleString('id-ID')}
================================================================================
Instruksi Pembayaran Bank Transfer:
Bank BCA     : 123 456 7890 (a.n. PT Multi Kreasi Printing)
Bank Mandiri : 098 765 4321 (a.n. PT Multi Kreasi Printing)

Terima kasih atas pesanan Anda di PT Multi Kreasi Printing!
================================================================================
    `;

    return res.send(invoiceContent.trim());
  }
}
