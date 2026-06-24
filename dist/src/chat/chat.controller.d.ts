import { ChatService } from './chat.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SendMessageDto } from './dto/send-message.dto';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getSessions(req: any): Promise<{
        success: boolean;
        sessions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            subject: string | null;
            messages: {
                role: string;
                createdAt: Date;
                content: string;
            }[];
            context: import("@prisma/client/runtime/client").JsonValue;
            title: string;
        }[];
    }>;
    createSession(req: any, dto: CreateSessionDto): Promise<{
        success: boolean;
        session: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            subject: string | null;
            context: import("@prisma/client/runtime/client").JsonValue | null;
            title: string;
        };
    }>;
    getSession(req: any, id: string): Promise<{
        success: boolean;
        session: {
            messages: {
                id: string;
                role: string;
                createdAt: Date;
                content: string;
                metadata: import("@prisma/client/runtime/client").JsonValue | null;
                sessionId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            subject: string | null;
            context: import("@prisma/client/runtime/client").JsonValue | null;
            title: string;
        };
    }>;
    addMessage(req: any, id: string, dto: SendMessageDto): Promise<{
        success: boolean;
        message: {
            id: string;
            role: string;
            createdAt: Date;
            content: string;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            sessionId: string;
        };
    }>;
    updateSession(req: any, id: string, body: {
        title: string;
    }): Promise<{
        success: boolean;
        session: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            subject: string | null;
            context: import("@prisma/client/runtime/client").JsonValue | null;
            title: string;
        };
    }>;
    deleteSession(req: any, id: string): Promise<{
        success: boolean;
    }>;
}
