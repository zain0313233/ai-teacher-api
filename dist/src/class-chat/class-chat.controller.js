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
exports.ClassChatController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const class_chat_service_1 = require("./class-chat.service");
let ClassChatController = class ClassChatController {
    classChatService;
    constructor(classChatService) {
        this.classChatService = classChatService;
    }
    getMessages(req, classroomId, cursor, limit) {
        return this.classChatService.getMessages(req.user.id, classroomId, cursor, limit ? parseInt(limit, 10) : 50);
    }
    async sendMessage(req, classroomId, body) {
        const message = await this.classChatService.sendMessage(req.user.id, {
            classroomId,
            ...body,
        });
        return { success: true, message };
    }
    async uploadFile(req, classroomId, file, messageType) {
        if (!file)
            throw new common_1.BadRequestException('No file uploaded');
        const type = messageType === 'voice' ? 'voice' : messageType === 'document' ? 'document' : 'image';
        return this.classChatService.uploadAttachment(req.user.id, classroomId, file, type);
    }
};
exports.ClassChatController = ClassChatController;
__decorate([
    (0, common_1.Get)(':classroomId/messages'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('classroomId')),
    __param(2, (0, common_1.Query)('cursor')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], ClassChatController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)(':classroomId/messages'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('classroomId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ClassChatController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Post)(':classroomId/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: 15 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('classroomId')),
    __param(2, (0, common_1.UploadedFile)()),
    __param(3, (0, common_1.Body)('messageType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, String]),
    __metadata("design:returntype", Promise)
], ClassChatController.prototype, "uploadFile", null);
exports.ClassChatController = ClassChatController = __decorate([
    (0, common_1.Controller)('classrooms/chat'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [class_chat_service_1.ClassChatService])
], ClassChatController);
//# sourceMappingURL=class-chat.controller.js.map