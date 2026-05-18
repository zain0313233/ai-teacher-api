"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamAssistantService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let ExamAssistantService = class ExamAssistantService {
    fastApiUrl = process.env.FASTAPI_URL || 'http://localhost:8000';
    async chat(chatRequest) {
        try {
            const response = await axios_1.default.post(`${this.fastApiUrl}/exam-assistant/chat`, {
                user_id: chatRequest.userId,
                message: chatRequest.message,
                context: chatRequest.context,
            }, {
                timeout: 120000,
            });
            return response.data;
        }
        catch (error) {
            console.error('Exam Assistant chat error:', error.message);
            return {
                success: false,
                data: {},
                message: 'AI assistant is currently unavailable. Please try again.',
                tool_used: 'none',
                next_suggestions: ['Try again in a moment'],
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
    (0, common_1.Injectable)()
], ExamAssistantService);
//# sourceMappingURL=exam-assistant.service.js.map