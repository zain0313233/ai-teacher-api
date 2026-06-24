import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PatternsService } from './patterns.service';
import { CreatePatternDto } from './dto/create-pattern.dto';
import { UpdatePatternDto } from './dto/update-pattern.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('patterns')
@UseGuards(JwtAuthGuard)
export class PatternsController {
  constructor(private readonly patternsService: PatternsService) {}

  @Post()
  async createPattern(@Request() req, @Body() createPatternDto: CreatePatternDto) {
    const pattern = await this.patternsService.createPattern(
      req.user.id,
      createPatternDto,
    );
    return pattern;
  }

  @Get()
  async getUserPatterns(@Request() req) {
    const patterns = await this.patternsService.getUserPatterns(req.user.id);
    return patterns;
  }

  @Get('stats')
  async getPatternStats(@Request() req) {
    const stats = await this.patternsService.getPatternStats(req.user.id);
    return stats;
  }

  @Get('available')
  async getAvailablePatterns(
    @Request() req,
    @Query('subject') subject: string,
    @Query('classGrade') classGrade?: string,
    @Query('board') board?: string,
  ) {
    if (!subject?.trim()) {
      return { success: true, patterns: [] };
    }
    if (req.user.role === 'TEACHER') {
      return this.patternsService.getAvailablePatternsForTeacher(req.user.id, subject, {
        classGrade,
        board,
      });
    }
    return this.patternsService.getAvailablePatternsForContext(req.user.id, subject, {
      classGrade,
      board,
      includeTeacherPatterns: req.user.role === 'USER',
    });
  }

  @Get(':id')
  async getPattern(@Request() req, @Param('id') id: string) {
    const pattern = await this.patternsService.getPatternById(id, req.user.id);
    return pattern;
  }

  @Put(':id')
  async updatePattern(
    @Request() req,
    @Param('id') id: string,
    @Body() updatePatternDto: UpdatePatternDto,
  ) {
    const pattern = await this.patternsService.updatePattern(
      id,
      req.user.id,
      updatePatternDto,
    );
    return pattern;
  }

  @Delete(':id')
  async deletePattern(@Request() req, @Param('id') id: string) {
    const result = await this.patternsService.deletePattern(id, req.user.id);
    return result;
  }

  @Post(':id/use')
  async markPatternAsUsed(@Request() req, @Param('id') id: string) {
    await this.patternsService.markAsUsed(id, req.user.id);
    return { message: 'Pattern marked as used' };
  }

  @Post('preview-with-ai')
  async previewPatternWithAI(@Request() req, @Body() body: { prompt: string }) {
    const result = await this.patternsService.previewPatternWithAI(
      req.user.id,
      body.prompt,
    );
    return result;
  }

  @Post('create-with-ai')
  async createPatternWithAI(
    @Request() req,
    @Body() body: { prompt: string; save?: boolean },
  ) {
    const result = await this.patternsService.createPatternWithAI(
      req.user.id,
      body.prompt,
      body.save !== false,
    );
    return result;
  }

  // ===== Template Management Endpoints =====

  @Get('templates/list')
  async listTemplates(
    @Query('board') board?: string,
    @Query('subject') subject?: string,
    @Query('verified') verified?: string,
  ) {
    const isVerified = verified === 'true' ? true : verified === 'false' ? false : undefined;
    return this.patternsService.listTemplates({ board, subject, isVerified });
  }

  @Get('templates/:id')
  async getTemplate(@Param('id') id: string) {
    return this.patternsService.getTemplate(id);
  }

  @Patch('templates/:id/correct')
  async correctTemplate(
    @Request() req,
    @Param('id') id: string,
    @Body() body: {
      name: string;
      subject: string;
      totalMarks: number;
      duration: number;
      sections: any[];
      reason?: string;
    },
  ) {
    return this.patternsService.correctPattern(
      id,
      { name: body.name, subject: body.subject, totalMarks: body.totalMarks, duration: body.duration, sections: body.sections },
      req.user.id,
      body.reason,
    );
  }
}
