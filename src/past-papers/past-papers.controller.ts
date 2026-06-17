import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { PastPapersService } from './past-papers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('past-papers')
@UseGuards(JwtAuthGuard)
export class PastPapersController {
  constructor(private readonly pastPapersService: PastPapersService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/past-papers',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}-${file.originalname}`);
        },
      }),
    }),
  )
  async uploadPastPaper(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() metadata: any,
  ) {
    return this.pastPapersService.uploadPastPaper(req.user.id, file, metadata);
  }

  @Get('coverage')
  async getPatternCoverage(
    @Request() req,
    @Query('subject') subject: string,
    @Query('chapters') chapters?: string,
    @Query('mode') mode?: string,
  ) {
    if (!subject) {
      throw new BadRequestException('subject query parameter is required');
    }
    const chapterList = chapters
      ? chapters
          .split(',')
          .map((c) => parseInt(c.trim(), 10))
          .filter((n) => !isNaN(n))
      : [];
    return this.pastPapersService.getPatternCoverage(
      req.user.id,
      subject,
      chapterList,
      mode || 'smart',
    );
  }

  @Get()
  async getUserPastPapers(@Request() req) {
    const pastPapers = await this.pastPapersService.getUserPastPapers(req.user.id);
    return { success: true, pastPapers };
  }

  @Post('patterns')
  async getPatterns(@Request() req, @Body() body: any) {
    const patterns = await this.pastPapersService.getPatterns(
      req.user.id,
      body.subject,
      body.chapters,
      body.mode || 'smart',
    );
    return { success: true, ...patterns };
  }

  @Get(':id/extraction')
  async getExtraction(@Request() req, @Param('id') id: string) {
    return this.pastPapersService.getExtraction(id, req.user.id);
  }

  @Post(':id/extract')
  async triggerExtract(
    @Request() req,
    @Param('id') id: string,
    @Query('method') method?: string,
  ) {
    return this.pastPapersService.triggerExtract(id, req.user.id, method);
  }

  @Post(':id/approve')
  async approvePastPaper(@Request() req, @Param('id') id: string) {
    return this.pastPapersService.approvePastPaper(id, req.user.id);
  }

  @Post(':id/reject')
  async rejectPastPaper(@Request() req, @Param('id') id: string) {
    return this.pastPapersService.rejectPastPaper(id, req.user.id);
  }

  @Delete(':id')
  async deletePastPaper(@Request() req, @Param('id') id: string) {
    const result = await this.pastPapersService.deletePastPaper(id, req.user.id);
    return { success: true, ...result };
  }
}
