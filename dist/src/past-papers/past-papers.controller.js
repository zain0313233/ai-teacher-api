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
exports.PastPapersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const past_papers_service_1 = require("./past-papers.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let PastPapersController = class PastPapersController {
    pastPapersService;
    constructor(pastPapersService) {
        this.pastPapersService = pastPapersService;
    }
    async uploadPastPaper(req, file, metadata) {
        const result = await this.pastPapersService.uploadPastPaper(req.user.id, file, metadata);
        return result;
    }
    async getUserPastPapers(req) {
        const pastPapers = await this.pastPapersService.getUserPastPapers(req.user.id);
        return {
            success: true,
            pastPapers,
        };
    }
    async getPatterns(req, body) {
        const patterns = await this.pastPapersService.getPatterns(req.user.id, body.subject, body.chapters, body.mode || 'smart');
        return {
            success: true,
            ...patterns,
        };
    }
    async deletePastPaper(req, id) {
        const result = await this.pastPapersService.deletePastPaper(id, req.user.id);
        return {
            success: true,
            ...result,
        };
    }
};
exports.PastPapersController = PastPapersController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/past-papers',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, `${uniqueSuffix}-${file.originalname}`);
            },
        }),
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], PastPapersController.prototype, "uploadPastPaper", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PastPapersController.prototype, "getUserPastPapers", null);
__decorate([
    (0, common_1.Post)('patterns'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PastPapersController.prototype, "getPatterns", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PastPapersController.prototype, "deletePastPaper", null);
exports.PastPapersController = PastPapersController = __decorate([
    (0, common_1.Controller)('past-papers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [past_papers_service_1.PastPapersService])
], PastPapersController);
//# sourceMappingURL=past-papers.controller.js.map