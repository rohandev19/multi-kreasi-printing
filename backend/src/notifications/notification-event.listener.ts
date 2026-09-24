import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SendNotificationUseCase } from './use-cases/send-notification.usecase';
import { NotificationType } from './domain/notification.entity';
import { PrismaService } from '../prisma/prisma.service';

// ── Event Payloads ──────────────────────────────────────────────

export interface OrderStatusChangedPayload {
  orderId: string;
  orderNumber: string;
  customerId: string;
  oldStatus: string;
  newStatus: string;
}

export interface OrderApprovedPayload {
  orderId: string;
  orderNumber: string;
  customerId: string;
  approvedBy: string;
}

export interface OrderCancelledPayload {
  orderId: string;
  orderNumber: string;
  customerId: string;
  reason: string;
}

export interface DesignFileReviewedPayload {
  fileId: string;
  orderId: string;
  fileName: string;
  uploadedByUserId: string;
  newStatus: string;
  notes?: string;
}

export interface InvoiceIssuedPayload {
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  amount: number;
}

export interface ProductionJobCompletedPayload {
  jobId: string;
  jobNumber: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
}

// ── Listener ────────────────────────────────────────────────────

@Injectable()
export class NotificationEventListener {
  private readonly logger = new Logger(NotificationEventListener.name);

  constructor(
    private readonly sendNotification: SendNotificationUseCase,
    private readonly prisma: PrismaService,
  ) {}

  // ── Order Status Changed ──────────────────────────────────────
  @OnEvent('order.status.changed')
  async handleOrderStatusChanged(payload: OrderStatusChangedPayload) {
    this.logger.log(
      `[Event] order.status.changed → ${payload.orderNumber}: ${payload.oldStatus} → ${payload.newStatus}`,
    );

    // Find the userId linked to this customer
    const userId = await this.resolveUserIdFromCustomer(payload.customerId);
    if (!userId) return;

    const statusLabels: Record<string, string> = {
      Approved: 'Disetujui',
      In_Production: 'Sedang Diproduksi',
      Quality_Check: 'Pengecekan Kualitas',
      Ready_For_Pickup: 'Siap Diambil',
      Shipped: 'Sedang Dikirim',
      Delivered: 'Sudah Diterima',
      Completed: 'Selesai',
    };

    const label = statusLabels[payload.newStatus] || payload.newStatus;

    await this.sendNotification.execute({
      userId,
      type: NotificationType.ORDER_UPDATE,
      title: `Pesanan ${payload.orderNumber} — ${label}`,
      message: `Status pesanan Anda berubah dari "${payload.oldStatus}" menjadi "${label}".`,
      metadata: {
        orderId: payload.orderId,
        orderNumber: payload.orderNumber,
        oldStatus: payload.oldStatus,
        newStatus: payload.newStatus,
      },
    });
  }

  // ── Order Approved ────────────────────────────────────────────
  @OnEvent('order.approved')
  async handleOrderApproved(payload: OrderApprovedPayload) {
    this.logger.log(
      `[Event] order.approved → ${payload.orderNumber}`,
    );

    const userId = await this.resolveUserIdFromCustomer(payload.customerId);
    if (!userId) return;

    await this.sendNotification.execute({
      userId,
      type: NotificationType.ORDER_UPDATE,
      title: `Pesanan ${payload.orderNumber} Disetujui ✅`,
      message: `Pesanan Anda telah disetujui dan siap diproses ke tahap produksi.`,
      metadata: {
        orderId: payload.orderId,
        orderNumber: payload.orderNumber,
      },
    });
  }

