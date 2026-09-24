import { Test, TestingModule } from '@nestjs/testing';
import { NotificationEventListener, OrderStatusChangedPayload, OrderApprovedPayload, OrderCancelledPayload, DesignFileReviewedPayload, InvoiceIssuedPayload, ProductionJobCompletedPayload } from '../notification-event.listener';
import { SendNotificationUseCase } from '../use-cases/send-notification.usecase';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationType } from '../domain/notification.entity';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('NotificationEventListener', () => {
  let listener: NotificationEventListener;
  let sendNotificationUseCase: SendNotificationUseCase;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationEventListener,
        {
          provide: SendNotificationUseCase,
          useValue: {
            execute: vi.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            customer: {
              findUnique: vi.fn(),
            },
            user: {
              findFirst: vi.fn(),
            },
          },
        },
      ],
    }).compile();

    listener = module.get<NotificationEventListener>(NotificationEventListener);
    sendNotificationUseCase = module.get<SendNotificationUseCase>(SendNotificationUseCase);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('handleOrderStatusChanged', () => {
    it('should send an ORDER_UPDATE notification', async () => {
      // Arrange
      const payload: OrderStatusChangedPayload = {
        orderId: 'order-1',
        orderNumber: 'ORD-001',
        customerId: 'cust-1',
        oldStatus: 'Draft',
        newStatus: 'Approved',
      };

      vi.spyOn(prismaService.customer, 'findUnique').mockResolvedValue({ email: 'test@example.com' } as any);
      vi.spyOn(prismaService.user, 'findFirst').mockResolvedValue({ id: 'user-1' } as any);

      // Act
      await listener.handleOrderStatusChanged(payload);

      // Assert
      expect(prismaService.customer.findUnique).toHaveBeenCalledWith({
        where: { id: 'cust-1' },
        select: { email: true },
      });
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        select: { id: true },
      });
      expect(sendNotificationUseCase.execute).toHaveBeenCalledWith({
        userId: 'user-1',
        type: NotificationType.ORDER_UPDATE,
        title: 'Pesanan ORD-001 — Disetujui',
        message: 'Status pesanan Anda berubah dari "Draft" menjadi "Disetujui".',
        metadata: {
          orderId: 'order-1',
          orderNumber: 'ORD-001',
          oldStatus: 'Draft',
          newStatus: 'Approved',
        },
      });
    });

    it('should not send notification if user is not found', async () => {
      // Arrange
      const payload: OrderStatusChangedPayload = {
        orderId: 'order-1',
        orderNumber: 'ORD-001',
        customerId: 'cust-1',
        oldStatus: 'Draft',
        newStatus: 'Approved',
      };

      vi.spyOn(prismaService.customer, 'findUnique').mockResolvedValue(null);

      // Act
      await listener.handleOrderStatusChanged(payload);

      // Assert
      expect(sendNotificationUseCase.execute).not.toHaveBeenCalled();
    });
  });

  describe('handleOrderApproved', () => {
    it('should send an ORDER_UPDATE notification for approval', async () => {
      const payload: OrderApprovedPayload = {
        orderId: 'order-2',
        orderNumber: 'ORD-002',
        customerId: 'cust-2',
        approvedBy: 'Manager',
      };

      vi.spyOn(prismaService.customer, 'findUnique').mockResolvedValue({ email: 'user2@example.com' } as any);
      vi.spyOn(prismaService.user, 'findFirst').mockResolvedValue({ id: 'user-2' } as any);

      await listener.handleOrderApproved(payload);

      expect(sendNotificationUseCase.execute).toHaveBeenCalledWith({
        userId: 'user-2',
        type: NotificationType.ORDER_UPDATE,
        title: 'Pesanan ORD-002 Disetujui ✅',
        message: 'Pesanan Anda telah disetujui dan siap diproses ke tahap produksi.',
        metadata: {
          orderId: 'order-2',
          orderNumber: 'ORD-002',
        },
      });
    });
  });

  describe('handleOrderCancelled', () => {
    it('should send an ORDER_UPDATE notification for cancellation', async () => {
      const payload: OrderCancelledPayload = {
        orderId: 'order-3',
        orderNumber: 'ORD-003',
        customerId: 'cust-3',
        reason: 'Out of stock',
      };

      vi.spyOn(prismaService.customer, 'findUnique').mockResolvedValue({ email: 'user3@example.com' } as any);
      vi.spyOn(prismaService.user, 'findFirst').mockResolvedValue({ id: 'user-3' } as any);

      await listener.handleOrderCancelled(payload);

      expect(sendNotificationUseCase.execute).toHaveBeenCalledWith({
        userId: 'user-3',
        type: NotificationType.ORDER_UPDATE,
        title: 'Pesanan ORD-003 Dibatalkan',
        message: 'Pesanan dibatalkan dengan alasan: Out of stock',
        metadata: {
          orderId: 'order-3',
          orderNumber: 'ORD-003',
          reason: 'Out of stock',
        },
      });
    });
  });
});
