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
    async generateExam(userId, generateExamDto) {
        try {
            const response = await axios_1.default.post(`${this.fastApiUrl}/exams/generate`, {
                user_id: userId,
                subject: generateExamDto.subject,
                exam_type: generateExamDto.examType,
                topics: generateExamDto.topics,
                structure: generateExamDto.structure,
            });
            const exam = await this.prisma.exam.create({
                data: {
                    userId,
                    subject: generateExamDto.subject,
                    class: '',
                    section: '',
                    examType: generateExamDto.examType,
                    topics: generateExamDto.topics,
                    examContent: response.data.exam_content,
                },
            });
            return exam;
        }
        catch (error) {
            console.error('FastAPI exam generation error:', error.message);
            const exam = await this.prisma.exam.create({
                data: {
                    userId,
                    subject: generateExamDto.subject,
                    class: '',
                    section: '',
                    examType: generateExamDto.examType,
                    topics: generateExamDto.topics,
                    examContent: {
                        structure: generateExamDto.structure,
                        questions: [],
                        error: 'AI engine unavailable',
                    },
                },
            });
            return exam;
        }
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
            return {
                examId: exam.id,
                fileBuffer: response.data,
                contentType: response.headers['content-type'],
                fileName: this.extractFileName(response.headers['content-disposition']),
            };
        }
        catch (error) {
            console.error('FastAPI exam generation error:', error.message);
            throw error;
        }
    }
    extractFileName(contentDisposition) {
        if (!contentDisposition)
            return 'exam.docx';
        const match = contentDisposition.match(/filename="?(.+?)"?$/);
        return match ? match[1] : 'exam.docx';
    }
};
exports.ExamsService = ExamsService;
exports.ExamsService = ExamsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExamsService);
//# sourceMappingURL=exams.service.js.map