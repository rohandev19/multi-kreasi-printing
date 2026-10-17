import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  CreateTicketDto,
  UpdateTicketDto,
  CreateTicketMessageDto,
} from './dto/ticket.dto';

export interface UserContext {
  sub: string;
  role: string;
  email: string;
  customerId?: string;
}

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  private async generateTicketNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

    const count = await this.prisma.supportTicket.count({
      where: {
        createdAt: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
    });

    const sequence = String(count + 1).padStart(4, '0');
    return `TKT-${year}-${sequence}`;
  }

  async createTicket(dto: CreateTicketDto, user: UserContext) {
    let customerId = user.customerId;

    // If user has no customerId linked on JWT, look up in DB
    if (!customerId) {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.sub },
        select: { customerId: true, fullName: true },
      });
      if (dbUser?.customerId) {
        customerId = dbUser.customerId;
      }
    }

    const ticketNumber = await this.generateTicketNumber();

    const ticket = await this.prisma.supportTicket.create({
      data: {
        ticketNumber,
        subject: dto.subject,
        category: dto.category,
        priority: dto.priority || 'Normal',
        status: 'Open',
        description: dto.description,
        orderId: dto.orderId || null,
        customerId: customerId || null,
        userId: user.sub,
        messages: {
          create: {
            senderId: user.sub,
            senderName: user.email,
            senderRole: user.role,
            message: dto.description,
          },
        },
      },
      include: {
        customer: true,
        user: { select: { id: true, fullName: true, email: true } },
        order: { select: { id: true, orderNumber: true } },
        messages: true,
      },
    });

    if (ticket.priority === 'Urgent') {
      this.logger.warn(`Urgent support ticket created: ${ticket.ticketNumber} by ${user.email}`);
    }

    await this.auditService.log({
      userId: user.sub,
      action: 'TICKET_CREATED',
      entityType: 'SupportTicket',
      entityId: ticket.id,
      newValue: {
        ticketNumber: ticket.ticketNumber,
        category: ticket.category,
        priority: ticket.priority,
      },
    });

    return ticket;
  }

  async findAll(query: {
    status?: string;
    priority?: string;
    category?: string;
    assignedToId?: string;
    customerId?: string;
  }, user: UserContext) {
    const isCustomer = user.role.toLowerCase() === 'customer';
    let customerId = query.customerId;

    if (isCustomer) {
      if (!customerId) {
        const dbUser = await this.prisma.user.findUnique({
          where: { id: user.sub },
          select: { customerId: true },
        });
        customerId = dbUser?.customerId || undefined;
      }
    }

    return this.prisma.supportTicket.findMany({
      where: {
        ...(isCustomer
          ? {
              OR: [
                { customerId: customerId || '00000000-0000-0000-0000-000000000000' },
                { userId: user.sub },
              ],
            }
          : {}),
        ...(!isCustomer && customerId ? { customerId } : {}),
        ...(query.status ? { status: query.status } : {}),
        ...(query.priority ? { priority: query.priority } : {}),
        ...(query.category ? { category: query.category } : {}),
        ...(query.assignedToId ? { assignedToId: query.assignedToId } : {}),
      },
      include: {
        customer: { select: { id: true, companyName: true, email: true } },
        user: { select: { id: true, fullName: true, email: true } },
        assignedTo: { select: { id: true, fullName: true, email: true } },
        order: { select: { id: true, orderNumber: true } },
        _count: { select: { messages: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, user: UserContext) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
      include: {
        customer: true,
        user: { select: { id: true, fullName: true, email: true } },
        assignedTo: { select: { id: true, fullName: true, email: true } },
        order: { select: { id: true, orderNumber: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: { select: { id: true, fullName: true, email: true } },
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Tiket dukungan tidak ditemukan');
    }

    // IDOR Check
    if (user.role.toLowerCase() === 'customer') {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.sub },
        select: { customerId: true },
      });
      const matchesCustomer = ticket.customerId && ticket.customerId === dbUser?.customerId;
      const matchesUser = ticket.userId === user.sub;
      if (!matchesCustomer && !matchesUser) {
        throw new ForbiddenException('Akses ditolak ke tiket ini');
      }
    }

    return ticket;
  }

  async updateTicket(id: string, dto: UpdateTicketDto, user: UserContext) {
    const existing = await this.findById(id, user);

    const data: any = {};
    if (dto.priority) data.priority = dto.priority;
    if (dto.category) data.category = dto.category;
    if (dto.assignedToId !== undefined) {
      data.assignedToId = dto.assignedToId || null;
      if (dto.assignedToId && existing.status === 'Open') {
        data.status = 'Assigned';
      }
    }

    if (dto.status) {
      data.status = dto.status;
      if (dto.status === 'Resolved' && !existing.resolvedAt) {
        data.resolvedAt = new Date();
      } else if (dto.status === 'Closed') {
        data.closedAt = new Date();
        if (!existing.resolvedAt) data.resolvedAt = new Date();
      } else if (dto.status === 'Reopened') {
        data.resolvedAt = null;
        data.closedAt = null;
      }
    }

    const updated = await this.prisma.supportTicket.update({
      where: { id },
      data,
      include: {
        customer: true,
        user: { select: { id: true, fullName: true, email: true } },
        assignedTo: { select: { id: true, fullName: true, email: true } },
        order: { select: { id: true, orderNumber: true } },
      },
    });

    await this.auditService.log({
      userId: user.sub,
      action: 'TICKET_UPDATED',
      entityType: 'SupportTicket',
      entityId: id,
      oldValue: { status: existing.status, priority: existing.priority },
      newValue: { status: updated.status, priority: updated.priority },
    });

    return updated;
  }

  async addMessage(ticketId: string, dto: CreateTicketMessageDto, user: UserContext) {
    const ticket = await this.findById(ticketId, user);

    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
      select: { fullName: true, email: true },
    });

    const senderName = dbUser?.fullName || user.email;

    const message = await this.prisma.ticketMessage.create({
      data: {
        ticketId,
        senderId: user.sub,
        senderName,
        senderRole: user.role,
        message: dto.message,
      },
      include: {
        sender: { select: { id: true, fullName: true, email: true } },
      },
    });

    // If customer replies to a resolved or closed ticket, auto-reopen
    if (
      user.role.toLowerCase() === 'customer' &&
      (ticket.status === 'Resolved' || ticket.status === 'Closed')
    ) {
      await this.prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: 'Reopened', resolvedAt: null, closedAt: null },
      });
    }

    await this.auditService.log({
      userId: user.sub,
      action: 'TICKET_MESSAGE_ADDED',
      entityType: 'TicketMessage',
      entityId: message.id,
      newValue: { ticketId, senderRole: user.role },
    });

    return message;
  }

  async getMetrics() {
    const total = await this.prisma.supportTicket.count();
    const open = await this.prisma.supportTicket.count({
      where: { status: { in: ['Open', 'Assigned', 'In_Progress', 'Reopened'] } },
    });
    const resolved = await this.prisma.supportTicket.count({
      where: { status: { in: ['Resolved', 'Closed'] } },
    });
    const urgent = await this.prisma.supportTicket.count({
      where: {
        priority: 'Urgent',
        status: { notIn: ['Resolved', 'Closed'] },
      },
    });

    // Resolution time calculation (Req 17.9 & 17.10)
    const resolvedTickets = await this.prisma.supportTicket.findMany({
      where: {
        status: { in: ['Resolved', 'Closed'] },
        OR: [{ resolvedAt: { not: null } }, { closedAt: { not: null } }],
      },
      select: {
        category: true,
        createdAt: true,
        resolvedAt: true,
        closedAt: true,
      },
    });

    const categoryStats: Record<
      string,
      { count: number; totalHours: number; avgHours: number }
    > = {};

    let grandTotalHours = 0;

    for (const t of resolvedTickets) {
      const end = t.closedAt || t.resolvedAt || new Date();
      const diffMs = new Date(end).getTime() - new Date(t.createdAt).getTime();
      const diffHours = Math.max(0, diffMs / (1000 * 60 * 60));

      grandTotalHours += diffHours;

      if (!categoryStats[t.category]) {
        categoryStats[t.category] = { count: 0, totalHours: 0, avgHours: 0 };
      }
      categoryStats[t.category].count += 1;
      categoryStats[t.category].totalHours += diffHours;
    }

    for (const cat of Object.keys(categoryStats)) {
      categoryStats[cat].avgHours = Number(
        (categoryStats[cat].totalHours / categoryStats[cat].count).toFixed(1),
      );
    }

    const overallAvgHours =
      resolvedTickets.length > 0
        ? Number((grandTotalHours / resolvedTickets.length).toFixed(1))
        : 0;

    return {
      total,
      open,
      resolved,
      urgent,
      overallAvgHours,
      byCategory: categoryStats,
    };
  }
}
