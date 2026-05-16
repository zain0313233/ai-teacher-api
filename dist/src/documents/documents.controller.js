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
exports.DocumentsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const documents_service_1 = require("./documents.service");
const supabase_service_1 = require("./supabase.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let DocumentsController = class DocumentsController {
    documentsService;
    supabaseService;
    constructor(documentsService, supabaseService) {
        this.documentsService = documentsService;
        this.supabaseService = supabaseService;
    }
    async uploadDocument(req, file, body) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        const { uploadMode, subject, level, class: classValue, educationSystem, documentType, chapterNumber, chapterName } = body;
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword'
        ];
        if (!allowedTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Only PDF and DOCX files are allowed');
        }
        if (file.size > 50 * 1024 * 1024) {
            throw new common_1.BadRequestException('File size must be less than 50MB');
        }
        if (uploadMode === 'chapter') {
            if (!subject) {
                throw new common_1.BadRequestException('Subject is required for chapter upload');
            }
            if (!chapterNumber) {
                throw new common_1.BadRequestException('Chapter number is required for chapter upload');
            }
            if (!chapterName) {
                throw new common_1.BadRequestException('Chapter name is required for chapter upload');
            }
        }
        if (level && ['matric', 'fsc'].includes(level) && !classValue) {
            throw new common_1.BadRequestException(`Class is required for ${level} level`);
        }
        const fileUrl = await this.supabaseService.uploadFile(file);
        const document = await this.documentsService.uploadDocument(req.user.id, file.originalname, file.mimetype, fileUrl, file.size, {
            subject,
            level,
            class: classValue,
            educationSystem,
            documentType,
            chapterMetadata: uploadMode === 'chapter' && chapterNumber && chapterName ? {
                chapterNumber: parseInt(chapterNumber, 10),
                chapterName: chapterName,
            } : undefined,
        });
        return document;
    }
    async getChapters(req, subject) {
        if (!subject) {
            throw new common_1.BadRequestException('Subject is required');
        }
        const chapters = await this.documentsService.getChaptersBySubject(req.user.id, subject);
        return chapters;
    }
    async getUserDocuments(req) {
        const documents = await this.documentsService.getUserDocuments(req.user.id);
        return documents;
    }
    async getDocument(req, id) {
        const document = await this.documentsService.getDocumentById(id, req.user.id);
        return document;
    }
    async getDocumentStatus(req, id) {
        const document = await this.documentsService.getDocumentById(id, req.user.id);
        return {
            id: document.id,
            fileName: document.fileName,
            processed: document.processed,
            status: document.processed ? 'complete' : 'processing',
        };
    }
    async deleteDocument(req, id) {
        const result = await this.documentsService.deleteDocument(id, req.user.id);
        return result;
    }
};
exports.DocumentsController = DocumentsController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: {
            fileSize: 100 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "uploadDocument", null);
__decorate([
    (0, common_1.Get)('chapters'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('subject')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "getChapters", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "getUserDocuments", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "getDocument", null);
__decorate([
    (0, common_1.Get)(':id/status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "getDocumentStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "deleteDocument", null);
exports.DocumentsController = DocumentsController = __decorate([
    (0, common_1.Controller)('documents'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [documents_service_1.DocumentsService,
        supabase_service_1.SupabaseService])
], DocumentsController);
//# sourceMappingURL=documents.controller.js.map