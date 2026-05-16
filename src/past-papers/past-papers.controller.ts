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
    const result = await this.pastPapersService.uploadPastPaper(
      req.user.id,
      file,
      metadata,
    );

    return result;
  }

  @Get()
  async getUserPastPapers(@Request() req) {
    const pastPapers = await this.pastPapersService.getUserPastPapers(req.user.id);

    return {
      success: true,
      pastPapers,
    };
  }

  @Post('patterns')
  async getPatterns(@Request() req, @Body() body: any) {
    const patterns = await this.pastPapersService.getPatterns(
      req.user.id,
      body.subject,
      body.chapters,
      body.mode || 'smart',
    );

    return {
      success: true,
      ...patterns,
    };
  }

  @Delete(':id')
  async deletePastPaper(@Request() req, @Param('id') id: string) {
    const result = await this.pastPapersService.deletePastPaper(id, req.user.id);

    return {
      success: true,
      ...result,
    };
  }
}
