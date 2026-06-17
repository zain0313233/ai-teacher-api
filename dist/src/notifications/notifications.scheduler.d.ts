import { NotificationsService } from './notifications.service';
export declare class NotificationsScheduler {
    private notificationsService;
    private readonly logger;
    constructor(notificationsService: NotificationsService);
    handleDueReminders(): Promise<void>;
}
