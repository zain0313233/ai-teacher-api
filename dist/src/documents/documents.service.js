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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const axios_1 = __importDefault(require("axios"));
let DocumentsService = class DocumentsService {
    prisma;
    fastApiUrl = process.env.FASTAPI_URL || 'http://localhost:8000';
    constructor(prisma) {
        this.prisma = prisma;
    }
    async uploadDocument(userId, fileName, fileType, fileUrl, fileSize, metadata) {
        const uploadMode = metadata.chapterMetadata ? 'chapter' : 'fullbook';
        const document = await this.prisma.document.create({
            data: {
                userId,
                fileName,
                fileType,
                fileUrl,
                fileSize,
                subject: metadata.subject,
                level: metadata.level || 'matric',
                class: metadata.class,
                educationSystem: metadata.educationSystem || 'punjab_board',
                documentType: metadata.documentType || 'textbook',
                isOfficial: metadata.isOfficial ?? false,
                uploadMode,
                chapterNumber: metadata.chapterMetadata?.chapterNumber,
                chapterName: metadata.chapterMetadata?.chapterName,
                processed: false,
            },
        });
        this.processDocumentAsync(document.id, fileUrl, fileType, userId, metadata, uploadMode);
        return document;
    }
    async processDocumentAsync(documentId, fileUrl, fileType, userId, metadata, uploadMode) {
        try {
            const payload = {
                document_id: documentId,
                file_url: fileUrl,
                file_type: fileType,
                user_id: userId,
                subject: metadata.subject,
                level: metadata.level,
                class_level: metadata.class,
                education_system: metadata.educationSystem,
                document_type: metadata.documentType,
                upload_mode: uploadMode,
                is_official: metadata.isOfficial ?? false,
            };
            if (metadata.chapterMetadata) {
                payload.chapter_number = metadata.chapterMetadata.chapterNumber;
                payload.chapter_name = metadata.chapterMetadata.chapterName;
            }
            const response = await axios_1.default.post(`${this.fastApiUrl}/documents/process`, payload, {
                timeout: 1800000,
            });
            if (response.data.chapters && response.data.chapters.length > 0) {
                await this.storeChapters(documentId, response.data.chapters);
            }
            if (uploadMode === 'chapter' && metadata.chapterMetadata) {
                await this.prisma.chapter.upsert({
                    where: {
                        documentId_chapterNumber: {
                            documentId,
                            chapterNumber: metadata.chapterMetadata.chapterNumber,
                        },
                    },
                    create: {
                        documentId,
                        chapterNumber: metadata.chapterMetadata.chapterNumber,
                        chapterName: metadata.chapterMetadata.chapterName,
                        startPosition: 0,
                        endPosition: 0,
                    },
                    update: {
                        chapterName: metadata.chapterMetadata.chapterName,
                    },
                });
            }
            await this.markAsProcessed(documentId);
        }
        catch (error) {
            console.error('FastAPI processing error:', error.message);
            await this.prisma.document.update({
                where: { id: documentId },
                data: { processed: false },
            });
        }
    }
    async getUserDocuments(userId) {
        const documents = await this.prisma.document.findMany({
            where: { userId },
            orderBy: { uploadDate: 'desc' },
        });
        return documents;
    }
    async getDocumentById(documentId, userId) {
        const document = await this.prisma.document.findFirst({
            where: {
                id: documentId,
                userId,
            },
        });
        if (!document) {
            throw new common_1.NotFoundException('Document not found');
        }
        return document;
    }
    async deleteDocument(documentId, userId) {
        const document = await this.prisma.document.findFirst({
            where: {
                id: documentId,
                userId,
            },
        });
        if (!document) {
            throw new common_1.NotFoundException('Document not found');
        }
        try {
            await axios_1.default.delete(`${this.fastApiUrl}/documents/${documentId}`);
        }
        catch (error) {
            console.error('FastAPI deletion error:', error.message);
        }
        await this.prisma.document.delete({
            where: { id: documentId },
        });
        return { message: 'Document deleted successfully' };
    }
    async markAsProcessed(documentId) {
        await this.prisma.document.update({
            where: { id: documentId },
            data: { processed: true },
        });
    }
    async storeChapters(documentId, chapters) {
        for (const chapter of chapters) {
            await this.prisma.chapter.create({
                data: {
                    documentId,
                    chapterNumber: chapter.chapter_number,
                    chapterName: chapter.chapter_name,
                    startPosition: chapter.start_position,
                    endPosition: chapter.end_position,
                },
            });
        }
    }
    async getChaptersBySubject(userId, subject) {
        const documents = await this.prisma.document.findMany({
            where: {
                OR: [
                    { userId },
                    { isOfficial: true },
                ],
                subject,
                processed: true,
            },
            include: {
                chapters: {
                    orderBy: { chapterNumber: 'asc' },
                },
            },
        });
        const allChapters = documents.flatMap(doc => doc.chapters);
        if (allChapters.length > 0) {
            const uniqueChapters = Array.from(new Map(allChapters.map(ch => [ch.chapterNumber, ch])).values());
            return {
                subject,
                totalChapters: uniqueChapters.length,
                chapters: uniqueChapters.map(ch => ({
                    number: ch.chapterNumber,
                    name: ch.chapterName,
                })),
                documentsFound: true,
            };
        }
        try {
            const response = await axios_1.default.get(`${this.fastApiUrl}/documents/chapters`, {
                params: { user_id: userId, subject },
            });
            return response.data;
        }
        catch (error) {
            return {
                subject,
                totalChapters: 0,
                chapters: [],
                documentsFound: false,
            };
        }
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map