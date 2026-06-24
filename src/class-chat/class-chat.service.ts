import {
  ForbiddenException,
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
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
  sender: { id: string; name: string; role: string };
  isTeacher: boolean;
};

@Injectable()
export class ClassChatService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => RealtimeGateway))
    private realtime: RealtimeGateway,
    private supabase: SupabaseService,
  ) {}

  async canAccessClassroom(userId: string, classroomId: string) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classroomId },
      select: { teacherId: true, isActive: true },
    });
    if (!classroom || !classroom.isActive) return false;
    if (classroom.teacherId === userId) return true;

    const enrollment = await this.prisma.classEnrollment.findFirst({
      where: { classroomId, studentId: userId, status: 'active' },
    });
    return Boolean(enrollment);
  }

  private async assertAccess(userId: string, classroomId: string) {
    const ok = await this.canAccessClassroom(userId, classroomId);
    if (!ok) throw new ForbiddenException('You cannot access this class chat');
  }

  private formatMessage(
    row: {
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
      sender: { id: string; name: string; role: string };
    },
    teacherId: string,
  ): ClassMessageView {
    return {
      ...row,
      isTeacher: row.sender.id === teacherId,
    };
  }

  async getMessages(
    userId: string,
    classroomId: string,
    cursor?: string,
    limit = 50,
  ) {
    await this.assertAccess(userId, classroomId);

    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classroomId },
      select: { teacherId: true, name: true, subject: true },
    });
    if (!classroom) throw new NotFoundException('Classroom not found');

    const take = Math.min(Math.max(limit, 1), 100);
    const rows = await this.prisma.classMessage.findMany({
      where: { classroomId },
      orderBy: { createdAt: 'desc' },
      take: take + 1,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
      include: {
        sender: { select: { id: true, name: true, role: true } },
      },
    });

    const hasMore = rows.length > take;
    const slice = hasMore ? rows.slice(0, take) : rows;
    const messages = slice
      .reverse()
      .map((r) => this.formatMessage(r, classroom.teacherId));

    return {
      success: true,
      classroom: { id: classroomId, name: classroom.name, subject: classroom.subject },
      messages,
      nextCursor: hasMore ? slice[slice.length - 1]?.id : null,
      hasMore,
    };
  }

  async sendMessage(userId: string, dto: SendClassMessageDto) {
    await this.assertAccess(userId, dto.classroomId);

    const messageType = dto.messageType || 'text';
    const hasFile = Boolean(dto.fileUrl);
    const hasText = Boolean(dto.content?.trim());

    if (messageType === 'text' && !hasText) {
      throw new BadRequestException('Message text is required');
    }
    if (['image', 'document', 'voice'].includes(messageType) && !hasFile) {
      throw new BadRequestException('File is required for this message type');
    }

    const classroom = await this.prisma.classroom.findUnique({
      where: { id: dto.classroomId },
      select: { teacherId: true, name: true },
    });
    if (!classroom) throw new NotFoundException('Classroom not found');

    const created = await this.prisma.classMessage.create({
      data: {
        classroomId: dto.classroomId,
        senderId: userId,
        messageType,
        content: dto.content?.trim() || null,
        fileUrl: dto.fileUrl || null,
        fileName: dto.fileName || null,
        mimeType: dto.mimeType || null,
        fileSize: dto.fileSize ?? null,
        durationSec: dto.durationSec ?? null,
        replyToId: dto.replyToId || null,
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
      },
    });

    const payload = this.formatMessage(created, classroom.teacherId);
    this.realtime.emitToClassroom(dto.classroomId, 'chat:message', payload);
    await this.broadcastChatToast(dto.classroomId, classroom.name, userId, payload);
    return payload;
  }

  private buildChatPreview(message: ClassMessageView): string {
    if (message.messageType === 'voice') {
      return 'sent a voice message';
    }
    if (message.messageType === 'image') {
      return message.content?.trim() || 'sent a photo';
    }
    if (message.messageType === 'document') {
      return message.content?.trim() || `sent ${message.fileName || 'a document'}`;
    }
    return message.content?.trim() || '';
  }

  private async getClassroomMemberIds(classroomId: string): Promise<string[]> {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classroomId },
      select: { teacherId: true },
    });
    if (!classroom) return [];

    const enrollments = await this.prisma.classEnrollment.findMany({
      where: { classroomId, status: 'active' },
      select: { studentId: true },
    });

    return [classroom.teacherId, ...enrollments.map((e) => e.studentId)];
  }

  private async broadcastChatToast(
    classroomId: string,
    classroomName: string,
    senderId: string,
    message: ClassMessageView,
  ) {
    const memberIds = await this.getClassroomMemberIds(classroomId);
    const preview = this.buildChatPreview(message);

    for (const memberId of memberIds) {
      if (memberId === senderId) continue;
      this.realtime.emitToUser(memberId, 'chat:toast', {
        classroomId,
        classroomName,
        senderId: message.sender.id,
        senderName: message.sender.name,
        isTeacher: message.isTeacher,
        messageType: message.messageType,
        preview,
      });
    }
  }

  async uploadAttachment(
    userId: string,
    classroomId: string,
    file: Express.Multer.File,
    messageType: 'image' | 'document' | 'voice',
  ) {
    await this.assertAccess(userId, classroomId);

    if (!file.buffer?.length) {
      throw new BadRequestException('Uploaded file is empty');
    }

    const maxBytes = messageType === 'voice' ? 10 * 1024 * 1024 : 15 * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new BadRequestException(`File too large (max ${Math.round(maxBytes / 1024 / 1024)}MB)`);
    }

    if (messageType === 'image' && !file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }

    const folder = `class-chat/${classroomId}`;
    const mimeType =
      file.mimetype && file.mimetype !== 'application/octet-stream'
        ? file.mimetype
        : messageType === 'voice'
          ? 'audio/webm'
          : file.mimetype;

    let fileUrl: string;
    try {
      fileUrl = await this.supabase.uploadBuffer(
        file.buffer,
        file.originalname,
        mimeType,
        folder,
      );
    } catch (error: any) {
      throw new BadRequestException(error.message || 'File upload failed');
    }

    return {
      success: true,
      fileUrl,
      fileName: file.originalname,
      mimeType,
      fileSize: file.size,
      messageType,
    };
  }
}
