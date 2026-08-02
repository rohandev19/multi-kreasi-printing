import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  NotFoundException,
  UseInterceptors,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RecordPaymentDto, InvoiceFilterDto } from './dto/finance.dto';
import { RecordPaymentUseCase } from './use-cases/record-payment.usecase';
import { SendInvoiceUseCase } from './use-cases/send-invoice.usecase';
import { StorageService } from '../storage/storage.service';
import { CalculateOutstandingBalanceUseCase } from './use-cases/calculate-outstanding-balance.usecase';
import { IdempotencyInterceptor } from '../common/interceptors/idempotency.interceptor';
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
@Controller('api/v1/invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinanceController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly recordPaymentUseCase: RecordPaymentUseCase,
    private readonly sendInvoiceUseCase: SendInvoiceUseCase,
    private readonly calculateOutstandingBalanceUseCase: CalculateOutstandingBalanceUseCase,
    private readonly storageService: StorageService,
  ) {}

  @Get()
  @Roles('Customer', 'Finance_Staff', 'Owner', 'Manager')
  async getInvoices(
    @Query() filters: InvoiceFilterDto,
    @Req() req: AuthenticatedRequest,
  ) {
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
          select: { id: true, fullName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return invoices;
  }

  @Get(':id')
  @Roles('Customer', 'Finance_Staff', 'Owner', 'Manager')
  async getInvoice(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const user = req.user;
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { payments: true },
    });

    if (!invoice) throw new NotFoundException('Invoice not found');

    if (user.role === 'Customer' && invoice.customerId !== user.userId) {
      throw new NotFoundException('Invoice not found');
    }

    const outstandingInfo =
      await this.calculateOutstandingBalanceUseCase.execute(id);

    return {
      ...invoice,
      outstandingBalance: outstandingInfo.outstandingBalance,
    };
  }

  @Post(':id/payment')
  @UseInterceptors(IdempotencyInterceptor)
  @Roles('Finance_Staff', 'Owner', 'Manager')
  async recordPayment(
    @Param('id') id: string,
    @Body() dto: RecordPaymentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.recordPaymentUseCase.execute(
      id,
      dto.amount,
      dto.paymentMethod,
      dto.referenceNumber,
      req.user.userId || req.user.sub,
    );
  }

  @Get(':id/pdf')
  @Roles('Customer', 'Finance_Staff', 'Owner', 'Manager')
  async getInvoicePdf(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const user = req.user;
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice) throw new NotFoundException('Invoice not found');

    if (user.role === 'Customer' && invoice.customerId !== user.userId) {
      throw new NotFoundException('Invoice not found');
    }

    if (!invoice.pdfUrl) {
      return { message: 'PDF not generated yet' };
    }

    const presignedUrl = await this.storageService.getSignedUrl(
      `invoices/${invoice.invoiceNumber}.pdf`,
    );
    return { url: presignedUrl };
  }

  @Post(':id/send')
  @Roles('Finance_Staff', 'Owner', 'Manager')
  async sendInvoice(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.sendInvoiceUseCase.execute(id, req.user.userId || req.user.sub);
  }
}
