"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const realtime_gateway_1 = require("../realtime/realtime.gateway");
const supabase_service_1 = require("../documents/supabase.service");
let ClassChatService = class ClassChatService {
    prisma;
    realtime;
    supabase;
    constructor(prisma, realtime, supabase) {
        this.prisma = prisma;
        this.realtime = realtime;
        this.supabase = supabase;
    }
    async canAccessClassroom(userId, classroomId) {
        const classroom = await this.prisma.classroom.findUnique({
            where: { id: classroomId },
            select: { teacherId: true, isActive: true },
        });
        if (!classroom || !classroom.isActive)
            return false;
        if (classroom.teacherId === userId)
            return true;
        const enrollment = await this.prisma.classEnrollment.findFirst({
            where: { classroomId, studentId: userId, status: 'active' },
        });
        return Boolean(enrollment);
    }
    async assertAccess(userId, classroomId) {
        const ok = await this.canAccessClassroom(userId, classroomId);
        if (!ok)
            throw new common_1.ForbiddenException('You cannot access this class chat');
    }
    formatMessage(row, teacherId) {
        return {
            ...row,
            isTeacher: row.sender.id === teacherId,
        };
    }
    async getMessages(userId, classroomId, cursor, limit = 50) {
        await this.assertAccess(userId, classroomId);
        const classroom = await this.prisma.classroom.findUnique({
            where: { id: classroomId },
            select: { teacherId: true, name: true, subject: true },
        });
        if (!classroom)
            throw new common_1.NotFoundException('Classroom not found');
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
    async sendMessage(userId, dto) {
        await this.assertAccess(userId, dto.classroomId);
        const messageType = dto.messageType || 'text';
        const hasFile = Boolean(dto.fileUrl);
        const hasText = Boolean(dto.content?.trim());
        if (messageType === 'text' && !hasText) {
            throw new common_1.BadRequestException('Message text is required');
        }
        if (['image', 'document', 'voice'].includes(messageType) && !hasFile) {
            throw new common_1.BadRequestException('File is required for this message type');
        }
        const classroom = await this.prisma.classroom.findUnique({
            where: { id: dto.classroomId },
            select: { teacherId: true, name: true },
        });
        if (!classroom)
            throw new common_1.NotFoundException('Classroom not found');
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
    buildChatPreview(message) {
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
    async getClassroomMemberIds(classroomId) {
        const classroom = await this.prisma.classroom.findUnique({
            where: { id: classroomId },
            select: { teacherId: true },
        });
        if (!classroom)
            return [];
        const enrollments = await this.prisma.classEnrollment.findMany({
            where: { classroomId, status: 'active' },
            select: { studentId: true },
        });
        return [classroom.teacherId, ...enrollments.map((e) => e.studentId)];
    }
    async broadcastChatToast(classroomId, classroomName, senderId, message) {
        const memberIds = await this.getClassroomMemberIds(classroomId);
        const preview = this.buildChatPreview(message);
        for (const memberId of memberIds) {
            if (memberId === senderId)
                continue;
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
    async uploadAttachment(userId, classroomId, file, messageType) {
        await this.assertAccess(userId, classroomId);
        if (!file.buffer?.length) {
            throw new common_1.BadRequestException('Uploaded file is empty');
        }
        const maxBytes = messageType === 'voice' ? 10 * 1024 * 1024 : 15 * 1024 * 1024;
        if (file.size > maxBytes) {
            throw new common_1.BadRequestException(`File too large (max ${Math.round(maxBytes / 1024 / 1024)}MB)`);
        }
        if (messageType === 'image' && !file.mimetype.startsWith('image/')) {
            throw new common_1.BadRequestException('Only image files are allowed');
        }
        const folder = `class-chat/${classroomId}`;
        const mimeType = file.mimetype && file.mimetype !== 'application/octet-stream'
            ? file.mimetype
            : messageType === 'voice'
                ? 'audio/webm'
                : file.mimetype;
        let fileUrl;
        try {
            fileUrl = await this.supabase.uploadBuffer(file.buffer, file.originalname, mimeType, folder);
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message || 'File upload failed');
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
};
exports.ClassChatService = ClassChatService;
exports.ClassChatService = ClassChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => realtime_gateway_1.RealtimeGateway))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        realtime_gateway_1.RealtimeGateway,
        supabase_service_1.SupabaseService])
], ClassChatService);
//# sourceMappingURL=class-chat.service.js.map