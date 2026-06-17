import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from './notifications.service';

@Injectable()
export class NotificationsScheduler {
  private readonly logger = new Logger(NotificationsScheduler.name);

  constructor(private notificationsService: NotificationsService) {}

  /** Every hour — notify students ~24h before assignment due */
  @Cron(CronExpression.EVERY_HOUR)
  async handleDueReminders() {
    try {
      await this.notificationsService.processDueReminders();
    } catch (error: any) {
      this.logger.error(`Due reminder job failed: ${error.message}`);
    }
  }
}
