import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../auth/email.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';
export type NotificationPayload = {
    type: string;
    title: string;
    body: string;
    link?: string;
    metadata?: Record<string, unknown>;
};
export declare class NotificationsService {
    private prisma;
    private emailService;
    private realtime;
    private configService;
    constructor(prisma: PrismaService, emailService: EmailService, realtime: RealtimeGateway, configService: ConfigService);
    private frontendBase;
    getPreferences(userId: string): Promise<{
        success: boolean;
        preferences: {
            emailNotifyAssignments: boolean;
            emailNotifyDueReminders: boolean;
            inAppNotifications: boolean;
        };
    }>;
    updatePreferences(userId: string, dto: UpdateNotificationPreferencesDto): Promise<{
        success: boolean;
        preferences: {
            emailNotifyAssignments: boolean;
            emailNotifyDueReminders: boolean;
            inAppNotifications: boolean;
        };
    }>;
    listForUser(userId: string, limit?: number, unreadOnly?: boolean): Promise<{
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
    markRead(userId: string, notificationId: string): Promise<{
        success: boolean;
        unreadCount: number;
    }>;
    markAllRead(userId: string): Promise<{
        success: boolean;
        unreadCount: number;
    }>;
    createForUser(userId: string, payload: NotificationPayload, options?: {
        pushRealtime?: boolean;
    }): Promise<{
        link: string | null;
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        type: string;
        body: string;
        readAt: Date | null;
    } | null>;
    notifyClassStudents(classroomId: string, payload: NotificationPayload, emailFn?: (student: {
        id: string;
        name: string;
        email: string;
    }) => Promise<void>): Promise<void>;
    notifyNewAssignment(assignment: {
        id: string;
        title: string;
        assignmentMode: string;
        dueAt: Date | null;
    }, classroom: {
        id: string;
        name: string;
    }): Promise<void>;
    notifyMaterialShared(classroom: {
        id: string;
        name: string;
    }, materialTitle: string): Promise<void>;
    processDueReminders(): Promise<number>;
}
