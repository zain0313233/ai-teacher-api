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
exports.ExamGenieController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const exam_genie_service_1 = require("./exam-genie.service");
const analytics_service_1 = require("../analytics/analytics.service");
const generate_quiz_dto_1 = require("./dto/generate-quiz.dto");
const submit_quiz_dto_1 = require("./dto/submit-quiz.dto");
let ExamGenieController = class ExamGenieController {
    examGenieService;
    analyticsService;
    constructor(examGenieService, analyticsService) {
        this.examGenieService = examGenieService;
        this.analyticsService = analyticsService;
    }
    getMaterials(req, subject) {
        return this.examGenieService.getMaterials(req.user.id, subject);
    }
    getPredictions(req, subject, chapters, mode) {
        const chapterList = chapters
            ? chapters.split(',').map((c) => parseInt(c.trim(), 10)).filter((n) => !isNaN(n))
            : [];
        return this.examGenieService.getPredictions(req.user.id, subject, chapterList, mode || 'prediction');
    }
    getAvailablePatterns(req, subject) {
        return this.examGenieService.getAvailablePatterns(req.user.id, subject);
    }
    getWeakTopics(req, subject) {
        return this.examGenieService.getWeakTopicRecommendations(req.user.id, subject);
    }
    getStudentAnalytics(req) {
        return this.analyticsService.getStudentSubjectAnalytics(req.user.id);
    }
    generateQuiz(req, dto) {
        return this.examGenieService.generateQuiz(req.user.id, dto);
    }
    listQuizzes(req) {
        return this.examGenieService.listQuizzes(req.user.id);
    }
    getQuiz(req, id) {
        return this.examGenieService.getQuiz(req.user.id, id);
    }
    submitQuiz(req, id, dto) {
        return this.examGenieService.submitQuiz(req.user.id, id, dto);
    }
};
exports.ExamGenieController = ExamGenieController;
__decorate([
    (0, common_1.Get)('materials'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('subject')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ExamGenieController.prototype, "getMaterials", null);
__decorate([
    (0, common_1.Get)('predictions'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('subject')),
    __param(2, (0, common_1.Query)('chapters')),
    __param(3, (0, common_1.Query)('mode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], ExamGenieController.prototype, "getPredictions", null);
__decorate([
    (0, common_1.Get)('patterns'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('subject')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ExamGenieController.prototype, "getAvailablePatterns", null);
__decorate([
    (0, common_1.Get)('weak-topics'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('subject')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ExamGenieController.prototype, "getWeakTopics", null);
__decorate([
    (0, common_1.Get)('analytics'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ExamGenieController.prototype, "getStudentAnalytics", null);
__decorate([
    (0, common_1.Post)('quizzes/generate'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, generate_quiz_dto_1.GenerateQuizDto]),
    __metadata("design:returntype", void 0)
], ExamGenieController.prototype, "generateQuiz", null);
__decorate([
    (0, common_1.Get)('quizzes'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ExamGenieController.prototype, "listQuizzes", null);
__decorate([
    (0, common_1.Get)('quizzes/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ExamGenieController.prototype, "getQuiz", null);
__decorate([
    (0, common_1.Post)('quizzes/:id/submit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, submit_quiz_dto_1.SubmitQuizDto]),
    __metadata("design:returntype", void 0)
], ExamGenieController.prototype, "submitQuiz", null);
exports.ExamGenieController = ExamGenieController = __decorate([
    (0, common_1.Controller)('exam-genie'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [exam_genie_service_1.ExamGenieService,
        analytics_service_1.AnalyticsService])
], ExamGenieController);
//# sourceMappingURL=exam-genie.controller.js.map