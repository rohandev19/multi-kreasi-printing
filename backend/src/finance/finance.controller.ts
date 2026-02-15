import { Controller, Get, Post, Param, Body, Query, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RecordPaymentDto, InvoiceFilterDto } from './dto/finance.dto';
import { RecordPaymentUseCase } from './use-cases/record-payment.usecase';
import { SendInvoiceUseCase } from './use-cases/send-invoice.usecase';
import { StorageService } from '../storage/storage.service';
import { CalculateOutstandingBalanceUseCase } from './use-cases/calculate-outstanding-balance.usecase';

@Controller('api/v1/invoices')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly recordPaymentUseCase: RecordPaymentUseCase,
    private readonly sendInvoiceUseCase: SendInvoiceUseCase,
    private readonly calculateOutstandingBalanceUseCase: CalculateOutstandingBalanceUseCase,
    private readonly storageService: StorageService,
  ) {}

  @Get()
  async getInvoices(@Query() filters: InvoiceFilterDto, @Req() req: any) {
    const user = req.user;
    
    const where: any = {};
    if (filters.status) where.status = filters.status;
    
    // Customers can only see their own invoices
    if (user.role === 'Customer') {
      where.customerId = user.userId;
    } else if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    const invoices = await this.prisma.invoice.findMany({
      where,
      include: {
        customer: {
          select: { id: true, fullName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return invoices;
  }

  @Get(':id')
  async getInvoice(@Param('id') id: string, @Req() req: any) {
    const user = req.user;
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { payments: true }
    });

    if (!invoice) throw new ForbiddenException('Invoice not found');

    if (user.role === 'Customer' && invoice.customerId !== user.userId) {
      throw new ForbiddenException('Access denied');
    }

    const outstandingInfo = await this.calculateOutstandingBalanceUseCase.execute(id);

    return {
      ...invoice,
      outstandingBalance: outstandingInfo.outstandingBalance,
    };
  }

  @Post(':id/payments')
  async recordPayment(
    @Param('id') id: string,
    @Body() dto: RecordPaymentDto,
    @Req() req: any
  ) {
    return this.recordPaymentUseCase.execute(
      id,
      dto.amount,
      dto.paymentMethod,
      dto.referenceNumber,
      req.user.userId
    );
  }

  @Get(':id/pdf')
  async getInvoicePdf(@Param('id') id: string, @Req() req: any) {
    const user = req.user;
    const invoice = await this.prisma.invoice.findUnique({
      where: { id }
    });

    if (!invoice) throw new ForbiddenException('Invoice not found');

    if (user.role === 'Customer' && invoice.customerId !== user.userId) {
      throw new ForbiddenException('Access denied');
    }

    if (!invoice.pdfUrl) {
      return { message: 'PDF not generated yet' };
    }

    const presignedUrl = await this.storageService.getPresignedUrl(`invoices/${invoice.invoiceNumber}.pdf`);
    return { url: presignedUrl };
  }

  @Post(':id/send')
  async sendInvoice(@Param('id') id: string, @Req() req: any) {
    return this.sendInvoiceUseCase.execute(id, req.user.userId);
  }
}
