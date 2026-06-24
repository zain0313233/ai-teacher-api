"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PastPapersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const fs = __importStar(require("fs"));
let PastPapersService = class PastPapersService {
    prisma;
    fastApiUrl = process.env.FASTAPI_URL || 'http://localhost:8000';
    constructor(prisma) {
        this.prisma = prisma;
    }
    async uploadPastPaper(userId, file, metadata) {
        try {
            const isMultiYear = metadata.isMultiYear === 'true';
            let year;
            let yearFrom = null;
            let yearTo = null;
            if (isMultiYear) {
                yearFrom = parseInt(metadata.yearFrom);
                yearTo = parseInt(metadata.yearTo);
                if (isNaN(yearFrom) || isNaN(yearTo)) {
                    throw new Error('Valid year range (yearFrom and yearTo) is required for multi-year papers');
                }
                year = yearFrom;
            }
            else {
                year = parseInt(metadata.year);
                if (isNaN(year)) {
                    throw new Error('Valid year is required for single-year papers');
                }
            }
            const formData = new form_data_1.default();
            formData.append('file', fs.createReadStream(file.path), file.originalname);
            formData.append('user_id', userId);
            formData.append('subject', metadata.subject);
            formData.append('year', year.toString());
            formData.append('class_name', metadata.class);
            formData.append('board', metadata.board || 'Punjab Board');
            formData.append('exam_type', metadata.examType || 'final');
            const uploadResponse = await axios_1.default.post(`${this.fastApiUrl}/past-papers/upload`, formData, { headers: formData.getHeaders(), timeout: 60000 });
            const fileUrl = uploadResponse.data.file_url;
            const fileSize = uploadResponse.data.file_size;
            const pastPaper = await this.prisma.pastPaper.create({
                data: {
                    userId,
                    subject: metadata.subject,
                    examType: metadata.examType || 'final',
                    year,
                    board: metadata.board || 'Punjab Board',
                    class: metadata.class,
                    fileName: file.originalname,
                    fileUrl,
                    fileSize,
                    processed: false,
                    extractionStatus: 'uploaded',
                },
            });
            this.extractPastPaperAsync(pastPaper.id, userId);
            return {
                success: true,
                pastPaperId: pastPaper.id,
                message: isMultiYear
                    ? `Uploaded (${yearFrom}-${yearTo}). Extraction started — review required before indexing.`
                    : 'Uploaded. Extraction started — review required before indexing.',
            };
        }
        catch (error) {
            console.error('Error uploading past paper:', error.message);
            throw error;
        }
    }
    async extractPastPaperAsync(pastPaperId, userId) {
        try {
            await this.prisma.pastPaper.update({
                where: { id: pastPaperId },
                data: { extractionStatus: 'extracting' },
            });
            const paper = await this.prisma.pastPaper.findFirst({
                where: { id: pastPaperId, userId },
            });
            if (!paper)
                return;
            const response = await axios_1.default.post(`${this.fastApiUrl}/past-papers/extract`, {
                user_id: userId,
                subject: paper.subject,
                year: paper.year,
                class_name: paper.class,
                board: paper.board,
                exam_type: paper.examType,
                file_url: paper.fileUrl,
            }, { timeout: 600000 });
            const data = response.data;
            await this.prisma.pastPaper.update({
                where: { id: pastPaperId },
                data: {
                    extractionStatus: 'pending_review',
                    extractionDraft: data.draft ?? { questions: data.questions },
                    questionCount: data.question_count ?? 0,
                    extractionMethod: data.method ?? 'gemini_vision',
                    processed: false,
                },
            });
            console.log(`Past paper ${pastPaperId} ready for review (${data.question_count} questions)`);
        }
        catch (error) {
            console.error(`Extraction failed for ${pastPaperId}:`, error.message);
            await this.prisma.pastPaper.update({
                where: { id: pastPaperId },
                data: {
                    extractionStatus: 'failed',
                    extractionDraft: {
                        error: error.response?.data?.detail || error.message,
                    },
                    processed: false,
                },
            });
        }
    }
    async triggerExtract(pastPaperId, userId, method) {
        const paper = await this.prisma.pastPaper.findFirst({
            where: { id: pastPaperId, userId },
        });
        if (!paper)
            throw new common_1.NotFoundException('Past paper not found');
        await this.prisma.pastPaper.update({
            where: { id: pastPaperId },
            data: { extractionStatus: 'extracting', extractionDraft: client_1.Prisma.DbNull },
        });
        if (method === 'tesseract') {
            this.extractPastPaperWithMethodAsync(pastPaperId, userId, 'tesseract');
        }
        else {
            this.extractPastPaperAsync(pastPaperId, userId);
        }
        return { success: true, message: 'Extraction started' };
    }
    async extractPastPaperWithMethodAsync(pastPaperId, userId, method) {
        try {
            const paper = await this.prisma.pastPaper.findFirst({
                where: { id: pastPaperId, userId },
            });
            if (!paper)
                return;
            const response = await axios_1.default.post(`${this.fastApiUrl}/past-papers/extract`, {
                user_id: userId,
                subject: paper.subject,
                year: paper.year,
                class_name: paper.class,
                board: paper.board,
                exam_type: paper.examType,
                file_url: paper.fileUrl,
                method,
            }, { timeout: 600000 });
            const data = response.data;
            await this.prisma.pastPaper.update({
                where: { id: pastPaperId },
                data: {
                    extractionStatus: 'pending_review',
                    extractionDraft: data.draft ?? { questions: data.questions },
                    questionCount: data.question_count ?? 0,
                    extractionMethod: data.method ?? method,
                    processed: false,
                },
            });
        }
        catch (error) {
            await this.prisma.pastPaper.update({
                where: { id: pastPaperId },
                data: {
                    extractionStatus: 'failed',
                    extractionDraft: { error: error.response?.data?.detail || error.message },
                },
            });
        }
    }
    async getExtraction(pastPaperId, userId) {
        const paper = await this.prisma.pastPaper.findFirst({
            where: { id: pastPaperId, userId },
        });
        if (!paper)
            throw new common_1.NotFoundException('Past paper not found');
        const draft = paper.extractionDraft;
        return {
            success: true,
            pastPaper: {
                id: paper.id,
                subject: paper.subject,
                year: paper.year,
                class: paper.class,
                board: paper.board,
                examType: paper.examType,
                fileName: paper.fileName,
                extractionStatus: paper.extractionStatus,
                questionCount: paper.questionCount,
                extractionMethod: paper.extractionMethod,
                processed: paper.processed,
            },
            draft,
            questions: draft?.questions ?? [],
            summary: draft?.summary ?? null,
        };
    }
    async approvePastPaper(pastPaperId, userId) {
        const paper = await this.prisma.pastPaper.findFirst({
            where: { id: pastPaperId, userId },
        });
        if (!paper)
            throw new common_1.NotFoundException('Past paper not found');
        if (paper.extractionStatus !== 'pending_review') {
            throw new common_1.BadRequestException(`Cannot approve paper in status: ${paper.extractionStatus}`);
        }
        const draft = paper.extractionDraft;
        const questions = draft?.questions ?? [];
        if (!questions.length) {
            throw new common_1.BadRequestException('No extracted questions to approve');
        }
        await this.prisma.pastPaper.update({
            where: { id: pastPaperId },
            data: { extractionStatus: 'approved' },
        });
        try {
            const response = await axios_1.default.post(`${this.fastApiUrl}/past-papers/process-approved`, {
                user_id: userId,
                subject: paper.subject,
                year: paper.year,
                class_name: paper.class,
                board: paper.board,
                exam_type: paper.examType,
                questions,
            }, { timeout: 600000 });
            await this.prisma.pastPaper.update({
                where: { id: pastPaperId },
                data: {
                    extractionStatus: 'indexed',
                    processed: true,
                    questionCount: response.data.total_questions ?? questions.length,
                },
            });
            return {
                success: true,
                ...response.data,
                message: 'Past paper approved and indexed successfully',
            };
        }
        catch (error) {
            await this.prisma.pastPaper.update({
                where: { id: pastPaperId },
                data: { extractionStatus: 'pending_review' },
            });
            throw new common_1.InternalServerErrorException(error.response?.data?.detail || error.message || 'Indexing failed');
        }
    }
    async rejectPastPaper(pastPaperId, userId) {
        const paper = await this.prisma.pastPaper.findFirst({
            where: { id: pastPaperId, userId },
        });
        if (!paper)
            throw new common_1.NotFoundException('Past paper not found');
        await this.prisma.pastPaper.update({
            where: { id: pastPaperId },
            data: {
                extractionStatus: 'uploaded',
                extractionDraft: client_1.Prisma.DbNull,
                questionCount: null,
                processed: false,
            },
        });
        return { success: true, message: 'Extraction rejected. You can re-extract.' };
    }
    async getUserPastPapers(userId) {
        const pastPapers = await this.prisma.pastPaper.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        return pastPapers;
    }
    async getPatterns(userId, subject, chapters, mode = 'smart') {
        try {
            const response = await axios_1.default.post(`${this.fastApiUrl}/past-papers/patterns/retrieve`, { user_id: userId, subject, chapters, mode });
            return response.data;
        }
        catch (error) {
            console.error('Error retrieving patterns:', error.message);
            throw error;
        }
    }
    computePatternQuality(indexedPapers, chapterQuestions, patternCount) {
        if (indexedPapers === 0) {
            return { level: 'none', score: 0, label: 'No indexed past papers' };
        }
        if (patternCount === 0) {
            return {
                level: 'none',
                score: chapterQuestions > 0 ? 20 : 10,
                label: 'No patterns for these chapters',
            };
        }
        if (patternCount < 5) {
            return { level: 'low', score: 35, label: 'Minimal pattern coverage' };
        }
        if (patternCount < 15) {
            return { level: 'moderate', score: 55, label: 'Moderate pattern coverage' };
        }
        if (patternCount < 30) {
            return { level: 'good', score: 75, label: 'Good pattern coverage' };
        }
        return { level: 'excellent', score: 95, label: 'Excellent pattern coverage' };
    }
    buildCoverageGuidance(input) {
        const chapterLabel = input.chapters.length === 1
            ? `Ch ${input.chapters[0]}`
            : `Ch ${Math.min(...input.chapters)}–${Math.max(...input.chapters)}`;
        const actions = [];
        if (input.papers.total === 0) {
            return {
                title: 'No past papers uploaded',
                message: `Upload ${input.subject} past papers to build pattern intelligence for ${chapterLabel}.`,
                actions: [
                    { label: 'Upload past papers', href: '/dashboard/past-papers' },
                ],
            };
        }
        if (input.papers.pendingReview > 0) {
            actions.push({ label: 'Review extracted papers', href: '/dashboard/past-papers' });
        }
        if (input.papers.failed > 0) {
            actions.push({ label: 'Fix failed extractions', href: '/dashboard/past-papers' });
        }
        if (input.papers.indexed === 0) {
            return {
                title: 'Papers not indexed yet',
                message: `${input.papers.pendingReview} paper(s) need review and approval before patterns can be used.`,
                actions,
            };
        }
        if (input.patternCount === 0) {
            let message = `No pattern clusters matched ${input.subject} ${chapterLabel}.`;
            if (input.chapterQuestions === 0) {
                message +=
                    ' Your indexed papers may not cover these chapters — upload papers that include these units.';
            }
            else if (input.mode !== 'normal') {
                message +=
                    ' Try switching to Normal mode, or upload more past papers for this chapter range.';
            }
            else {
                message += ' Approve more past papers or verify chapter tags during review.';
            }
            if (actions.length === 0) {
                actions.push({ label: 'Upload more past papers', href: '/dashboard/past-papers' });
            }
            return { title: '0 patterns retrieved', message, actions };
        }
        if (input.patternCount < 5) {
            return {
                title: 'Limited pattern data',
                message: `Only ${input.patternCount} pattern(s) found for ${chapterLabel}. Quizzes will work but predictions may be generic — upload more papers to improve accuracy.`,
                actions: actions.length > 0
                    ? actions
                    : [{ label: 'Upload more past papers', href: '/dashboard/past-papers' }],
            };
        }
        return {
            title: 'Pattern data ready',
            message: `${input.patternCount} pattern(s) available for ${input.subject} ${chapterLabel} (${input.papers.indexed} indexed paper(s)).`,
            actions: [],
        };
    }
    async getPatternCoverage(userId, subject, chapters, mode = 'smart') {
        const subjectFilter = { equals: subject, mode: 'insensitive' };
        const papers = await this.prisma.pastPaper.findMany({
            where: { userId, subject: subjectFilter },
            select: {
                id: true,
                extractionStatus: true,
                extractionMethod: true,
                processed: true,
                questionCount: true,
                year: true,
                fileName: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        const isIndexed = (p) => p.extractionStatus === 'indexed' || p.processed;
        const indexed = papers.filter(isIndexed);
        const pendingReview = papers.filter((p) => p.extractionStatus === 'pending_review');
        const extracting = papers.filter((p) => ['uploaded', 'extracting', 'approved'].includes(p.extractionStatus));
        const failed = papers.filter((p) => p.extractionStatus === 'failed');
        const indexedIds = indexed.map((p) => p.id);
        let chapterQuestions = 0;
        if (indexedIds.length > 0 && chapters.length > 0) {
            chapterQuestions = await this.prisma.pastPaperQuestion.count({
                where: {
                    pastPaperId: { in: indexedIds },
                    chapter: { in: chapters },
                },
            });
        }
        let patternCount = 0;
        let rawPatternCount = 0;
        try {
            const normalPatterns = await this.getPatterns(userId, subject, chapters, 'normal');
            rawPatternCount = normalPatterns.total_patterns ?? normalPatterns.patterns?.length ?? 0;
            if (mode === 'normal') {
                patternCount = rawPatternCount;
            }
            else {
                const modePatterns = await this.getPatterns(userId, subject, chapters, mode);
                patternCount = modePatterns.total_patterns ?? modePatterns.patterns?.length ?? 0;
            }
        }
        catch (error) {
            console.error('Pattern coverage retrieve failed:', error.message);
        }
        const quality = this.computePatternQuality(indexed.length, chapterQuestions, patternCount);
        const methodCounts = {};
        for (const p of papers) {
            const key = p.extractionMethod || 'unknown';
            methodCounts[key] = (methodCounts[key] || 0) + 1;
        }
        const paperStats = {
            total: papers.length,
            indexed: indexed.length,
            pendingReview: pendingReview.length,
            extracting: extracting.length,
            failed: failed.length,
        };
        const guidance = this.buildCoverageGuidance({
            subject,
            chapters,
            mode,
            papers: paperStats,
            patternCount,
            chapterQuestions,
        });
        return {
            success: true,
            subject,
            chapters,
            mode,
            patternCount,
            rawPatternCount,
            patternsFilteredByMode: mode !== 'normal' && rawPatternCount > patternCount,
            quality: quality.level,
            qualityLabel: quality.label,
            qualityScore: quality.score,
            isReadyForPrediction: patternCount >= 5 && indexed.length >= 1,
            papers: paperStats,
            chapterQuestions,
            extractionMethods: methodCounts,
            guidance,
            recentPapers: papers.slice(0, 8).map((p) => ({
                id: p.id,
                fileName: p.fileName,
                year: p.year,
                extractionStatus: p.extractionStatus,
                extractionMethod: p.extractionMethod,
                questionCount: p.questionCount,
                indexed: isIndexed(p),
            })),
        };
    }
    async deletePastPaper(pastPaperId, userId) {
        const pastPaper = await this.prisma.pastPaper.findFirst({
            where: { id: pastPaperId, userId },
        });
        if (!pastPaper)
            throw new common_1.NotFoundException('Past paper not found');
        await this.prisma.pastPaper.delete({ where: { id: pastPaperId } });
        return { message: 'Past paper deleted successfully' };
    }
};
exports.PastPapersService = PastPapersService;
exports.PastPapersService = PastPapersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PastPapersService);
//# sourceMappingURL=past-papers.service.js.map