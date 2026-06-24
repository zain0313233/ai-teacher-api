import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { ClassChatService } from '../class-chat/class-chat.service';
export declare class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private configService;
    private prisma;
    private classChatService;
    server: Server;
    private readonly logger;
    constructor(jwtService: JwtService, configService: ConfigService, prisma: PrismaService, classChatService: ClassChatService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    emitToUser(userId: string, event: string, data: unknown): void;
    emitToClassroom(classroomId: string, event: string, data: unknown): void;
    handleJoinClassroom(client: Socket, body: {
        classroomId?: string;
    }): Promise<{
        ok: boolean;
        error: string;
        classroomId?: undefined;
    } | {
        ok: boolean;
        classroomId: string;
        error?: undefined;
    }>;
    handleLeaveClassroom(client: Socket, body: {
        classroomId?: string;
    }): Promise<{
        ok: boolean;
    }>;
    handleChatSend(client: Socket, body: {
        classroomId?: string;
        messageType?: string;
        content?: string;
        fileUrl?: string;
        fileName?: string;
        mimeType?: string;
        fileSize?: number;
        durationSec?: number;
        replyToId?: string;
    }): Promise<{
        ok: boolean;
        message: import("../class-chat/class-chat.service").ClassMessageView;
        error?: undefined;
    } | {
        ok: boolean;
        error: any;
        message?: undefined;
    }>;
}
