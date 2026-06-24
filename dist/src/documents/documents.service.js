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
    async getOfficialLibrary(filters) {
        const where = {
            isOfficial: true,
            processed: true,
            verified: true,
        };
        if (filters.subject?.trim()) {
            where.subject = { equals: filters.subject.trim(), mode: 'insensitive' };
        }
        if (filters.board?.trim()) {
            where.board = { contains: filters.board.trim(), mode: 'insensitive' };
        }
        if (filters.language?.trim()) {
            where.language = filters.language.trim();
        }
        if (filters.search?.trim()) {
            const term = filters.search.trim();
            where.OR = [
                { fileName: { contains: term, mode: 'insensitive' } },
                { chapterName: { contains: term, mode: 'insensitive' } },
                { subject: { contains: term, mode: 'insensitive' } },
            ];
        }
        const documents = await this.prisma.document.findMany({
            where,
            orderBy: [{ subject: 'asc' }, { uploadDate: 'desc' }],
            select: {
                id: true,
                fileName: true,
                subject: true,
                board: true,
                class: true,
                level: true,
                language: true,
                documentType: true,
                chapterNumber: true,
                chapterName: true,
                uploadDate: true,
                year: true,
                educationSystem: true,
            },
        });
        return { success: true, documents, count: documents.length };
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
        await this.deletePineconeVectors(documentId);
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
    async deletePineconeVectors(documentId) {
        try {
            await axios_1.default.delete(`${this.fastApiUrl}/documents/${documentId}`);
        }
        catch (error) {
            console.error('Pinecone deletion error:', error.message);
        }
    }
    async reprocessDocument(documentId, options) {
        const where = {
            id: documentId,
        };
        if (options?.asAdmin) {
            where.isOfficial = true;
        }
        else if (options?.userId) {
            where.userId = options.userId;
        }
        else {
            throw new common_1.BadRequestException('userId or asAdmin is required');
        }
        const document = await this.prisma.document.findFirst({ where });
        if (!document) {
            throw new common_1.NotFoundException('Document not found');
        }
        if (!document.fileUrl?.trim()) {
            throw new common_1.BadRequestException('Document has no file URL — re-upload the PDF instead');
        }
        await this.deletePineconeVectors(documentId);
        await this.prisma.document.update({
            where: { id: documentId },
            data: { processed: false },
        });
        const uploadMode = document.uploadMode === 'chapter' ? 'chapter' : document.uploadMode || 'fullbook';
        const chapterMetadata = document.chapterNumber != null && document.chapterName
            ? {
                chapterNumber: document.chapterNumber,
                chapterName: document.chapterName,
            }
            : undefined;
        this.processDocumentAsync(document.id, document.fileUrl, document.fileType, document.userId, {
            subject: document.subject ?? undefined,
            level: document.level ?? undefined,
            class: document.class ?? undefined,
            educationSystem: document.educationSystem ?? undefined,
            documentType: document.documentType ?? undefined,
            isOfficial: document.isOfficial,
            chapterMetadata,
        }, uploadMode);
        return {
            success: true,
            message: 'Reprocessing started. The file in storage will be re-indexed (watch AI engine logs).',
            document: {
                id: document.id,
                fileName: document.fileName,
                processed: false,
            },
        };
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
    formatChaptersResponse(subject, chapters) {
        return {
            subject,
            totalChapters: chapters.length,
            chapters,
            documentsFound: chapters.length > 0,
        };
    }
    normalizeChapterEntry(raw) {
        const number = raw.number ?? raw.chapterNumber ?? raw.chapter_number;
        const name = raw.name ?? raw.chapterName ?? raw.chapter_name;
        if (number == null || name == null || String(name).trim() === '') {
            return null;
        }
        const chapterNumber = typeof number === 'number' ? number : parseInt(String(number), 10);
        if (Number.isNaN(chapterNumber)) {
            return null;
        }
        return { number: chapterNumber, name: String(name).trim() };
    }
    mergeChapters(...groups) {
        const byNumber = new Map();
        for (const group of groups) {
            for (const ch of group) {
                byNumber.set(ch.number, ch);
            }
        }
        return Array.from(byNumber.values()).sort((a, b) => a.number - b.number);
    }
    collectChaptersFromDocuments(documents) {
        const collected = [];
        for (const doc of documents) {
            for (const ch of doc.chapters) {
                collected.push({ number: ch.chapterNumber, name: ch.chapterName });
            }
            if (doc.chapterNumber != null && doc.chapterName?.trim()) {
                collected.push({ number: doc.chapterNumber, name: doc.chapterName.trim() });
            }
        }
        return this.mergeChapters(collected);
    }
    async getChaptersBySubject(userId, subject) {
        const trimmedSubject = subject.trim();
        if (!trimmedSubject) {
            return this.formatChaptersResponse(subject, []);
        }
        const documents = await this.prisma.document.findMany({
            where: {
                AND: [
                    {
                        OR: [{ userId }, { isOfficial: true }],
                    },
                    {
                        subject: { equals: trimmedSubject, mode: 'insensitive' },
                    },
                    { processed: true },
                ],
            },
            include: {
                chapters: {
                    orderBy: { chapterNumber: 'asc' },
                },
            },
        });
        const dbChapters = this.collectChaptersFromDocuments(documents);
        let pineconeChapters = [];
        try {
            const response = await axios_1.default.get(`${this.fastApiUrl}/documents/chapters`, {
                params: { user_id: userId, subject: trimmedSubject },
            });
            const rawChapters = Array.isArray(response.data?.chapters) ? response.data.chapters : [];
            pineconeChapters = rawChapters
                .map((ch) => this.normalizeChapterEntry(ch))
                .filter(Boolean);
        }
        catch {
        }
        const merged = this.mergeChapters(dbChapters, pineconeChapters);
        return this.formatChaptersResponse(trimmedSubject, merged);
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map