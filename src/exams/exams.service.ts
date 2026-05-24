import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  GoneException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateExamDto } from './dto/generate-exam.dto';
import axios from 'axios';

@Injectable()
export class ExamsService {
  private readonly fastApiUrl = process.env.FASTAPI_URL || 'http://localhost:8000';
  
  constructor(private prisma: PrismaService) {}

  async generateExam(_userId: string, _generateExamDto: GenerateExamDto) {
    throw new GoneException(
      'POST /exams/generate is deprecated. Use POST /exams/generate-with-documents instead.',
    );
  }

  async getUserExams(userId: string) {
    const exams = await this.prisma.exam.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return exams;
  }

  async getExamById(examId: string, userId: string) {
    const exam = await this.prisma.exam.findFirst({
      where: {
        id: examId,
        userId,
      },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    return exam;
  }

  async deleteExam(examId: string, userId: string) {
    const exam = await this.prisma.exam.findFirst({
      where: {
        id: examId,
        userId,
      },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    await this.prisma.exam.delete({
      where: { id: examId },
    });

    return { message: 'Exam deleted successfully' };
  }

  async generateExamWithDocuments(userId: string, examData: any) {
    try {
      // Call FastAPI to generate exam with Word documents
      const response = await axios.post(
        `${this.fastApiUrl}/exams/generate-with-documents/download`,
        {
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
        },
        {
          responseType: 'arraybuffer',
          timeout: 120000, // 2 minutes
        }
      );

      // Save exam record to database
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
          fileUrls: [], // Will be updated after Cloudinary upload
        },
      });

      // Build a descriptive fallback filename from exam data
      const fallbackName = this.buildExamFileName(examData.subject, examData.class, examData.examType);

      // Return the file buffer and exam ID
      return {
        examId: exam.id,
        fileBuffer: response.data,
        contentType: response.headers['content-type'],
        fileName: this.extractFileName(response.headers['content-disposition'], fallbackName),
      };
    } catch (error: any) {
      console.error('FastAPI exam generation error:', error.message);
      const status = error?.response?.status;
      const data = error?.response?.data;
      if (status === 422 && data) {
        let detail = 'Exam generation failed';
        try {
          const text = Buffer.isBuffer(data) ? data.toString('utf8') : JSON.stringify(data);
          const parsed = JSON.parse(text);
          detail = parsed.detail || parsed.message || detail;
        } catch {
          /* use default */
        }
        throw new UnprocessableEntityException(detail);
      }
      throw error;
    }
  }

  private extractFileName(contentDisposition: string, fallback: string = 'exam.docx'): string {
    if (!contentDisposition) return fallback;
    const match = contentDisposition.match(/filename="?([^"]+)"?/);
    return match ? match[1] : fallback;
  }

  private buildExamFileName(subject: string, className: string, examType: string): string {
    const safeSubject = (subject || 'Exam').replace(/\s+/g, '_');
    const safeClass = className ? `_Class${className}` : '';
    const typeMap: Record<string, string> = {
      'quiz': 'Quiz',
      'mid-term': 'Mid_Term',
      'final': 'Final_Exam',
      'practical': 'Practical',
    };
    const safeType = typeMap[examType?.toLowerCase()] || (examType || 'Exam').replace(/[\s-]+/g, '_');
    return `${safeSubject}${safeClass}_${safeType}.docx`;
  }
}
