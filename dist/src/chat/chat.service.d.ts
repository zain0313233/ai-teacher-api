import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SendMessageDto } from './dto/send-message.dto';
export declare class ChatService {
    private prisma;
    constructor(prisma: PrismaService);
    getSessions(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        subject: string | null;
        context: Prisma.JsonValue;
        title: string;
        messages: {
            role: string;
            createdAt: Date;
            content: string;
        }[];
    }[]>;
    createSession(userId: string, dto: CreateSessionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        subject: string | null;
        context: Prisma.JsonValue | null;
        title: string;
    }>;
    getSession(userId: string, sessionId: string): Promise<{
        messages: {
            id: string;
            role: string;
            createdAt: Date;
            content: string;
            metadata: Prisma.JsonValue | null;
            sessionId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        subject: string | null;
        context: Prisma.JsonValue | null;
        title: string;
    }>;
    addMessage(userId: string, sessionId: string, dto: SendMessageDto): Promise<{
        id: string;
        role: string;
        createdAt: Date;
        content: string;
        metadata: Prisma.JsonValue | null;
        sessionId: string;
    }>;
    updateSessionTitle(userId: string, sessionId: string, title: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        subject: string | null;
        context: Prisma.JsonValue | null;
        title: string;
    }>;
    deleteSession(userId: string, sessionId: string): Promise<{
        success: boolean;
    }>;
}
