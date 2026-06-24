import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { ClassChatService } from '../class-chat/class-chat.service';

@Injectable()
@WebSocketGateway({
  namespace: '/realtime',
  cors: { origin: true, credentials: true },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
    @Inject(forwardRef(() => ClassChatService))
    private classChatService: ClassChatService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth?.token as string) ||
        (client.handshake.headers?.authorization as string)?.replace(/^Bearer\s+/i, '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify<{ id: string; role?: string }>(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });

      if (!payload?.id) {
        client.disconnect();
        return;
      }

      client.data.userId = payload.id;
      client.data.role = payload.role;
      await client.join(`user:${payload.id}`);
      this.logger.debug(`Client connected user:${payload.id}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data?.userId) {
      this.logger.debug(`Client disconnected user:${client.data.userId}`);
    }
  }

  emitToUser(userId: string, event: string, data: unknown) {
    this.server?.to(`user:${userId}`).emit(event, data);
  }

  emitToClassroom(classroomId: string, event: string, data: unknown) {
    this.server?.to(`classroom:${classroomId}`).emit(event, data);
  }

  @SubscribeMessage('join_classroom')
  async handleJoinClassroom(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { classroomId?: string },
  ) {
    const userId = client.data?.userId as string | undefined;
    const classroomId = body?.classroomId;
    if (!userId || !classroomId) {
      return { ok: false, error: 'Invalid request' };
    }

    const allowed = await this.classChatService.canAccessClassroom(userId, classroomId);
    if (!allowed) {
      return { ok: false, error: 'Not allowed' };
    }

    await client.join(`classroom:${classroomId}`);
    return { ok: true, classroomId };
  }

  @SubscribeMessage('leave_classroom')
  async handleLeaveClassroom(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { classroomId?: string },
  ) {
    if (body?.classroomId) {
      await client.leave(`classroom:${body.classroomId}`);
    }
    return { ok: true };
  }

  @SubscribeMessage('chat:send')
  async handleChatSend(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    body: {
      classroomId?: string;
      messageType?: string;
      content?: string;
      fileUrl?: string;
      fileName?: string;
      mimeType?: string;
      fileSize?: number;
      durationSec?: number;
      replyToId?: string;
    },
  ) {
    const userId = client.data?.userId as string | undefined;
    if (!userId || !body?.classroomId) {
      return { ok: false, error: 'Invalid request' };
    }

    try {
      const message = await this.classChatService.sendMessage(userId, {
        classroomId: body.classroomId,
        messageType: (body.messageType as any) || 'text',
        content: body.content,
        fileUrl: body.fileUrl,
        fileName: body.fileName,
        mimeType: body.mimeType,
        fileSize: body.fileSize,
        durationSec: body.durationSec,
        replyToId: body.replyToId,
      });
      return { ok: true, message };
    } catch (error: any) {
      return { ok: false, error: error.message || 'Failed to send' };
    }
  }
}
