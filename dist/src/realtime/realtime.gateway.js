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
var RealtimeGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const socket_io_1 = require("socket.io");
const prisma_service_1 = require("../prisma/prisma.service");
const class_chat_service_1 = require("../class-chat/class-chat.service");
let RealtimeGateway = RealtimeGateway_1 = class RealtimeGateway {
    jwtService;
    configService;
    prisma;
    classChatService;
    server;
    logger = new common_1.Logger(RealtimeGateway_1.name);
    constructor(jwtService, configService, prisma, classChatService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.prisma = prisma;
        this.classChatService = classChatService;
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth?.token ||
                client.handshake.headers?.authorization?.replace(/^Bearer\s+/i, '');
            if (!token) {
                client.disconnect();
                return;
            }
            const payload = this.jwtService.verify(token, {
                secret: this.configService.get('JWT_ACCESS_SECRET'),
            });
            if (!payload?.id) {
                client.disconnect();
                return;
            }
            client.data.userId = payload.id;
            client.data.role = payload.role;
            await client.join(`user:${payload.id}`);
            this.logger.debug(`Client connected user:${payload.id}`);
        }
        catch {
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        if (client.data?.userId) {
            this.logger.debug(`Client disconnected user:${client.data.userId}`);
        }
    }
    emitToUser(userId, event, data) {
        this.server?.to(`user:${userId}`).emit(event, data);
    }
    emitToClassroom(classroomId, event, data) {
        this.server?.to(`classroom:${classroomId}`).emit(event, data);
    }
    async handleJoinClassroom(client, body) {
        const userId = client.data?.userId;
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
    async handleLeaveClassroom(client, body) {
        if (body?.classroomId) {
            await client.leave(`classroom:${body.classroomId}`);
        }
        return { ok: true };
    }
    async handleChatSend(client, body) {
        const userId = client.data?.userId;
        if (!userId || !body?.classroomId) {
            return { ok: false, error: 'Invalid request' };
        }
        try {
            const message = await this.classChatService.sendMessage(userId, {
                classroomId: body.classroomId,
                messageType: body.messageType || 'text',
                content: body.content,
                fileUrl: body.fileUrl,
                fileName: body.fileName,
                mimeType: body.mimeType,
                fileSize: body.fileSize,
                durationSec: body.durationSec,
                replyToId: body.replyToId,
            });
            return { ok: true, message };
        }
        catch (error) {
            return { ok: false, error: error.message || 'Failed to send' };
        }
    }
};
exports.RealtimeGateway = RealtimeGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RealtimeGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_classroom'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "handleJoinClassroom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_classroom'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "handleLeaveClassroom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('chat:send'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "handleChatSend", null);
exports.RealtimeGateway = RealtimeGateway = RealtimeGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({
        namespace: '/realtime',
        cors: { origin: true, credentials: true },
    }),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => class_chat_service_1.ClassChatService))),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        prisma_service_1.PrismaService,
        class_chat_service_1.ClassChatService])
], RealtimeGateway);
//# sourceMappingURL=realtime.gateway.js.map