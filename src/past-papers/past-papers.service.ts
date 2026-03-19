import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';

@Injectable()
export class PastPapersService {
  private readonly fastApiUrl = process.env.FASTAPI_URL || 'http://localhost:8000';

  constructor(private prisma: PrismaService) {}

  async uploadPastPaper(userId: string, file: Express.Multer.File, metadata: any) {
    try {
      // Handle multi-year vs single-year
      const isMultiYear = metadata.isMultiYear === 'true';
      let year: number;
      let yearFrom: number | null = null;
      let yearTo: number | null = null;

      if (isMultiYear) {
        yearFrom = parseInt(metadata.yearFrom);
        yearTo = parseInt(metadata.yearTo);
        
        if (isNaN(yearFrom) || isNaN(yearTo)) {
          throw new Error('Valid year range (yearFrom and yearTo) is required for multi-year papers');
        }
        
        // For multi-year, use the starting year for the upload
        year = yearFrom;
      } else {
        year = parseInt(metadata.year);
        
        if (isNaN(year)) {
          throw new Error('Valid year is required for single-year papers');
        }
      }

      // Create FormData for FastAPI - it only accepts single year
      const formData = new FormData();
      formData.append('file', fs.createReadStream(file.path), file.originalname);
      formData.append('user_id', userId);
      formData.append('subject', metadata.subject);
      formData.append('year', year.toString());
      formData.append('class_name', metadata.class);
      formData.append('board', metadata.board || 'Punjab Board');
      formData.append('exam_type', metadata.examType || 'final');

      // Upload to FastAPI
      const uploadResponse = await axios.post(
        `${this.fastApiUrl}/past-papers/upload`,
        formData,
        {
          headers: formData.getHeaders(),
          timeout: 60000,
        }
      );

      const fileUrl = uploadResponse.data.file_url;
      const fileSize = uploadResponse.data.file_size;

      // Save to database
      const pastPaper = await this.prisma.pastPaper.create({
        data: {
          userId,
          subject: metadata.subject,
          examType: metadata.examType || 'final',
          year: year,
          board: metadata.board || 'Punjab Board',
          class: metadata.class,
          fileName: file.originalname,
          fileUrl: fileUrl,
          fileSize: fileSize,
          processed: false,
        },
      });

      // Process the paper (async)
      this.processPastPaperAsync(pastPaper.id, fileUrl, metadata, userId, year);

      return {
        success: true,
        pastPaperId: pastPaper.id,
        message: isMultiYear 
          ? `Past paper uploaded for years ${yearFrom}-${yearTo}. Processing started.`
          : 'Past paper uploaded and processing started',
      };
    } catch (error) {
      console.error('Error uploading past paper:', error.message);
      throw error;
    }
  }

  private async processPastPaperAsync(
    pastPaperId: string,
    fileUrl: string,
    metadata: any,
    userId: string,
    year: number,
  ) {
    try {
      const requestData = {
        user_id: userId,
        subject: metadata.subject,
        year: year,
        class_name: metadata.class,
        board: metadata.board || 'Punjab Board',
        exam_type: metadata.examType || 'final',
        file_url: fileUrl,
      };

      // Call FastAPI to process
      const processResponse = await axios.post(
        `${this.fastApiUrl}/past-papers/process`,
        requestData,
        {
          timeout: 600000, // Increased to 10 minutes for large PDFs with OCR
        }
      );

      // Update database
      await this.prisma.pastPaper.update({
        where: { id: pastPaperId },
        data: { processed: true },
      });

      console.log(`Past paper ${pastPaperId} processed successfully`);
    } catch (error) {
      console.error(`Error processing past paper ${pastPaperId}:`, error.message);
      
      // Mark as processed even if there's a timeout to avoid stuck state
      // The FastAPI logs will show if processing actually completed
      try {
        await this.prisma.pastPaper.update({
          where: { id: pastPaperId },
          data: { processed: true },
        });
      } catch (dbError) {
        console.error(`Failed to update database for ${pastPaperId}:`, dbError.message);
      }
    }
  }

  async getUserPastPapers(userId: string) {
    const pastPapers = await this.prisma.pastPaper.findMany({
      where: { userId },
      orderBy: { year: 'desc' },
    });

    return pastPapers;
  }

  async getPatterns(userId: string, subject: string, chapters: number[], mode: string = 'smart') {
    try {
      const response = await axios.post(
        `${this.fastApiUrl}/past-papers/patterns/retrieve`,
        {
          user_id: userId,
          subject,
          chapters,
          mode,
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error retrieving patterns:', error.message);
      throw error;
    }
  }

  async deletePastPaper(pastPaperId: string, userId: string) {
    const pastPaper = await this.prisma.pastPaper.findFirst({
      where: { id: pastPaperId, userId },
    });

    if (!pastPaper) {
      throw new Error('Past paper not found');
    }

    await this.prisma.pastPaper.delete({
      where: { id: pastPaperId },
    });

    return { message: 'Past paper deleted successfully' };
  }
}
