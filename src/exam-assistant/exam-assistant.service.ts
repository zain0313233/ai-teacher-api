import { Injectable } from '@nestjs/common';
import axios from 'axios';

export interface StudentContext {
  education_level?: string;
  class_grade?: string;
  group?: string;
  board?: string;
  subjects?: string[];
  target_exam?: string;
}

export interface ChatRequest {
  userId: string;
  message: string;
  context?: {
    subject?: string;
    class?: string;
    examType?: string;
    year?: number;
  };
  studentContext?: StudentContext | null;
}

export interface ChatResponse {
  success: boolean;
  data: {
    results?: any[];
    total_results?: number;
    query?: string;
    exam_preview?: any;
    files?: Array<{ filename: string; data: string; size: number }>;
    download_ready?: boolean;
  };
  message: string;
  response?: string;
  tool_used: string;
  next_suggestions: string[];
  suggestions?: string[];
}

@Injectable()
export class ExamAssistantService {
  private readonly fastApiUrl = process.env.FASTAPI_URL || 'http://localhost:8000';

  async chat(chatRequest: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await axios.post<ChatResponse>(
        `${this.fastApiUrl}/exam-assistant/chat`,
        {
          user_id: chatRequest.userId,
          message: chatRequest.message,
          context: chatRequest.context,
          student_context: chatRequest.studentContext ?? null,
        },
        {
          timeout: 120000, // 120 seconds - exam generation can take a while
        }
      );

      return response.data;
    } catch (error) {
      console.error('Exam Assistant chat error:', error.message);
      
      // Return fallback response
      return {
        success: false,
        data: {},
        message: 'AI assistant is currently unavailable. Please try again.',
        tool_used: 'none',
        next_suggestions: ['Try again in a moment'],
      };
    }
  }

  async getConversationHistory(userId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.fastApiUrl}/exam-assistant/history/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error('Get conversation history error:', error.message);
      return {
        success: false,
        history: [],
      };
    }
  }

  async clearConversationHistory(userId: string): Promise<any> {
    try {
      const response = await axios.delete(
        `${this.fastApiUrl}/exam-assistant/history/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error('Clear conversation history error:', error.message);
      return {
        success: false,
        message: 'Failed to clear conversation history',
      };
    }
  }

  async healthCheck(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.fastApiUrl}/exam-assistant/health`
      );
      return response.data;
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
  }
}
