import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsGateway } from '../gateways/notifications.gateway';
import { NotificationType, NotificationChannel } from '../domain/notification.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

interface SendNotificationCommand {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  forceChannels?: NotificationChannel[];
}

@Injectable()
export class SendNotificationUseCase {
  private readonly logger = new Logger(SendNotificationUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationsGateway,
    @InjectQueue('email-notification') private readonly emailQueue: Queue,
  ) {}

  async execute(command: SendNotificationCommand): Promise<void> {
    const { userId, type, title, message, metadata, forceChannels } = command;

    // Fetch user preferences
    const prefs = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });

    const channels: string[] = forceChannels ? [...forceChannels] : [];

    if (!forceChannels) {
      if (prefs?.inAppEnabled ?? true) channels.push(NotificationChannel.IN_APP);
      if (prefs?.emailEnabled ?? true) channels.push(NotificationChannel.EMAIL);
      // if (prefs?.pushEnabled) channels.push(NotificationChannel.PUSH);
    }

    if (channels.length === 0) {
      this.logger.debug(`No channels enabled for user ${userId}, skipping notification.`);
      return;
    }

    // Always store notification in database if In_App is enabled
    // Actually, store it anyway for audit trail, but mark channels array
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        metadata: metadata || {},
        channels,
      },
    });

    // Deliver via real-time WebSocket if IN_APP
    if (channels.includes(NotificationChannel.IN_APP)) {
      this.gateway.sendNotificationToUser(userId, {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
        metadata: notification.metadata,
      });
    }

    // Deliver via Email Queue if EMAIL
    if (channels.includes(NotificationChannel.EMAIL)) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user && user.email) {
        await this.emailQueue.add('send-email', {
          to: user.email,
          subject: title,
          body: message,
          notificationId: notification.id,
        }, {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
        });
      }
    }
  }
}
