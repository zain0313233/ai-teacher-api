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
exports.ExamAssistantController = void 0;
const common_1 = require("@nestjs/common");
const exam_assistant_service_1 = require("./exam-assistant.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let ExamAssistantController = class ExamAssistantController {
    examAssistantService;
    constructor(examAssistantService) {
        this.examAssistantService = examAssistantService;
    }
    async chat(req, body) {
        const result = await this.examAssistantService.chat({
            userId: req.user.id,
            message: body.message,
            context: body.context,
        });
        return result;
    }
    async getHistory(req) {
        const result = await this.examAssistantService.getConversationHistory(req.user.id);
        return result;
    }
    async clearHistory(req) {
        const result = await this.examAssistantService.clearConversationHistory(req.user.id);
        return result;
    }
    async health() {
        const result = await this.examAssistantService.healthCheck();
        return result;
    }
};
exports.ExamAssistantController = ExamAssistantController;
__decorate([
    (0, common_1.Post)('chat'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ExamAssistantController.prototype, "chat", null);
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExamAssistantController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Delete)('history'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExamAssistantController.prototype, "clearHistory", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ExamAssistantController.prototype, "health", null);
exports.ExamAssistantController = ExamAssistantController = __decorate([
    (0, common_1.Controller)('exam-assistant'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [exam_assistant_service_1.ExamAssistantService])
], ExamAssistantController);
//# sourceMappingURL=exam-assistant.controller.js.map