import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ExamAssistantService } from './exam-assistant.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('exam-assistant')
@UseGuards(JwtAuthGuard)
export class ExamAssistantController {
  constructor(
    private readonly examAssistantService: ExamAssistantService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('chat')
  async chat(@Request() req, @Body() body: { message: string; context?: any }) {
    const userId = req.user.id;

    const profile = await this.prisma.studentProfile.findUnique({
      where: { userId },
      select: {
        educationLevel: true,
        classGrade: true,
        group: true,
        board: true,
        subjects: true,
        targetExam: true,
      },
    }).catch(() => null);

    const result = await this.examAssistantService.chat({
      userId,
      message: body.message,
      context: body.context,
      studentContext: profile ? {
        education_level: profile.educationLevel,
        class_grade: profile.classGrade ?? undefined,
        group: profile.group ?? undefined,
        board: profile.board ?? undefined,
        subjects: profile.subjects,
        target_exam: profile.targetExam ?? undefined,
      } : null,
    });

    return result;
  }

  @Get('history')
  async getHistory(@Request() req) {
    const result = await this.examAssistantService.getConversationHistory(
      req.user.id
    );
    return result;
  }

  @Delete('history')
  async clearHistory(@Request() req) {
    const result = await this.examAssistantService.clearConversationHistory(
      req.user.id
    );
    return result;
  }

  @Get('health')
  async health() {
    const result = await this.examAssistantService.healthCheck();
    return result;
  }
}
