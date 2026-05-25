import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ExamsService } from '../exams/exams.service';

export interface StudentContext {
  education_level?: string;
  class_grade?: string;
  classes_taught?: string[];
  group?: string;
  board?: string;
  subjects?: string[];
  target_exam?: string;
}

export interface ChatContext {
  subject?: string;
  class?: string;
  examType?: string;
  exam_type?: string;
  patternId?: string;
  section?: string;
  chapterStart?: number | null;
  chapterEnd?: number | null;
  topics?: string[];
  board?: string;
  confirmed?: boolean;
}

export interface ChatRequest {
  userId: string;
  message: string;
  context?: ChatContext;
  studentContext?: StudentContext | null;
}

export interface ChatResponse {
  success: boolean;
  data: {
    results?: any[];
    total_results?: number;
    query?: string;
    exam_preview?: any;
    exam_id?: string;
    file_urls?: string[];
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

  constructor(private readonly examsService: ExamsService) {}

  /** Normalize UI context for Python (snake_case + exam_type). */
  private normalizeContext(
    context?: ChatContext,
    profile?: StudentContext | null,
  ): Record<string, unknown> | undefined {
    if (!context && !profile) return undefined;

    const out: Record<string, unknown> = { ...(context || {}) };

    const examType = context?.examType || context?.exam_type;
    if (examType) {
      out.exam_type = examType;
      out.examType = examType;
    }

    // Only merge profile into confirmed chip context — prepare/chat parsing stays message-first
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

  private async persistAssistantExamIfNeeded(
    userId: string,
    response: ChatResponse,
    context?: ChatContext,
  ): Promise<void> {
    if (
      response.tool_used !== 'exam_generator_tool' ||
      !response.success ||
      !response.data?.download_ready ||
      !response.data.files?.length
    ) {
      return;
    }

    const file = response.data.files[0];
    if (!file?.data) return;

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

    const { examId, fileUrl } = await this.examsService.persistChatGeneratedExam(
      userId,
      meta,
      { filename: file.filename, dataBase64: file.data },
    );

    response.data.exam_id = examId;
    if (fileUrl) {
      response.data.file_urls = [fileUrl];
    }
  }

  async prepareExamGeneration(chatRequest: {
    userId: string;
    message: string;
    context?: ChatContext;
    studentContext?: StudentContext | null;
  }): Promise<any> {
    const normalizedContext = this.normalizeContext(
      chatRequest.context,
      chatRequest.studentContext,
    );

    try {
      const response = await axios.post(
        `${this.fastApiUrl}/exam-assistant/prepare`,
        {
          user_id: chatRequest.userId,
          message: chatRequest.message,
          context: normalizedContext,
          student_context: chatRequest.studentContext ?? null,
        },
        { timeout: 30000 },
      );
      return response.data;
    } catch (error: any) {
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

  async chat(chatRequest: ChatRequest): Promise<ChatResponse> {
    const normalizedContext = this.normalizeContext(
      chatRequest.context,
      chatRequest.studentContext,
    );

    try {
      const response = await axios.post<ChatResponse>(
        `${this.fastApiUrl}/exam-assistant/chat`,
        {
          user_id: chatRequest.userId,
          message: chatRequest.message,
          context: normalizedContext,
          student_context: chatRequest.studentContext ?? null,
        },
        {
          timeout: 600000, // 10 minutes — full exam generation
        },
      );

      const data = response.data;

      if (data.success && data.tool_used === 'exam_generator_tool') {
        await this.persistAssistantExamIfNeeded(
          chatRequest.userId,
          data,
          chatRequest.context,
        );
      }

      return data;
    } catch (error: any) {
      console.error('Exam Assistant chat error:', error.message);

      const isTimeout =
        error.code === 'ECONNABORTED' || error.message?.includes('timeout');
      const detail =
        error.response?.data?.detail ||
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

  async getConversationHistory(userId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.fastApiUrl}/exam-assistant/history/${userId}`,
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
        `${this.fastApiUrl}/exam-assistant/history/${userId}`,
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
      const response = await axios.get(`${this.fastApiUrl}/exam-assistant/health`);
      return response.data;
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
  }
}
