import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ExamsService } from './exams.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GenerateExamDto } from './dto/generate-exam.dto';

@Controller('exams')
@UseGuards(JwtAuthGuard)
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post('generate')
  async generateExam(@Request() req, @Body() generateExamDto: GenerateExamDto) {
    const exam = await this.examsService.generateExam(req.user.id, generateExamDto);
    return {
      success: true,
      exam,
    };
  }

  @Post('generate-with-documents')
  async generateExamWithDocuments(@Request() req, @Body() examData: any, @Res() res: Response) {
    try {
      const result = await this.examsService.generateExamWithDocuments(req.user.id, examData);
      
      // Set headers and send file
      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
      res.setHeader('X-Exam-Id', result.examId);
      res.send(result.fileBuffer);
    } catch (error) {
      const status = typeof error.getStatus === 'function' ? error.getStatus() : 500;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  @Get()
  async getUserExams(@Request() req) {
    const exams = await this.examsService.getUserExams(req.user.id);
    return {
      success: true,
      exams,
    };
  }

  @Get(':id')
  async getExam(@Request() req, @Param('id') id: string) {
    const exam = await this.examsService.getExamById(id, req.user.id);
    return {
      success: true,
      exam,
    };
  }

  @Delete(':id')
  async deleteExam(@Request() req, @Param('id') id: string) {
    const result = await this.examsService.deleteExam(id, req.user.id);
    return {
      success: true,
      ...result,
    };
  }
}
