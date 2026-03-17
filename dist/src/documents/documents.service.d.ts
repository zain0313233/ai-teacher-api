import { PrismaService } from '../prisma/prisma.service';
export declare class DocumentsService {
    private prisma;
    private readonly fastApiUrl;
    constructor(prisma: PrismaService);
    uploadDocument(userId: string, fileName: string, fileType: string, fileUrl: string, fileSize: number, subject?: string, chapterMetadata?: {
        chapterNumber: number;
        chapterName: string;
    }): Promise<{
        id: string;
        userId: string;
        fileName: string;
        fileType: string;
        fileUrl: string;
        fileSize: number;
        subject: string | null;
        uploadMode: string;
        chapterNumber: number | null;
        chapterName: string | null;
        uploadDate: Date;
        processed: boolean;
    }>;
    private processDocumentAsync;
    getUserDocuments(userId: string): Promise<{
        id: string;
        userId: string;
        fileName: string;
        fileType: string;
        fileUrl: string;
        fileSize: number;
        subject: string | null;
        uploadMode: string;
        chapterNumber: number | null;
        chapterName: string | null;
        uploadDate: Date;
        processed: boolean;
    }[]>;
    getDocumentById(documentId: string, userId: string): Promise<{
        id: string;
        userId: string;
        fileName: string;
        fileType: string;
        fileUrl: string;
        fileSize: number;
        subject: string | null;
        uploadMode: string;
        chapterNumber: number | null;
        chapterName: string | null;
        uploadDate: Date;
        processed: boolean;
    }>;
    deleteDocument(documentId: string, userId: string): Promise<{
        message: string;
    }>;
    markAsProcessed(documentId: string): Promise<void>;
    private storeChapters;
    getChaptersBySubject(userId: string, subject: string): Promise<any>;
}
