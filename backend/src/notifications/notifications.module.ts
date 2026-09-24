import { Module } from '@nestjs/common';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { NotificationsController } from './notifications.controller';
import { SendNotificationUseCase } from './use-cases/send-notification.usecase';
import { NotificationEventListener } from './notification-event.listener';
import { EmailNotificationProcessor } from './jobs/email-notification.processor';
import { BullModule } from '@nestjs/bullmq';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    BullModule.registerQueue({
      name: 'email-notification',
    }),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsGateway,
    SendNotificationUseCase,
    NotificationEventListener,
    EmailNotificationProcessor,
  ],
  exports: [SendNotificationUseCase, NotificationsGateway],
})
export class NotificationsModule {}

