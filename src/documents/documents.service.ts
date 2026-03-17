import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class DocumentsService {
  private readonly fastApiUrl = process.env.FASTAPI_URL || 'http://localhost:8000';
  
  constructor(private prisma: PrismaService) {}

  async uploadDocument(
    userId: string,
    fileName: string,
    fileType: string,
    fileUrl: string,
    fileSize: number,
    subject?: string,
    chapterMetadata?: { chapterNumber: number; chapterName: string },
  ) {
    // Determine upload mode
    const uploadMode = chapterMetadata ? 'chapter' : 'fullbook';
    
    // Step 1: Save document to database immediately
    const document = await this.prisma.document.create({
      data: {
        userId,
        fileName,
        fileType,
        fileUrl,
        fileSize,
        subject,
        uploadMode,
        chapterNumber: chapterMetadata?.chapterNumber,
        chapterName: chapterMetadata?.chapterName,
        processed: false, // Will be updated after processing
      },
    });

    // Step 2: Call FastAPI to process document (async - don't wait)
    // This runs in background so user gets immediate response
    this.processDocumentAsync(
      document.id, 
      fileUrl, 
      fileType, 
      userId, 
      subject,
      uploadMode,
      chapterMetadata,
    );

    return document;
  }

  private async processDocumentAsync(
    documentId: string,
    fileUrl: string,
    fileType: string,
    userId: string,
    subject?: string,
    uploadMode?: string,
    chapterMetadata?: { chapterNumber: number; chapterName: string },
  ) {
    try {
      const payload: any = {
        document_id: documentId,
        file_url: fileUrl,
        file_type: fileType,
        user_id: userId,
        subject: subject,
        upload_mode: uploadMode,
      };

      // Add chapter metadata if available
      if (chapterMetadata) {
        payload.chapter_number = chapterMetadata.chapterNumber;
        payload.chapter_name = chapterMetadata.chapterName;
      }

      const response = await axios.post(
        `${this.fastApiUrl}/documents/process`,
        payload,
        {
          timeout: 1800000, // 30 minutes timeout for large files
        }
      );
      
      // Store chapters in database if detected (for fullbook mode)
      if (response.data.chapters && response.data.chapters.length > 0) {
        await this.storeChapters(documentId, response.data.chapters);
      }
      
      // For chapter mode, store the single chapter
      if (uploadMode === 'chapter' && chapterMetadata) {
        await this.prisma.chapter.upsert({
          where: {
            documentId_chapterNumber: {
              documentId,
              chapterNumber: chapterMetadata.chapterNumber,
            },
          },
          create: {
            documentId,
            chapterNumber: chapterMetadata.chapterNumber,
            chapterName: chapterMetadata.chapterName,
            startPosition: 0,
            endPosition: 0,
          },
          update: {
            chapterName: chapterMetadata.chapterName,
          },
        });
      }
      
      // Mark as processed
      await this.markAsProcessed(documentId);
    } catch (error) {
      console.error('FastAPI processing error:', error.message);
      // Mark as failed but keep the document
      await this.prisma.document.update({
        where: { id: documentId },
        data: { processed: false },
      });
    }
  }

  async getUserDocuments(userId: string) {
    const documents = await this.prisma.document.findMany({
      where: { userId },
      orderBy: { uploadDate: 'desc' },
    });

    return documents;
  }

  async getDocumentById(documentId: string, userId: string) {
    const document = await this.prisma.document.findFirst({
      where: {
        id: documentId,
        userId,
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async deleteDocument(documentId: string, userId: string) {
    const document = await this.prisma.document.findFirst({
      where: {
        id: documentId,
        userId,
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Delete from Pinecone first
    try {
      await axios.delete(`${this.fastApiUrl}/documents/${documentId}`);
    } catch (error) {
      console.error('FastAPI deletion error:', error.message);
    }

    // Delete from database
    await this.prisma.document.delete({
      where: { id: documentId },
    });

    return { message: 'Document deleted successfully' };
  }

  async markAsProcessed(documentId: string) {
    await this.prisma.document.update({
      where: { id: documentId },
      data: { processed: true },
    });
  }

  private async storeChapters(documentId: string, chapters: any[]) {
    // Store chapters in database
    for (const chapter of chapters) {
      await this.prisma.chapter.create({
        data: {
          documentId,
          chapterNumber: chapter.chapter_number,
          chapterName: chapter.chapter_name,
          startPosition: chapter.start_position,
          endPosition: chapter.end_position,
        },
      });
    }
  }

  async getChaptersBySubject(userId: string, subject: string) {
    // First try to get from database
    const documents = await this.prisma.document.findMany({
      where: {
        userId,
        subject,
        processed: true,
      },
      include: {
        chapters: {
          orderBy: { chapterNumber: 'asc' },
        },
      },
    });

    // If we have chapters in database, return them
    const allChapters = documents.flatMap(doc => doc.chapters);
    
    if (allChapters.length > 0) {
      // Remove duplicates by chapter number
      const uniqueChapters = Array.from(
        new Map(allChapters.map(ch => [ch.chapterNumber, ch])).values()
      );
      
      return {
        subject,
        totalChapters: uniqueChapters.length,
        chapters: uniqueChapters.map(ch => ({
          number: ch.chapterNumber,
          name: ch.chapterName,
        })),
        documentsFound: true,
      };
    }

    // Fallback: Query FastAPI/Pinecone
    try {
      const response = await axios.get(
        `${this.fastApiUrl}/documents/chapters`,
        {
          params: { user_id: userId, subject },
        }
      );
      
      return response.data;
    } catch (error) {
      return {
        subject,
        totalChapters: 0,
        chapters: [],
        documentsFound: false,
      };
    }
  }
}
