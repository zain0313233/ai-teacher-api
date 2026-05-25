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
exports.ExamAssistantService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const exams_service_1 = require("../exams/exams.service");
let ExamAssistantService = class ExamAssistantService {
    examsService;
    fastApiUrl = process.env.FASTAPI_URL || 'http://localhost:8000';
    constructor(examsService) {
        this.examsService = examsService;
    }
    normalizeContext(context, profile) {
        if (!context && !profile)
            return undefined;
        const out = { ...(context || {}) };
        const examType = context?.examType || context?.exam_type;
        if (examType) {
            out.exam_type = examType;
            out.examType = examType;
        }
        if (context?.confirmed) {
            if (!out.subject && profile?.subjects?.length === 1) {
                out.subject = profile.subjects[0];
            }
            if (!out.class && profile?.class_grade) {
                out.class = profile.class_grade;
            }
            if (!out.board && profile?.board) {
                out.board = profile.board;
            }
        }
        return Object.keys(out).length ? out : undefined;
    }
    async persistAssistantExamIfNeeded(userId, response, context) {
        if (response.tool_used !== 'exam_generator_tool' ||
            !response.success ||
            !response.data?.download_ready ||
            !response.data.files?.length) {
            return;
        }
        const file = response.data.files[0];
        if (!file?.data)
            return;
        const preview = response.data.exam_preview || {};
        const meta = {
            subject: preview.subject || context?.subject || 'Exam',
            class: String(context?.class || '9'),
            section: context?.section || 'A',
            examType: context?.examType || context?.exam_type || preview.exam_type || 'mid-term',
            chapterStart: context?.chapterStart ?? null,
            chapterEnd: context?.chapterEnd ?? null,
            patternId: context?.patternId ?? null,
            topics: context?.topics || [],
        };
        const { examId, fileUrl } = await this.examsService.persistChatGeneratedExam(userId, meta, { filename: file.filename, dataBase64: file.data });
        response.data.exam_id = examId;
        if (fileUrl) {
            response.data.file_urls = [fileUrl];
        }
    }
    async prepareExamGeneration(chatRequest) {
        const normalizedContext = this.normalizeContext(chatRequest.context, chatRequest.studentContext);
        try {
            const response = await axios_1.default.post(`${this.fastApiUrl}/exam-assistant/prepare`, {
                user_id: chatRequest.userId,
                message: chatRequest.message,
                context: normalizedContext,
                student_context: chatRequest.studentContext ?? null,
            }, { timeout: 30000 });
            return response.data;
        }
        catch (error) {
            console.error('Exam prepare error:', error.message);
            return {
                success: false,
                is_exam_request: true,
                action: 'needs_input',
                missing: ['subject', 'chapters', 'examType', 'section'],
                resolved: {},
                prompt: 'Could not parse your request. Please fill in the details below.',
                options: {
                    subjects: chatRequest.studentContext?.subjects ?? [],
                    examTypes: ['mid-term', 'final', 'quiz', 'practice'],
                    sections: ['A', 'B', 'C', 'D'],
                    chapters: [],
                },
            };
        }
    }
    async chat(chatRequest) {
        const normalizedContext = this.normalizeContext(chatRequest.context, chatRequest.studentContext);
        try {
            const response = await axios_1.default.post(`${this.fastApiUrl}/exam-assistant/chat`, {
                user_id: chatRequest.userId,
                message: chatRequest.message,
                context: normalizedContext,
                student_context: chatRequest.studentContext ?? null,
            }, {
                timeout: 600000,
            });
            const data = response.data;
            if (data.success && data.tool_used === 'exam_generator_tool') {
                await this.persistAssistantExamIfNeeded(chatRequest.userId, data, chatRequest.context);
            }
            return data;
        }
        catch (error) {
            console.error('Exam Assistant chat error:', error.message);
            const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
            const detail = error.response?.data?.detail ||
                error.response?.data?.message ||
                error.message;
            return {
                success: false,
                data: {},
                message: isTimeout
                    ? 'Exam generation is taking longer than expected. Please try again or use the Generate Exam form.'
                    : `AI assistant error: ${detail || 'Please try again.'}`,
                response: isTimeout
                    ? '⏱️ The request timed out while generating your exam. Try a smaller chapter range, or use **Generate Exam** on this page.'
                    : `Sorry, something went wrong: ${detail || 'please try again.'}`,
                tool_used: 'none',
                next_suggestions: ['Try again with fewer chapters', 'Use the Generate Exam form'],
                suggestions: ['Try again with fewer chapters', 'Use the Generate Exam form'],
            };
        }
    }
    async getConversationHistory(userId) {
        try {
            const response = await axios_1.default.get(`${this.fastApiUrl}/exam-assistant/history/${userId}`);
            return response.data;
        }
        catch (error) {
            console.error('Get conversation history error:', error.message);
            return {
                success: false,
                history: [],
            };
        }
    }
    async clearConversationHistory(userId) {
        try {
            const response = await axios_1.default.delete(`${this.fastApiUrl}/exam-assistant/history/${userId}`);
            return response.data;
        }
        catch (error) {
            console.error('Clear conversation history error:', error.message);
            return {
                success: false,
                message: 'Failed to clear conversation history',
            };
        }
    }
    async healthCheck() {
        try {
            const response = await axios_1.default.get(`${this.fastApiUrl}/exam-assistant/health`);
            return response.data;
        }
        catch (error) {
            return {
                status: 'unhealthy',
                error: error.message,
            };
        }
    }
};
exports.ExamAssistantService = ExamAssistantService;
exports.ExamAssistantService = ExamAssistantService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [exams_service_1.ExamsService])
], ExamAssistantService);
//# sourceMappingURL=exam-assistant.service.js.map