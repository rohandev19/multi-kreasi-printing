import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

export interface EmailNotificationJobData {
  to: string;
  subject: string;
  body: string;
  notificationId: string;
}

@Processor('email-notification')
export class EmailNotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailNotificationProcessor.name);

  async process(
    job: Job<EmailNotificationJobData>,
  ): Promise<{ success: boolean } | undefined> {
    if (job.name === 'send-email') {
      const { to, subject, body, notificationId } = job.data;

      this.logger.log(
        `Mock sending email to: ${to} (Notification ${notificationId})`,
      );
      this.logger.debug(`Email Subject: ${subject}`);
      this.logger.debug(`Email Body: ${body}`);

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      this.logger.log(`Email successfully sent to ${to}`);
      return { success: true };
    }
  }
}
