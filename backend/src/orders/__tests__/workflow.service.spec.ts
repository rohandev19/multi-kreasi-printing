import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkflowService } from '../workflow.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('WorkflowService - Unit & State Machine Tests', () => {
  let service: WorkflowService;
  let prismaMock: any;
  let eventEmitterMock: any;

  beforeEach(() => {
    prismaMock = {
      order: {
        findUnique: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
      orderTimeline: {
        create: vi.fn(),
      },
      customer: {
        findUnique: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => cb(prismaMock)),
    };

    eventEmitterMock = {
      emit: vi.fn(),
    };

    service = new WorkflowService(prismaMock, eventEmitterMock);
  });

  describe('determineApprovalRequired', () => {
    it('should return Auto_Approved for orders under 2M IDR', () => {
      expect(service.determineApprovalRequired(1999999)).toBe('Auto_Approved');
    });

    it('should return Manager for orders between 2M and 10M IDR', () => {
      expect(service.determineApprovalRequired(2000000)).toBe('Manager');
      expect(service.determineApprovalRequired(10000000)).toBe('Manager');
    });

    it('should return Owner for orders strictly above 10M IDR', () => {
      expect(service.determineApprovalRequired(10000001)).toBe('Owner');
      expect(service.determineApprovalRequired(50000000)).toBe('Owner');
    });
  });

  describe('processOrderApproval', () => {
    it('should auto-approve order when amount < 2M and customer has clean credit history', async () => {
      prismaMock.order.findUnique.mockResolvedValueOnce({
        id: 'order-1',
        orderNumber: 'ORD-001',
        customerId: 'cust-1',
        totalAmount: 1500000,
        status: 'Draft',
      });

      // Customer has ACTIVE credit and no overdue invoices
      prismaMock.customer.findUnique.mockResolvedValueOnce({
        id: 'cust-1',
        creditStatus: 'ACTIVE',
        orders: [], // no overdue orders found with take: 1
      });

      prismaMock.order.update.mockResolvedValueOnce({
        id: 'order-1',
        orderNumber: 'ORD-001',
        customerId: 'cust-1',
        status: 'Approved',
      });

      const result = await service.processOrderApproval('order-1', 'system');

      expect(result.status).toBe('Approved');
      expect(prismaMock.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'Approved' },
      });
      expect(prismaMock.orderTimeline.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          orderId: 'order-1',
          status: 'Approved',
          notes: expect.stringContaining('Auto-approved'),
        }),
      });
      expect(eventEmitterMock.emit).toHaveBeenCalledWith(
        'order.approved',
        expect.objectContaining({
          orderId: 'order-1',
          approvedBy: 'System (Auto)',
        }),
      );
    });

    it('should escalate to Manager when customer has overdue invoices even if amount < 2M', async () => {
      prismaMock.order.findUnique.mockResolvedValueOnce({
        id: 'order-2',
        orderNumber: 'ORD-002',
        customerId: 'cust-2',
        totalAmount: 800000, // < 2M
        status: 'Draft',
      });

      // Customer has overdue invoice found
      prismaMock.customer.findUnique.mockResolvedValueOnce({
        id: 'cust-2',
        creditStatus: 'ACTIVE',
        orders: [{ id: 'past-order-with-overdue-invoice' }], // take: 1 returned 1 item
      });

      prismaMock.order.update.mockResolvedValueOnce({
        id: 'order-2',
        orderNumber: 'ORD-002',
        customerId: 'cust-2',
        status: 'Pending_Approval',
      });

      const result = await service.processOrderApproval('order-2', 'user-1');

      expect(result.status).toBe('Pending_Approval');
      expect(prismaMock.orderTimeline.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'Pending_Approval',
          notes: expect.stringContaining('Overdue'),
        }),
      });
      expect(eventEmitterMock.emit).toHaveBeenCalledWith(
        'order.status.changed',
        expect.objectContaining({
          newStatus: 'Pending_Approval',
        }),
      );
    });

    it('should escalate to Manager when customer credit status is SUSPENDED', async () => {
      prismaMock.order.findUnique.mockResolvedValueOnce({
        id: 'order-3',
        orderNumber: 'ORD-003',
        customerId: 'cust-3',
        totalAmount: 500000,
        status: 'Draft',
      });

      prismaMock.customer.findUnique.mockResolvedValueOnce({
        id: 'cust-3',
        creditStatus: 'SUSPENDED',
        orders: [],
      });

      prismaMock.order.update.mockResolvedValueOnce({
        id: 'order-3',
        status: 'Pending_Approval',
      });

      const result = await service.processOrderApproval('order-3', 'user-1');

      expect(result.status).toBe('Pending_Approval');
      expect(prismaMock.orderTimeline.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          notes: expect.stringContaining('SUSPENDED'),
        }),
      });
    });
  });

  describe('transitionOrder', () => {
    it('should successfully transition through valid state flow (Draft -> Pending_Approval)', async () => {
      prismaMock.order.findUnique.mockResolvedValueOnce({
        id: 'order-10',
        orderNumber: 'ORD-010',
        customerId: 'cust-10',
        status: 'Draft',
        version: 1,
        items: [],
      });

      prismaMock.order.update.mockResolvedValueOnce({
        id: 'order-10',
        orderNumber: 'ORD-010',
        status: 'Pending_Approval',
      });

      const result = await service.transitionOrder(
        'order-10',
        'Pending_Approval',
        'user-1',
      );

      expect(result.status).toBe('Pending_Approval');
      expect(eventEmitterMock.emit).toHaveBeenCalledWith(
        'order.status.changed',
        expect.objectContaining({
          oldStatus: 'Draft',
          newStatus: 'Pending_Approval',
        }),
      );
    });

    it('should throw error on illegal state transition (Draft -> Shipped)', async () => {
      prismaMock.order.findUnique.mockResolvedValueOnce({
        id: 'order-11',
        orderNumber: 'ORD-011',
        status: 'Draft',
        items: [],
      });

      await expect(
        service.transitionOrder('order-11', 'Shipped', 'user-1'),
      ).rejects.toThrow('Invalid state transition');
    });

    it('should lock version atomically when transitioning to In_Production', async () => {
      prismaMock.order.findUnique.mockResolvedValueOnce({
        id: 'order-12',
        orderNumber: 'ORD-012',
        customerId: 'cust-12',
        status: 'Approved',
        version: 3,
        items: [],
      });

      prismaMock.order.updateMany.mockResolvedValueOnce({ count: 1 });
      prismaMock.order.update.mockResolvedValueOnce({
        id: 'order-12',
        status: 'In_Production',
      });

      const result = await service.transitionOrder(
        'order-12',
        'In_Production',
        'user-1',
      );

      expect(result.status).toBe('In_Production');
      expect(prismaMock.order.updateMany).toHaveBeenCalledWith({
        where: { id: 'order-12', status: 'Approved', version: 3 },
        data: { version: { increment: 1 } },
      });
    });
  });
});
