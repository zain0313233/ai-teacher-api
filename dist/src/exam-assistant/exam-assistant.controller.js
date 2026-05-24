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
const prisma_service_1 = require("../prisma/prisma.service");
let ExamAssistantController = class ExamAssistantController {
    examAssistantService;
    prisma;
    constructor(examAssistantService, prisma) {
        this.examAssistantService = examAssistantService;
        this.prisma = prisma;
    }
    async buildProfileContext(userId) {
        const student = await this.prisma.studentProfile
            .findUnique({
            where: { userId },
            select: {
                educationLevel: true,
                classGrade: true,
                group: true,
                board: true,
                subjects: true,
                targetExam: true,
            },
        })
            .catch(() => null);
        if (student) {
            return {
                education_level: student.educationLevel,
                class_grade: student.classGrade ?? undefined,
                classes_taught: student.classGrade ? [student.classGrade] : [],
                group: student.group ?? undefined,
                board: student.board ?? undefined,
                subjects: student.subjects,
                target_exam: student.targetExam ?? undefined,
            };
        }
        const teacher = await this.prisma.teacherProfile
            .findUnique({
            where: { userId },
            select: {
                subjectsTaught: true,
                classesTaught: true,
                board: true,
            },
        })
            .catch(() => null);
        if (teacher) {
            return {
                education_level: 'secondary',
                class_grade: teacher.classesTaught?.[0] ?? undefined,
                classes_taught: teacher.classesTaught ?? [],
                board: teacher.board ?? undefined,
                subjects: teacher.subjectsTaught,
            };
        }
        return null;
    }
    async prepare(req, body) {
        const userId = req.user.id;
        const studentContext = await this.buildProfileContext(userId);
        return this.examAssistantService.prepareExamGeneration({
            userId,
            message: body.message,
            context: body.context,
            studentContext,
        });
    }
    async chat(req, body) {
        const userId = req.user.id;
        const studentContext = await this.buildProfileContext(userId);
        const result = await this.examAssistantService.chat({
            userId,
            message: body.message,
            context: body.context,
            studentContext,
        });
        return result;
    }
    async getHistory(req) {
        return this.examAssistantService.getConversationHistory(req.user.id);
    }
    async clearHistory(req) {
        return this.examAssistantService.clearConversationHistory(req.user.id);
    }
    async health() {
        return this.examAssistantService.healthCheck();
    }
};
exports.ExamAssistantController = ExamAssistantController;
__decorate([
    (0, common_1.Post)('prepare'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ExamAssistantController.prototype, "prepare", null);
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
    __metadata("design:paramtypes", [exam_assistant_service_1.ExamAssistantService,
        prisma_service_1.PrismaService])
], ExamAssistantController);
//# sourceMappingURL=exam-assistant.controller.js.map