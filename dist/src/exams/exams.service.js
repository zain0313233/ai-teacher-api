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
exports.ExamsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const axios_1 = __importDefault(require("axios"));
let ExamsService = class ExamsService {
    prisma;
    fastApiUrl = process.env.FASTAPI_URL || 'http://localhost:8000';
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateExam(_userId, _generateExamDto) {
        throw new common_1.GoneException('POST /exams/generate is deprecated. Use POST /exams/generate-with-documents instead.');
    }
    async getUserExams(userId) {
        const exams = await this.prisma.exam.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        return exams;
    }
    async getExamById(examId, userId) {
        const exam = await this.prisma.exam.findFirst({
            where: {
                id: examId,
                userId,
            },
        });
        if (!exam) {
            throw new common_1.NotFoundException('Exam not found');
        }
        return exam;
    }
    async deleteExam(examId, userId) {
        const exam = await this.prisma.exam.findFirst({
            where: {
                id: examId,
                userId,
            },
        });
        if (!exam) {
            throw new common_1.NotFoundException('Exam not found');
        }
        await this.prisma.exam.delete({
            where: { id: examId },
        });
        return { message: 'Exam deleted successfully' };
    }
    async generateExamWithDocuments(userId, examData) {
        try {
            const response = await axios_1.default.post(`${this.fastApiUrl}/exams/generate-with-documents/download`, {
                user_id: userId,
                subject: examData.subject,
                exam_type: examData.examType,
                class_name: examData.class,
                section: examData.section,
                topics: examData.topics || [],
                pattern: examData.pattern,
                chapter_start: examData.chapterStart,
                chapter_end: examData.chapterEnd,
                include_answer_layout: examData.includeAnswerKeyLayout,
                time_allowed: examData.timeAllowed,
                use_past_paper_intelligence: examData.usePastPaperIntelligence ?? true,
                generation_mode: examData.generationMode ?? 'smart',
            }, {
                responseType: 'arraybuffer',
                timeout: 120000,
            });
            const exam = await this.prisma.exam.create({
                data: {
                    userId,
                    subject: examData.subject,
                    class: examData.class,
                    section: examData.section,
                    examType: examData.examType,
                    chapterStart: examData.chapterStart,
                    chapterEnd: examData.chapterEnd,
                    patternId: examData.patternId,
                    topics: examData.topics || [],
                    examContent: {},
                    fileUrls: [],
                },
            });
            const fallbackName = this.buildExamFileName(examData.subject, examData.class, examData.examType);
            return {
                examId: exam.id,
                fileBuffer: response.data,
                contentType: response.headers['content-type'],
                fileName: this.extractFileName(response.headers['content-disposition'], fallbackName),
            };
        }
        catch (error) {
            console.error('FastAPI exam generation error:', error.message);
            const status = error?.response?.status;
            const data = error?.response?.data;
            if (status === 422 && data) {
                let detail = 'Exam generation failed';
                try {
                    const text = Buffer.isBuffer(data) ? data.toString('utf8') : JSON.stringify(data);
                    const parsed = JSON.parse(text);
                    detail = parsed.detail || parsed.message || detail;
                }
                catch {
                }
                throw new common_1.UnprocessableEntityException(detail);
            }
            throw error;
        }
    }
    extractFileName(contentDisposition, fallback = 'exam.docx') {
        if (!contentDisposition)
            return fallback;
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        return match ? match[1] : fallback;
    }
    buildExamFileName(subject, className, examType) {
        const safeSubject = (subject || 'Exam').replace(/\s+/g, '_');
        const safeClass = className ? `_Class${className}` : '';
        const typeMap = {
            'quiz': 'Quiz',
            'mid-term': 'Mid_Term',
            'final': 'Final_Exam',
            'practical': 'Practical',
        };
        const safeType = typeMap[examType?.toLowerCase()] || (examType || 'Exam').replace(/[\s-]+/g, '_');
        return `${safeSubject}${safeClass}_${safeType}.docx`;
    }
};
exports.ExamsService = ExamsService;
exports.ExamsService = ExamsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExamsService);
//# sourceMappingURL=exams.service.js.map