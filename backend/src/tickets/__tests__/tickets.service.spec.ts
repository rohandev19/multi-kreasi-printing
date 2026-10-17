import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TicketsService, UserContext } from '../tickets.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('TicketsService', () => {
  let service: TicketsService;
  let prismaMock: any;
  let auditMock: any;

  beforeEach(() => {
    prismaMock = {
      supportTicket: {
        count: vi.fn(),
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
      ticketMessage: {
        create: vi.fn(),
      },
    };

    auditMock = {
      log: vi.fn().mockResolvedValue({}),
    };

    service = new TicketsService(prismaMock, auditMock);
  });

  const mockCustomerUser: UserContext = {
    sub: 'user-c-1',
    role: 'Customer',
    email: 'client@example.com',
    customerId: 'cust-1',
  };

  const mockStaffUser: UserContext = {
    sub: 'user-s-1',
    role: 'SupportStaff',
    email: 'staff@example.com',
  };

  describe('createTicket', () => {
    it('should generate formatted ticket number TKT-YYYY-XXXX and create ticket', async () => {
      prismaMock.supportTicket.count.mockResolvedValue(5);
      prismaMock.supportTicket.create.mockResolvedValue({
        id: 'ticket-1',
        ticketNumber: `TKT-${new Date().getFullYear()}-0006`,
        subject: 'Hasil cetak luntur',
        category: 'Order_Issue',
        priority: 'Normal',
        status: 'Open',
        description: 'Tolong cek pesanan saya',
      });

      const result = await service.createTicket(
        {
          subject: 'Hasil cetak luntur',
          category: 'Order_Issue',
          description: 'Tolong cek pesanan saya',
        },
        mockCustomerUser,
      );

      expect(result.ticketNumber).toBe(`TKT-${new Date().getFullYear()}-0006`);
      expect(prismaMock.supportTicket.create).toHaveBeenCalled();
      expect(auditMock.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'TICKET_CREATED' }),
      );
    });
  });

  describe('findById & IDOR protection', () => {
    it('should allow customer to access their own ticket', async () => {
      prismaMock.supportTicket.findUnique.mockResolvedValue({
        id: 'ticket-1',
        customerId: 'cust-1',
        userId: 'user-c-1',
        subject: 'Pertanyaan tagihan',
      });
      prismaMock.user.findUnique.mockResolvedValue({ customerId: 'cust-1' });

      const ticket = await service.findById('ticket-1', mockCustomerUser);
      expect(ticket.id).toBe('ticket-1');
    });

    it('should throw ForbiddenException if customer tries to access another customer ticket (IDOR)', async () => {
      prismaMock.supportTicket.findUnique.mockResolvedValue({
        id: 'ticket-2',
        customerId: 'cust-other',
        userId: 'user-other',
        subject: 'Rahasia perusahaan lain',
      });
      prismaMock.user.findUnique.mockResolvedValue({ customerId: 'cust-1' });

      await expect(
        service.findById('ticket-2', mockCustomerUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if ticket does not exist', async () => {
      prismaMock.supportTicket.findUnique.mockResolvedValue(null);

      await expect(
        service.findById('non-existent', mockStaffUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTicket lifecycle', () => {
    it('should set resolvedAt when status is updated to Resolved', async () => {
      prismaMock.supportTicket.findUnique.mockResolvedValue({
        id: 'ticket-1',
        status: 'In_Progress',
        priority: 'Normal',
        customerId: 'cust-1',
      });
      prismaMock.supportTicket.update.mockResolvedValue({
        id: 'ticket-1',
        status: 'Resolved',
        resolvedAt: new Date(),
      });

      const updated = await service.updateTicket(
        'ticket-1',
        { status: 'Resolved' },
        mockStaffUser,
      );

      expect(updated.status).toBe('Resolved');
      expect(prismaMock.supportTicket.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'Resolved',
            resolvedAt: expect.any(Date),
          }),
        }),
      );
      expect(auditMock.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'TICKET_UPDATED' }),
      );
    });
  });

  describe('addMessage & auto-reopen', () => {
    it('should add message and reopen ticket if customer replies to resolved ticket', async () => {
      prismaMock.supportTicket.findUnique.mockResolvedValue({
        id: 'ticket-1',
        status: 'Resolved',
        customerId: 'cust-1',
        userId: 'user-c-1',
      });
      prismaMock.user.findUnique.mockResolvedValue({
        fullName: 'Budi Pelanggan',
        email: 'budi@example.com',
        customerId: 'cust-1',
      });
      prismaMock.ticketMessage.create.mockResolvedValue({
        id: 'msg-1',
        message: 'Masih ada kendala sedikit',
        senderName: 'Budi Pelanggan',
      });
      prismaMock.supportTicket.update.mockResolvedValue({});

      const msg = await service.addMessage(
        'ticket-1',
        { message: 'Masih ada kendala sedikit' },
        mockCustomerUser,
      );

      expect(msg.id).toBe('msg-1');
      expect(prismaMock.supportTicket.update).toHaveBeenCalledWith({
        where: { id: 'ticket-1' },
        data: { status: 'Reopened', resolvedAt: null, closedAt: null },
      });
    });
  });

  describe('getMetrics', () => {
    it('should calculate counts and average resolution times per category', async () => {
      prismaMock.supportTicket.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(3) // open
        .mockResolvedValueOnce(7) // resolved
        .mockResolvedValueOnce(1); // urgent

      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);

      prismaMock.supportTicket.findMany.mockResolvedValue([
        {
          category: 'Order_Issue',
          createdAt: twoHoursAgo,
          resolvedAt: now,
          closedAt: null,
        },
        {
          category: 'Order_Issue',
          createdAt: fourHoursAgo,
          resolvedAt: null,
          closedAt: now,
        },
      ]);

      const metrics = await service.getMetrics();

      expect(metrics.total).toBe(10);
      expect(metrics.open).toBe(3);
      expect(metrics.resolved).toBe(7);
      expect(metrics.urgent).toBe(1);
      expect(metrics.byCategory['Order_Issue']).toBeDefined();
      expect(metrics.byCategory['Order_Issue'].count).toBe(2);
      expect(metrics.byCategory['Order_Issue'].avgHours).toBe(3); // (2+4)/2 = 3
    });
  });
});
