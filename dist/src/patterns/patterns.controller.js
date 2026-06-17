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
exports.PatternsController = void 0;
const common_1 = require("@nestjs/common");
const patterns_service_1 = require("./patterns.service");
const create_pattern_dto_1 = require("./dto/create-pattern.dto");
const update_pattern_dto_1 = require("./dto/update-pattern.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let PatternsController = class PatternsController {
    patternsService;
    constructor(patternsService) {
        this.patternsService = patternsService;
    }
    async createPattern(req, createPatternDto) {
        const pattern = await this.patternsService.createPattern(req.user.id, createPatternDto);
        return pattern;
    }
    async getUserPatterns(req) {
        const patterns = await this.patternsService.getUserPatterns(req.user.id);
        return patterns;
    }
    async getPatternStats(req) {
        const stats = await this.patternsService.getPatternStats(req.user.id);
        return stats;
    }
    async getAvailablePatterns(req, subject, classGrade, board) {
        if (!subject?.trim()) {
            return { success: true, patterns: [] };
        }
        if (req.user.role === 'TEACHER') {
            return this.patternsService.getAvailablePatternsForTeacher(req.user.id, subject, {
                classGrade,
                board,
            });
        }
        return this.patternsService.getAvailablePatternsForContext(req.user.id, subject, {
            classGrade,
            board,
            includeTeacherPatterns: req.user.role === 'USER',
        });
    }
    async getPattern(req, id) {
        const pattern = await this.patternsService.getPatternById(id, req.user.id);
        return pattern;
    }
    async updatePattern(req, id, updatePatternDto) {
        const pattern = await this.patternsService.updatePattern(id, req.user.id, updatePatternDto);
        return pattern;
    }
    async deletePattern(req, id) {
        const result = await this.patternsService.deletePattern(id, req.user.id);
        return result;
    }
    async markPatternAsUsed(req, id) {
        await this.patternsService.markAsUsed(id, req.user.id);
        return { message: 'Pattern marked as used' };
    }
    async previewPatternWithAI(req, body) {
        const result = await this.patternsService.previewPatternWithAI(req.user.id, body.prompt);
        return result;
    }
    async createPatternWithAI(req, body) {
        const result = await this.patternsService.createPatternWithAI(req.user.id, body.prompt, body.save !== false);
        return result;
    }
    async listTemplates(board, subject, verified) {
        const isVerified = verified === 'true' ? true : verified === 'false' ? false : undefined;
        return this.patternsService.listTemplates({ board, subject, isVerified });
    }
    async getTemplate(id) {
        return this.patternsService.getTemplate(id);
    }
    async correctTemplate(req, id, body) {
        return this.patternsService.correctPattern(id, { name: body.name, subject: body.subject, totalMarks: body.totalMarks, duration: body.duration, sections: body.sections }, req.user.id, body.reason);
    }
};
exports.PatternsController = PatternsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_pattern_dto_1.CreatePatternDto]),
    __metadata("design:returntype", Promise)
], PatternsController.prototype, "createPattern", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PatternsController.prototype, "getUserPatterns", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PatternsController.prototype, "getPatternStats", null);
__decorate([
    (0, common_1.Get)('available'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('subject')),
    __param(2, (0, common_1.Query)('classGrade')),
    __param(3, (0, common_1.Query)('board')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], PatternsController.prototype, "getAvailablePatterns", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PatternsController.prototype, "getPattern", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_pattern_dto_1.UpdatePatternDto]),
    __metadata("design:returntype", Promise)
], PatternsController.prototype, "updatePattern", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PatternsController.prototype, "deletePattern", null);
__decorate([
    (0, common_1.Post)(':id/use'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PatternsController.prototype, "markPatternAsUsed", null);
__decorate([
    (0, common_1.Post)('preview-with-ai'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PatternsController.prototype, "previewPatternWithAI", null);
__decorate([
    (0, common_1.Post)('create-with-ai'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PatternsController.prototype, "createPatternWithAI", null);
__decorate([
    (0, common_1.Get)('templates/list'),
    __param(0, (0, common_1.Query)('board')),
    __param(1, (0, common_1.Query)('subject')),
    __param(2, (0, common_1.Query)('verified')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PatternsController.prototype, "listTemplates", null);
__decorate([
    (0, common_1.Get)('templates/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PatternsController.prototype, "getTemplate", null);
__decorate([
    (0, common_1.Patch)('templates/:id/correct'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], PatternsController.prototype, "correctTemplate", null);
exports.PatternsController = PatternsController = __decorate([
    (0, common_1.Controller)('patterns'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [patterns_service_1.PatternsService])
], PatternsController);
//# sourceMappingURL=patterns.controller.js.map