  // ── Order Cancelled ───────────────────────────────────────────
  @OnEvent('order.cancelled')
  async handleOrderCancelled(payload: OrderCancelledPayload) {
    this.logger.log(
      `[Event] order.cancelled → ${payload.orderNumber}`,
    );

    const userId = await this.resolveUserIdFromCustomer(payload.customerId);
    if (!userId) return;

    await this.sendNotification.execute({
      userId,
      type: NotificationType.ORDER_UPDATE,
      title: `Pesanan ${payload.orderNumber} Dibatalkan`,
      message: `Pesanan dibatalkan dengan alasan: ${payload.reason}`,
      metadata: {
        orderId: payload.orderId,
        orderNumber: payload.orderNumber,
        reason: payload.reason,
      },
    });
  }

  // ── Design File Reviewed ──────────────────────────────────────
  @OnEvent('design.reviewed')
  async handleDesignFileReviewed(payload: DesignFileReviewedPayload) {
    this.logger.log(
      `[Event] design.reviewed → file ${payload.fileName}: ${payload.newStatus}`,
    );

    const statusMessages: Record<string, string> = {
      Approved: `File desain "${payload.fileName}" telah disetujui. Produksi dapat dilanjutkan.`,
      Rejected: `File desain "${payload.fileName}" ditolak. Alasan: ${payload.notes || '-'}`,
      Revision_Required: `File desain "${payload.fileName}" perlu direvisi. Catatan: ${payload.notes || '-'}`,
    };

    const message =
      statusMessages[payload.newStatus] ||
      `File desain "${payload.fileName}" telah di-review (${payload.newStatus}).`;

    await this.sendNotification.execute({
      userId: payload.uploadedByUserId,
      type: NotificationType.ORDER_UPDATE,
      title: `Review Desain — ${payload.newStatus === 'Approved' ? 'Disetujui ✅' : payload.newStatus === 'Rejected' ? 'Ditolak ❌' : 'Perlu Revisi ⚠️'}`,
      message,
      metadata: {
        fileId: payload.fileId,
        orderId: payload.orderId,
        fileName: payload.fileName,
        status: payload.newStatus,
      },
    });
  }

  // ── Invoice Issued ────────────────────────────────────────────
  @OnEvent('invoice.issued')
  async handleInvoiceIssued(payload: InvoiceIssuedPayload) {
    this.logger.log(
      `[Event] invoice.issued → ${payload.invoiceNumber}`,
    );

    // For invoices, customerId is already a userId
    await this.sendNotification.execute({
      userId: payload.customerId,
      type: NotificationType.PAYMENT_RECEIVED,
      title: `Invoice ${payload.invoiceNumber} Diterbitkan`,
      message: `Invoice sebesar Rp ${payload.amount.toLocaleString('id-ID')} telah diterbitkan. Silakan lakukan pembayaran sebelum jatuh tempo.`,
      metadata: {
        invoiceId: payload.invoiceId,
        invoiceNumber: payload.invoiceNumber,
        amount: payload.amount,
      },
    });
  }

  // ── Production Job Completed ──────────────────────────────────
  @OnEvent('production.completed')
  async handleProductionCompleted(payload: ProductionJobCompletedPayload) {
    this.logger.log(
      `[Event] production.completed → job ${payload.jobNumber}`,
    );

    const userId = await this.resolveUserIdFromCustomer(payload.customerId);
    if (!userId) return;

    await this.sendNotification.execute({
      userId,
      type: NotificationType.PRODUCTION_COMPLETE,
      title: `Produksi Selesai — ${payload.orderNumber}`,
      message: `Proses produksi untuk pesanan ${payload.orderNumber} telah selesai dan memasuki tahap pengecekan kualitas.`,
      metadata: {
        jobId: payload.jobId,
        orderId: payload.orderId,
        orderNumber: payload.orderNumber,
      },
    });
  }

  // ── Helper ────────────────────────────────────────────────────
  private async resolveUserIdFromCustomer(
    customerId: string,
  ): Promise<string | null> {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: { email: true },
    });
    if (!customer?.email) return null;

    const user = await this.prisma.user.findFirst({
      where: { email: customer.email },
      select: { id: true },
    });
    return user?.id || null;
  }
}
