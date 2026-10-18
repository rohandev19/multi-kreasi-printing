import { Test, TestingModule } from '@nestjs/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QuotationsService } from '../quotations.service';
import { ConvertQuotationToOrderUseCase } from '../use-cases/convert-quotation.usecase';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('QuotationsService & ConvertQuotationToOrderUseCase', () => {
  let service: QuotationsService;
  let convertUseCase: ConvertQuotationToOrderUseCase;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      quotation: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn().mockResolvedValue(4),
      },
      quotationItem: {
        deleteMany: vi.fn(),
      },
      order: {
        create: vi.fn(),
        count: vi.fn().mockResolvedValue(10),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuotationsService,
        ConvertQuotationToOrderUseCase,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<QuotationsService>(QuotationsService);
    convertUseCase = module.get<ConvertQuotationToOrderUseCase>(ConvertQuotationToOrderUseCase);
  });

  describe('create', () => {
    it('should create quotation with Sent status when discount is <= 10%', async () => {
      prisma.quotation.create.mockImplementation(({ data }: any) => Promise.resolve({ id: 'q-1', ...data }));

      const result = await service.create({
        customerId: 'cust-1',
        discountPercent: 5,
        items: [
          { productId: 'prod-1', quantity: 100, unitPrice: 1000, subtotal: 100000 },
        ],
      });

      expect(result.status).toBe('Sent');
      expect(result.version).toBe(1);
      expect(result.quotationNumber).toBe('QUO-2026-0005');
      expect(result.subtotal).toBe(100000);
      expect(result.discountPercent).toBe(5);
      expect(result.discountAmount).toBe(5000);
      expect(result.totalAmount).toBe(105450); // (100000 - 5000) * 1.11 = 95000 + 10450 = 105450
      expect(prisma.quotation.create).toHaveBeenCalled();
    });

    it('should create quotation with Pending_Manager_Approval status when discount > 10%', async () => {
      prisma.quotation.create.mockImplementation(({ data }: any) => Promise.resolve({ id: 'q-2', ...data }));

      const result = await service.create({
        customerId: 'cust-1',
        discountPercent: 15,
        items: [
          { productId: 'prod-1', quantity: 50, unitPrice: 2000, subtotal: 100000 },
        ],
      });

      expect(result.status).toBe('Pending_Manager_Approval');
      expect(result.discountPercent).toBe(15);
      expect(result.discountAmount).toBe(15000);
    });
  });

  describe('approveDiscount', () => {
    it('should approve discount and set status to Sent with approver info', async () => {
      const pendingQuotation = {
        id: 'q-1',
        quotationNumber: 'QUO-2026-0001',
        status: 'Pending_Manager_Approval',
        notes: 'Initial notes',
      };
      prisma.quotation.findUnique.mockResolvedValue(pendingQuotation);
      prisma.quotation.update.mockImplementation(({ data }: any) => Promise.resolve({ ...pendingQuotation, ...data }));

      const result = await service.approveDiscount('q-1', 'manager-123', {
        notes: 'Approved special client rate',
      });

      expect(result.status).toBe('Sent');
      expect(result.managerApprovedBy).toBe('manager-123');
      expect(result.managerApprovedAt).toBeDefined();
      expect(result.notes).toContain('[Manager Approval]: Approved special client rate');
    });

    it('should throw BadRequestException if quotation is not Pending_Manager_Approval', async () => {
      prisma.quotation.findUnique.mockResolvedValue({
        id: 'q-1',
        quotationNumber: 'QUO-2026-0001',
        status: 'Draft',
      });

      await expect(service.approveDiscount('q-1', 'manager-123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('rejectDiscount', () => {
    it('should reject quotation discount with reason', async () => {
      const pendingQuotation = {
        id: 'q-1',
        quotationNumber: 'QUO-2026-0001',
        status: 'Pending_Manager_Approval',
      };
      prisma.quotation.findUnique.mockResolvedValue(pendingQuotation);
      prisma.quotation.update.mockImplementation(({ data }: any) => Promise.resolve({ ...pendingQuotation, ...data }));

      const result = await service.rejectDiscount('q-1', 'manager-123', {
        reason: 'Margin below company threshold',
      });

      expect(result.status).toBe('Rejected');
      expect(result.rejectionReason).toBe('Margin below company threshold');
    });
  });

  describe('accept', () => {
    it('should accept quotation and save PO number and URL', async () => {
      const sentQuotation = {
        id: 'q-1',
        customerId: 'cust-1',
        quotationNumber: 'QUO-2026-0001',
        status: 'Sent',
        notes: null,
      };
      prisma.quotation.findUnique.mockResolvedValue(sentQuotation);
      prisma.quotation.update.mockImplementation(({ data }: any) => Promise.resolve({ ...sentQuotation, ...data }));

      const result = await service.accept('q-1', 'cust-1', {
        poNumber: 'PO-CORP-9921',
        poFileUrl: 'https://storage.local/pos/po-9921.pdf',
        notes: 'Delivery expected in 7 days',
      });

      expect(result.status).toBe('Accepted');
      expect(result.poNumber).toBe('PO-CORP-9921');
      expect(result.poFileUrl).toBe('https://storage.local/pos/po-9921.pdf');
      expect(result.customerAcceptedAt).toBeDefined();
      expect(result.notes).toContain('[Customer Note]: Delivery expected in 7 days');
    });

    it('should throw ForbiddenException on IDOR attack', async () => {
      prisma.quotation.findUnique.mockResolvedValue({
        id: 'q-1',
        customerId: 'cust-owner',
        status: 'Sent',
      });

      await expect(
        service.accept('q-1', 'cust-attacker', { poNumber: 'PO-123' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if quotation is not Sent', async () => {
      prisma.quotation.findUnique.mockResolvedValue({
        id: 'q-1',
        customerId: 'cust-1',
        status: 'Draft',
      });

      await expect(
        service.accept('q-1', 'cust-1', { poNumber: 'PO-123' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('reject', () => {
    it('should reject quotation with customer reason', async () => {
      const sentQuotation = {
        id: 'q-1',
        customerId: 'cust-1',
        status: 'Sent',
      };
      prisma.quotation.findUnique.mockResolvedValue(sentQuotation);
      prisma.quotation.update.mockImplementation(({ data }: any) => Promise.resolve({ ...sentQuotation, ...data }));

      const result = await service.reject('q-1', 'cust-1', {
        reason: 'Price exceeds our budget',
      });

      expect(result.status).toBe('Rejected');
      expect(result.rejectionReason).toBe('Price exceeds our budget');
    });

    it('should throw ForbiddenException if customer ID does not match', async () => {
      prisma.quotation.findUnique.mockResolvedValue({
        id: 'q-1',
        customerId: 'cust-owner',
        status: 'Sent',
      });

      await expect(
        service.reject('q-1', 'cust-attacker', { reason: 'Unauthorized' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createRevision', () => {
    it('should create revision v2 with incremented version and new quotation number', async () => {
      const originalQuotation = {
        id: 'q-1',
        quotationNumber: 'QUO-2026-0001',
        customerId: 'cust-1',
        status: 'Sent',
        version: 1,
        discountPercent: 5,
        validUntil: null,
        terms: 'Standard terms',
        items: [
          { productId: 'prod-1', quantity: 10, unitPrice: 5000, notes: 'Print A3' },
        ],
      };
      prisma.quotation.findUnique.mockResolvedValue(originalQuotation);
      prisma.quotation.create.mockImplementation(({ data }: any) => Promise.resolve({ id: 'q-rev-2', ...data }));

      const result = await service.createRevision('q-1', {
        discountPercent: 8,
        notes: 'Adjusted discount after discussion',
      });

      expect(result.version).toBe(2);
      expect(result.quotationNumber).toBe('QUO-2026-0001-R2');
      expect(result.discountPercent).toBe(8);
      expect(result.status).toBe('Sent');
    });
  });

  describe('ConvertQuotationToOrderUseCase', () => {
    it('should convert accepted quotation to order, linking orderId and PO number', async () => {
      const acceptedQuotation = {
        id: 'q-acc-1',
        quotationNumber: 'QUO-2026-0001',
        customerId: 'cust-1',
        status: 'Accepted',
        poNumber: 'PO-CORP-4401',
        subtotal: 100000,
        tax: 11000,
        totalAmount: 111000,
        items: [
          {
            productId: 'prod-1',
            quantity: 50,
            unitPrice: 2000,
            subtotal: 100000,
            notes: 'Glossy 260gsm',
          },
        ],
      };

      prisma.quotation.findUnique.mockResolvedValue(acceptedQuotation);
      prisma.order.create.mockResolvedValue({
        id: 'ord-new-1',
        orderNumber: 'ORD-2026-0011',
        customerId: 'cust-1',
        status: 'Draft',
        notes: '[Customer PO: PO-CORP-4401] Converted from Quotation QUO-2026-0001',
      });
      prisma.quotation.update.mockResolvedValue({
        ...acceptedQuotation,
        status: 'Converted',
        orderId: 'ord-new-1',
      });

      const order = await convertUseCase.execute('q-acc-1');

      expect(order.id).toBe('ord-new-1');
      expect(order.notes).toContain('[Customer PO: PO-CORP-4401]');
      expect(prisma.quotation.update).toHaveBeenCalledWith({
        where: { id: 'q-acc-1' },
        data: {
          status: 'Converted',
          orderId: 'ord-new-1',
        },
      });
    });

    it('should throw BadRequestException if quotation is not Accepted', async () => {
      prisma.quotation.findUnique.mockResolvedValue({
        id: 'q-1',
        status: 'Sent',
        items: [],
      });

      await expect(convertUseCase.execute('q-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if quotation does not exist', async () => {
      prisma.quotation.findUnique.mockResolvedValue(null);

      await expect(convertUseCase.execute('q-unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
