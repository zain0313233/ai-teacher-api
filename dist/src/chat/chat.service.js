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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let ChatService = class ChatService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSessions(userId) {
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
    async createSession(userId, dto) {
        return this.prisma.chatSession.create({
            data: {
                userId,
                title: dto.title || 'New Chat',
                subject: dto.subject || null,
                context: (dto.context || client_1.Prisma.JsonNull),
            },
        });
    }
    async getSession(userId, sessionId) {
        const session = await this.prisma.chatSession.findUnique({
            where: { id: sessionId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        if (session.userId !== userId)
            throw new common_1.ForbiddenException();
        return session;
    }
    async addMessage(userId, sessionId, dto) {
        const session = await this.prisma.chatSession.findUnique({
            where: { id: sessionId },
            select: { userId: true },
        });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        if (session.userId !== userId)
            throw new common_1.ForbiddenException();
        const message = await this.prisma.chatMessage.create({
            data: {
                sessionId,
                role: dto.role,
                content: dto.content,
                metadata: (dto.metadata || client_1.Prisma.JsonNull),
            },
        });
        const updateData = { updatedAt: new Date() };
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
    async updateSessionTitle(userId, sessionId, title) {
        const session = await this.prisma.chatSession.findUnique({
            where: { id: sessionId },
            select: { userId: true },
        });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        if (session.userId !== userId)
            throw new common_1.ForbiddenException();
        return this.prisma.chatSession.update({
            where: { id: sessionId },
            data: { title },
        });
    }
    async deleteSession(userId, sessionId) {
        const session = await this.prisma.chatSession.findUnique({
            where: { id: sessionId },
            select: { userId: true },
        });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        if (session.userId !== userId)
            throw new common_1.ForbiddenException();
        await this.prisma.chatSession.delete({ where: { id: sessionId } });
        return { success: true };
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatService);
//# sourceMappingURL=chat.service.js.map