import { Module } from '@nestjs/common';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { NotificationsController } from './notifications.controller';
import { SendNotificationUseCase } from './use-cases/send-notification.usecase';
import { EmailNotificationProcessor } from './jobs/email-notification.processor';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email-notification',
    }),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsGateway,
    SendNotificationUseCase,
    EmailNotificationProcessor,
  ],
  exports: [SendNotificationUseCase],
})
export class NotificationsModule {}
