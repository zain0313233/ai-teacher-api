import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExamGenieService } from './exam-genie.service';
import { GenerateQuizDto } from './dto/generate-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@Controller('exam-genie')
@UseGuards(JwtAuthGuard)
export class ExamGenieController {
  constructor(private readonly examGenieService: ExamGenieService) {}

  @Get('materials')
  getMaterials(@Request() req, @Query('subject') subject?: string) {
    return this.examGenieService.getMaterials(req.user.id, subject);
  }

  @Get('predictions')
  getPredictions(
    @Request() req,
    @Query('subject') subject: string,
    @Query('chapters') chapters?: string,
    @Query('mode') mode?: string,
  ) {
    const chapterList = chapters
      ? chapters.split(',').map((c) => parseInt(c.trim(), 10)).filter((n) => !isNaN(n))
      : [];
    return this.examGenieService.getPredictions(
      req.user.id,
      subject,
      chapterList,
      mode || 'prediction',
    );
  }

  @Get('patterns')
  getAvailablePatterns(@Request() req, @Query('subject') subject: string) {
    return this.examGenieService.getAvailablePatterns(req.user.id, subject);
  }

  @Get('weak-topics')
  getWeakTopics(@Request() req, @Query('subject') subject?: string) {
    return this.examGenieService.getWeakTopicRecommendations(req.user.id, subject);
  }

  @Post('quizzes/generate')
  generateQuiz(@Request() req, @Body() dto: GenerateQuizDto) {
    return this.examGenieService.generateQuiz(req.user.id, dto);
  }

  @Get('quizzes')
  listQuizzes(@Request() req) {
    return this.examGenieService.listQuizzes(req.user.id);
  }

  @Get('quizzes/:id')
  getQuiz(@Request() req, @Param('id') id: string) {
    return this.examGenieService.getQuiz(req.user.id, id);
  }

  @Post('quizzes/:id/submit')
  submitQuiz(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: SubmitQuizDto,
  ) {
    return this.examGenieService.submitQuiz(req.user.id, id, dto);
  }
}
