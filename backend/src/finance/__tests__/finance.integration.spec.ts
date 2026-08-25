import { Test, TestingModule } from '@nestjs/testing';
import { FinanceController } from '../finance.controller';
import { RecordPaymentUseCase } from '../use-cases/record-payment.usecase';
import { SendInvoiceUseCase } from '../use-cases/send-invoice.usecase';
import { CalculateOutstandingBalanceUseCase } from '../use-cases/calculate-outstanding-balance.usecase';
import { GenerateInvoiceUseCase } from '../use-cases/generate-invoice.usecase';
import { StorageService } from '../../storage/storage.service';
import { PrismaService } from '../../prisma/prisma.service';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { NotFoundException } from '@nestjs/common';

describe('FinanceController Integration', () => {
  let controller: FinanceController;
  let recordPaymentUseCase: RecordPaymentUseCase;
  let calculateOutstandingBalanceUseCase: CalculateOutstandingBalanceUseCase;
  let storageService: StorageService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FinanceController],
      providers: [
        {
          provide: RecordPaymentUseCase,
          useValue: { execute: vi.fn() },
        },
        {
          provide: SendInvoiceUseCase,
          useValue: { execute: vi.fn() },
        },
        {
          provide: CalculateOutstandingBalanceUseCase,
          useValue: { execute: vi.fn() },
        },
        {
          provide: GenerateInvoiceUseCase,
          useValue: { execute: vi.fn() },
        },
        {
          provide: StorageService,
          useValue: { getSignedUrl: vi.fn() },
        },
        {
          provide: PrismaService,
          useValue: {
            invoice: {
              findMany: vi.fn(),
              findUnique: vi.fn(),
              count: vi.fn(),
            },
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: vi.fn(),
            set: vi.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<FinanceController>(FinanceController);
    recordPaymentUseCase =
      module.get<RecordPaymentUseCase>(RecordPaymentUseCase);
    calculateOutstandingBalanceUseCase =
      module.get<CalculateOutstandingBalanceUseCase>(
        CalculateOutstandingBalanceUseCase,
      );
    storageService = module.get<StorageService>(StorageService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('getInvoices', () => {
    it('should return invoices for Customer role (IDOR prevention)', async () => {
      const mockReq = {
        user: { userId: 'customer-1', role: 'Customer' },
        query: {},
      } as any;

      const mockInvoices = [{ id: 'inv-1', customerId: 'customer-1' }];
      (prisma.invoice.findMany as Mock).mockResolvedValue(mockInvoices);
      (prisma.invoice.count as Mock).mockResolvedValue(1);

      const filters = {};
      const result = await controller.getInvoices(filters, mockReq);

      expect(prisma.invoice.count).toHaveBeenCalledWith({
        where: { customerId: 'customer-1' },
      });
      expect(prisma.invoice.findMany).toHaveBeenCalledWith({
        where: { customerId: 'customer-1' },
        include: {
          customer: { select: { id: true, fullName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 50,
      });
      expect(result).toEqual({
        data: mockInvoices,
        meta: {
          total: 1,
          page: 1,
          limit: 50,
          totalPages: 1,
        },
      });
    });

    it('should return invoices for Finance_Staff without customer restriction', async () => {
      const mockReq = {
        user: { userId: 'staff-1', role: 'Finance_Staff' },
        query: {},
      } as any;

      const mockInvoices = [{ id: 'inv-1' }, { id: 'inv-2' }];
      (prisma.invoice.findMany as Mock).mockResolvedValue(mockInvoices);
      (prisma.invoice.count as Mock).mockResolvedValue(2);

      const filters = { status: 'PENDING' };
      const result = await controller.getInvoices(filters, mockReq);

      expect(prisma.invoice.count).toHaveBeenCalledWith({
        where: { status: 'PENDING' },
      });
      expect(prisma.invoice.findMany).toHaveBeenCalledWith({
        where: { status: 'PENDING' },
        include: {
          customer: { select: { id: true, fullName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 50,
      });
      expect(result).toEqual({
        data: mockInvoices,
        meta: {
          total: 2,
          page: 1,
          limit: 50,
          totalPages: 1,
        },
      });
    });
  });

  describe('getInvoice', () => {
    it('should throw NotFoundException if Customer tries to access another customer invoice', async () => {
      const mockReq = {
        user: { userId: 'customer-1', role: 'Customer' },
      } as any;

      (prisma.invoice.findUnique as Mock).mockResolvedValue({
        id: 'inv-1',
        customerId: 'another-customer',
      });

      await expect(controller.getInvoice('inv-1', mockReq)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return invoice details with outstanding balance', async () => {
      const mockReq = {
        user: { userId: 'customer-1', role: 'Customer' },
      } as any;

      (prisma.invoice.findUnique as Mock).mockResolvedValue({
        id: 'inv-1',
        customerId: 'customer-1',
        amount: 1000,
        payments: [],
      });

      (calculateOutstandingBalanceUseCase.execute as Mock).mockResolvedValue({
        outstandingBalance: 1000,
      });

      const result = await controller.getInvoice('inv-1', mockReq);

      expect(result).toEqual({
        id: 'inv-1',
        customerId: 'customer-1',
        amount: 1000,
        payments: [],
        outstandingBalance: 1000,
      });
    });
  });

  describe('recordPayment', () => {
    it('should call recordPaymentUseCase', async () => {
      const mockReq = {
        user: { userId: 'staff-1', role: 'Finance_Staff' },
      } as any;
      const dto = {
        amount: 500,
        paymentMethod: 'Bank Transfer',
        referenceNumber: 'REF-123',
      } as any;

      const expectedResult = { id: 'payment-1' };
      (recordPaymentUseCase.execute as Mock).mockResolvedValue(expectedResult);

      const result = await controller.recordPayment('inv-1', dto, mockReq);

      expect(recordPaymentUseCase.execute).toHaveBeenCalledWith(
        'inv-1',
        500,
        'Bank Transfer',
        'REF-123',
        'staff-1',
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getInvoicePdf', () => {
    it('should return presigned URL for PDF', async () => {
      const mockReq = {
        user: { userId: 'staff-1', role: 'Finance_Staff' },
      } as any;

      (prisma.invoice.findUnique as Mock).mockResolvedValue({
        id: 'inv-1',
        invoiceNumber: 'INV-001',
        pdfUrl: 'invoices/INV-001.pdf',
      });

      (storageService.getSignedUrl as Mock).mockResolvedValue(
        'https://presigned-url',
      );

      const result = await controller.getInvoicePdf('inv-1', mockReq);

      expect(storageService.getSignedUrl).toHaveBeenCalledWith(
        'invoices/INV-001.pdf',
      );
      expect(result).toEqual({ url: 'https://presigned-url' });
    });
  });
});
