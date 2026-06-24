import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getSessions(userId: string) {
    return this.prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        subject: true,
        context: true,
        createdAt: true,
        updatedAt: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { content: true, role: true, createdAt: true },
        },
      },
    });
  }

  async createSession(userId: string, dto: CreateSessionDto) {
    return this.prisma.chatSession.create({
      data: {
        userId,
        title: dto.title || 'New Chat',
        subject: dto.subject || null,
        context: (dto.context || Prisma.JsonNull) as any,
      },
    });
  }

  async getSession(userId: string, sessionId: string) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) throw new NotFoundException('Session not found');
    if (session.userId !== userId) throw new ForbiddenException();

    return session;
  }

  async addMessage(userId: string, sessionId: string, dto: SendMessageDto) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
      select: { userId: true },
    });

    if (!session) throw new NotFoundException('Session not found');
    if (session.userId !== userId) throw new ForbiddenException();

    const message = await this.prisma.chatMessage.create({
      data: {
        sessionId,
        role: dto.role,
        content: dto.content,
        metadata: (dto.metadata || Prisma.JsonNull) as any,
      },
    });

    // Update session's updatedAt and title (auto-title from first user message)
    const updateData: any = { updatedAt: new Date() };
    if (dto.role === 'user') {
      const msgCount = await this.prisma.chatMessage.count({ where: { sessionId } });
      if (msgCount <= 2) {
        updateData.title = dto.content.slice(0, 80);
      }
    }
    await this.prisma.chatSession.update({
      where: { id: sessionId },
      data: updateData,
    });

    return message;
  }

  async updateSessionTitle(userId: string, sessionId: string, title: string) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
      select: { userId: true },
    });

    if (!session) throw new NotFoundException('Session not found');
    if (session.userId !== userId) throw new ForbiddenException();

    return this.prisma.chatSession.update({
      where: { id: sessionId },
      data: { title },
    });
  }

  async deleteSession(userId: string, sessionId: string) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
      select: { userId: true },
    });

    if (!session) throw new NotFoundException('Session not found');
    if (session.userId !== userId) throw new ForbiddenException();

    await this.prisma.chatSession.delete({ where: { id: sessionId } });
    return { success: true };
  }
}
