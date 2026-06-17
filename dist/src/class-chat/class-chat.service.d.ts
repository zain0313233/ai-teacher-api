import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { SupabaseService } from '../documents/supabase.service';
import { SendClassMessageDto } from './dto/send-class-message.dto';
export type ClassMessageView = {
    id: string;
    classroomId: string;
    messageType: string;
    content: string | null;
    fileUrl: string | null;
    fileName: string | null;
    mimeType: string | null;
    fileSize: number | null;
    durationSec: number | null;
    replyToId: string | null;
    createdAt: Date;
    sender: {
        id: string;
        name: string;
        role: string;
    };
    isTeacher: boolean;
};
export declare class ClassChatService {
    private prisma;
    private realtime;
    private supabase;
    constructor(prisma: PrismaService, realtime: RealtimeGateway, supabase: SupabaseService);
    canAccessClassroom(userId: string, classroomId: string): Promise<boolean>;
    private assertAccess;
    private formatMessage;
    getMessages(userId: string, classroomId: string, cursor?: string, limit?: number): Promise<{
        success: boolean;
        classroom: {
            id: string;
            name: string;
            subject: string;
        };
        messages: ClassMessageView[];
        nextCursor: string | null;
        hasMore: boolean;
    }>;
    sendMessage(userId: string, dto: SendClassMessageDto): Promise<ClassMessageView>;
    private buildChatPreview;
    private getClassroomMemberIds;
    private broadcastChatToast;
    uploadAttachment(userId: string, classroomId: string, file: Express.Multer.File, messageType: 'image' | 'document' | 'voice'): Promise<{
        success: boolean;
        fileUrl: string;
        fileName: string;
        mimeType: string;
        fileSize: number;
        messageType: "document" | "image" | "voice";
    }>;
}
