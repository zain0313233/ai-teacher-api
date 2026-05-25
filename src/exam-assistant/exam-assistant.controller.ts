import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ExamAssistantService, StudentContext } from './exam-assistant.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('exam-assistant')
@UseGuards(JwtAuthGuard)
export class ExamAssistantController {
  constructor(
    private readonly examAssistantService: ExamAssistantService,
    private readonly prisma: PrismaService,
  ) {}

  private async buildProfileContext(userId: string): Promise<StudentContext | null> {
    const student = await this.prisma.studentProfile
      .findUnique({
        where: { userId },
        select: {
          educationLevel: true,
          classGrade: true,
          group: true,
          board: true,
          subjects: true,
          targetExam: true,
        },
      })
      .catch(() => null);

    if (student) {
      return {
        education_level: student.educationLevel,
        class_grade: student.classGrade ?? undefined,
        classes_taught: student.classGrade ? [student.classGrade] : [],
        group: student.group ?? undefined,
        board: student.board ?? undefined,
        subjects: student.subjects,
        target_exam: student.targetExam ?? undefined,
      };
    }

    const teacher = await this.prisma.teacherProfile
      .findUnique({
        where: { userId },
        select: {
          subjectsTaught: true,
          classesTaught: true,
          board: true,
        },
      })
      .catch(() => null);

    if (teacher) {
      return {
        education_level: 'secondary',
        class_grade: teacher.classesTaught?.[0] ?? undefined,
        classes_taught: teacher.classesTaught ?? [],
        board: teacher.board ?? undefined,
        subjects: teacher.subjectsTaught,
      };
    }

    return null;
  }

  @Post('prepare')
  async prepare(@Request() req, @Body() body: { message: string; context?: any }) {
    const userId = req.user.id;
    const studentContext = await this.buildProfileContext(userId);

    return this.examAssistantService.prepareExamGeneration({
      userId,
      message: body.message,
      context: body.context,
      studentContext,
    });
  }

  @Post('chat')
  async chat(@Request() req, @Body() body: { message: string; context?: any }) {
    const userId = req.user.id;
    const studentContext = await this.buildProfileContext(userId);

    const result = await this.examAssistantService.chat({
      userId,
      message: body.message,
      context: body.context,
      studentContext,
    });

    return result;
  }

  @Get('history')
  async getHistory(@Request() req) {
    return this.examAssistantService.getConversationHistory(req.user.id);
  }

  @Delete('history')
  async clearHistory(@Request() req) {
    return this.examAssistantService.clearConversationHistory(req.user.id);
  }

  @Get('health')
  async health() {
    return this.examAssistantService.healthCheck();
  }
}
