import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { SupabaseService } from './supabase.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB
    },
  }))
  async uploadDocument(
    @Request() req, 
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any, // Get all form data
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const { 
      uploadMode, 
      subject, 
      level, 
      class: classValue,
      educationSystem,
      documentType,
      chapterNumber, 
      chapterName 
    } = body;

    // Validate file type
    const allowedTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only PDF and DOCX files are allowed');
    }

    // Validate file size (50MB for Supabase free tier)
    if (file.size > 50 * 1024 * 1024) {
      throw new BadRequestException('File size must be less than 50MB');
    }

    // Validate chapter mode requirements
    if (uploadMode === 'chapter') {
      if (!subject) {
        throw new BadRequestException('Subject is required for chapter upload');
      }
      if (!chapterNumber) {
        throw new BadRequestException('Chapter number is required for chapter upload');
      }
      if (!chapterName) {
        throw new BadRequestException('Chapter name is required for chapter upload');
      }
    }

    // Validate level and class combination
    if (level && ['matric', 'fsc'].includes(level) && !classValue) {
      throw new BadRequestException(`Class is required for ${level} level`);
    }

    // Upload to Supabase Storage
    const fileUrl = await this.supabaseService.uploadFile(file);

    // Save to database and process with FastAPI
    const document = await this.documentsService.uploadDocument(
      req.user.id,
      file.originalname,
      file.mimetype,
      fileUrl,
      file.size,
      {
        subject,
        level,
        class: classValue,
        educationSystem,
        documentType,
        chapterMetadata: uploadMode === 'chapter' && chapterNumber && chapterName ? {
          chapterNumber: parseInt(chapterNumber, 10),
          chapterName: chapterName,
        } : undefined,
      },
    );

    return document;
  }

  @Get('chapters')
  async getChapters(@Request() req, @Query('subject') subject: string) {
    if (!subject) {
      throw new BadRequestException('Subject is required');
    }
    
    const chapters = await this.documentsService.getChaptersBySubject(req.user.id, subject);
    return chapters;
  }

  @Get()
  async getUserDocuments(@Request() req) {
    const documents = await this.documentsService.getUserDocuments(req.user.id);
    return documents;
  }

  @Get(':id')
  async getDocument(@Request() req, @Param('id') id: string) {
    const document = await this.documentsService.getDocumentById(id, req.user.id);
    return document;
  }

  @Get(':id/status')
  async getDocumentStatus(@Request() req, @Param('id') id: string) {
    const document = await this.documentsService.getDocumentById(id, req.user.id);
    return {
      id: document.id,
      fileName: document.fileName,
      processed: document.processed,
      status: document.processed ? 'complete' : 'processing',
    };
  }

  @Delete(':id')
  async deleteDocument(@Request() req, @Param('id') id: string) {
    const result = await this.documentsService.deleteDocument(id, req.user.id);
    return result;
  }
}
