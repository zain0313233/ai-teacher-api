import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

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

    metadata: {

      subject?: string;

      level?: string;

      class?: string;

      educationSystem?: string;

      documentType?: string;

      isOfficial?: boolean;

      chapterMetadata?: { chapterNumber: number; chapterName: string };

    },

  ) {

    // Determine upload mode

    const uploadMode = metadata.chapterMetadata ? 'chapter' : 'fullbook';

    

    // Step 1: Save document to database immediately

    const document = await this.prisma.document.create({

      data: {

        userId,

        fileName,

        fileType,

        fileUrl,

        fileSize,

        subject: metadata.subject,

        level: metadata.level || 'matric',

        class: metadata.class,

        educationSystem: metadata.educationSystem || 'punjab_board',

        documentType: metadata.documentType || 'textbook',

        isOfficial: metadata.isOfficial ?? false,

        uploadMode,

        chapterNumber: metadata.chapterMetadata?.chapterNumber,

        chapterName: metadata.chapterMetadata?.chapterName,

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

      metadata,

      uploadMode,

    );



    return document;

  }



  private async processDocumentAsync(

    documentId: string,

    fileUrl: string,

    fileType: string,

    userId: string,

    metadata: {

      subject?: string;

      level?: string;

      class?: string;

      educationSystem?: string;

      documentType?: string;

      isOfficial?: boolean;

      chapterMetadata?: { chapterNumber: number; chapterName: string };

    },

    uploadMode?: string,

  ) {

    try {

      const payload: any = {

        document_id: documentId,

        file_url: fileUrl,

        file_type: fileType,

        user_id: userId,

        subject: metadata.subject,

        level: metadata.level,

        class_level: metadata.class,

        education_system: metadata.educationSystem,

        document_type: metadata.documentType,

        upload_mode: uploadMode,

        is_official: metadata.isOfficial ?? false,

      };



      // Add chapter metadata if available

      if (metadata.chapterMetadata) {

        payload.chapter_number = metadata.chapterMetadata.chapterNumber;

        payload.chapter_name = metadata.chapterMetadata.chapterName;

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

      if (uploadMode === 'chapter' && metadata.chapterMetadata) {

        await this.prisma.chapter.upsert({

          where: {

            documentId_chapterNumber: {

              documentId,

              chapterNumber: metadata.chapterMetadata.chapterNumber,

            },

          },

          create: {

            documentId,

            chapterNumber: metadata.chapterMetadata.chapterNumber,

            chapterName: metadata.chapterMetadata.chapterName,

            startPosition: 0,

            endPosition: 0,

          },

          update: {

            chapterName: metadata.chapterMetadata.chapterName,

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

  async getOfficialLibrary(filters: {
    subject?: string;
    board?: string;
    language?: string;
    search?: string;
  }) {
    const where: Record<string, unknown> = {
      isOfficial: true,
      processed: true,
      verified: true,
    };

    if (filters.subject?.trim()) {
      where.subject = { equals: filters.subject.trim(), mode: 'insensitive' };
    }
    if (filters.board?.trim()) {
      where.board = { contains: filters.board.trim(), mode: 'insensitive' };
    }
    if (filters.language?.trim()) {
      where.language = filters.language.trim();
    }
    if (filters.search?.trim()) {
      const term = filters.search.trim();
      where.OR = [
        { fileName: { contains: term, mode: 'insensitive' } },
        { chapterName: { contains: term, mode: 'insensitive' } },
        { subject: { contains: term, mode: 'insensitive' } },
      ];
    }

    const documents = await this.prisma.document.findMany({
      where,
      orderBy: [{ subject: 'asc' }, { uploadDate: 'desc' }],
      select: {
        id: true,
        fileName: true,
        subject: true,
        board: true,
        class: true,
        level: true,
        language: true,
        documentType: true,
        chapterNumber: true,
        chapterName: true,
        uploadDate: true,
        year: true,
        educationSystem: true,
      },
    });

    return { success: true, documents, count: documents.length };
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



    await this.deletePineconeVectors(documentId);

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

  /** Remove all Pinecone vectors for a document (used before reprocess or delete). */
  async deletePineconeVectors(documentId: string): Promise<void> {
    try {
      await axios.delete(`${this.fastApiUrl}/documents/${documentId}`);
    } catch (error) {
      console.error('Pinecone deletion error:', error.message);
    }
  }

  /**
   * Re-run AI processing from the existing Supabase file (no re-upload).
   * Clears old vectors, then chunks + embeds again with current metadata (e.g. class_level).
   */
  async reprocessDocument(
    documentId: string,
    options?: { userId?: string; asAdmin?: boolean },
  ) {
    const where: { id: string; userId?: string; isOfficial?: boolean } = {
      id: documentId,
    };
    if (options?.asAdmin) {
      where.isOfficial = true;
    } else if (options?.userId) {
      where.userId = options.userId;
    } else {
      throw new BadRequestException('userId or asAdmin is required');
    }

    const document = await this.prisma.document.findFirst({ where });
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    if (!document.fileUrl?.trim()) {
      throw new BadRequestException('Document has no file URL — re-upload the PDF instead');
    }

    await this.deletePineconeVectors(documentId);

    await this.prisma.document.update({
      where: { id: documentId },
      data: { processed: false },
    });

    const uploadMode =
      document.uploadMode === 'chapter' ? 'chapter' : document.uploadMode || 'fullbook';
    const chapterMetadata =
      document.chapterNumber != null && document.chapterName
        ? {
            chapterNumber: document.chapterNumber,
            chapterName: document.chapterName,
          }
        : undefined;

    this.processDocumentAsync(
      document.id,
      document.fileUrl,
      document.fileType,
      document.userId,
      {
        subject: document.subject ?? undefined,
        level: document.level ?? undefined,
        class: document.class ?? undefined,
        educationSystem: document.educationSystem ?? undefined,
        documentType: document.documentType ?? undefined,
        isOfficial: document.isOfficial,
        chapterMetadata,
      },
      uploadMode,
    );

    return {
      success: true,
      message:
        'Reprocessing started. The file in storage will be re-indexed (watch AI engine logs).',
      document: {
        id: document.id,
        fileName: document.fileName,
        processed: false,
      },
    };
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



  private formatChaptersResponse(
    subject: string,
    chapters: Array<{ number: number; name: string }>,
  ) {
    return {
      subject,
      totalChapters: chapters.length,
      chapters,
      documentsFound: chapters.length > 0,
    };
  }

  private normalizeChapterEntry(raw: Record<string, unknown>): { number: number; name: string } | null {
    const number = raw.number ?? raw.chapterNumber ?? raw.chapter_number;
    const name = raw.name ?? raw.chapterName ?? raw.chapter_name;
    if (number == null || name == null || String(name).trim() === '') {
      return null;
    }
    const chapterNumber = typeof number === 'number' ? number : parseInt(String(number), 10);
    if (Number.isNaN(chapterNumber)) {
      return null;
    }
    return { number: chapterNumber, name: String(name).trim() };
  }

  private mergeChapters(
    ...groups: Array<Array<{ number: number; name: string }>>
  ): Array<{ number: number; name: string }> {
    const byNumber = new Map<number, { number: number; name: string }>();
    for (const group of groups) {
      for (const ch of group) {
        byNumber.set(ch.number, ch);
      }
    }
    return Array.from(byNumber.values()).sort((a, b) => a.number - b.number);
  }

  private collectChaptersFromDocuments(
    documents: Array<{
      chapterNumber: number | null;
      chapterName: string | null;
      chapters: Array<{ chapterNumber: number; chapterName: string }>;
    }>,
  ): Array<{ number: number; name: string }> {
    const collected: Array<{ number: number; name: string }> = [];

    for (const doc of documents) {
      for (const ch of doc.chapters) {
        collected.push({ number: ch.chapterNumber, name: ch.chapterName });
      }
      if (doc.chapterNumber != null && doc.chapterName?.trim()) {
        collected.push({ number: doc.chapterNumber, name: doc.chapterName.trim() });
      }
    }

    return this.mergeChapters(collected);
  }

  async getChaptersBySubject(userId: string, subject: string) {
    const trimmedSubject = subject.trim();
    if (!trimmedSubject) {
      return this.formatChaptersResponse(subject, []);
    }

  // Get documents from:
  // 1. User's own documents
  // 2. Official documents (uploaded by admin with isOfficial: true)
    const documents = await this.prisma.document.findMany({
      where: {
        AND: [
          {
            OR: [{ userId }, { isOfficial: true }],
          },
          {
            subject: { equals: trimmedSubject, mode: 'insensitive' },
          },
          { processed: true },
        ],
      },
      include: {
        chapters: {
          orderBy: { chapterNumber: 'asc' },
        },
      },
    });

    const dbChapters = this.collectChaptersFromDocuments(documents);

    let pineconeChapters: Array<{ number: number; name: string }> = [];
    try {
      const response = await axios.get(`${this.fastApiUrl}/documents/chapters`, {
        params: { user_id: userId, subject: trimmedSubject },
      });
      const rawChapters = Array.isArray(response.data?.chapters) ? response.data.chapters : [];
      pineconeChapters = rawChapters
        .map((ch: Record<string, unknown>) => this.normalizeChapterEntry(ch))
        .filter(Boolean) as Array<{ number: number; name: string }>;
    } catch {
      /* Pinecone optional when DB has chapters */
    }

    const merged = this.mergeChapters(dbChapters, pineconeChapters);
    return this.formatChaptersResponse(trimmedSubject, merged);
  }

}

