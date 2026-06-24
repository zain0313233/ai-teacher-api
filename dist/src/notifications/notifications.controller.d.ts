import { NotificationsService } from './notifications.service';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getPreferences(req: any): Promise<{
        success: boolean;
        preferences: {
            emailNotifyAssignments: boolean;
            emailNotifyDueReminders: boolean;
            inAppNotifications: boolean;
        };
    }>;
    updatePreferences(req: any, dto: UpdateNotificationPreferencesDto): Promise<{
        success: boolean;
        preferences: {
            emailNotifyAssignments: boolean;
            emailNotifyDueReminders: boolean;
            inAppNotifications: boolean;
        };
    }>;
    list(req: any, limit?: string, unreadOnly?: string): Promise<{
        success: boolean;
        notifications: {
            link: string | null;
            id: string;
            createdAt: Date;
            userId: string;
            title: string;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            type: string;
            body: string;
            readAt: Date | null;
        }[];
        unreadCount: number;
    }>;
    unreadCount(req: any): Promise<{
        success: boolean;
        unreadCount: number;
    }>;
    markRead(req: any, id: string): Promise<{
        success: boolean;
        unreadCount: number;
    }>;
    markAllRead(req: any): Promise<{
        success: boolean;
        unreadCount: number;
    }>;
}
