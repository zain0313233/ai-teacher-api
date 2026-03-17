import { DocumentsService } from './documents.service';
import { SupabaseService } from './supabase.service';
export declare class DocumentsController {
    private readonly documentsService;
    private readonly supabaseService;
    constructor(documentsService: DocumentsService, supabaseService: SupabaseService);
    uploadDocument(req: any, file: Express.Multer.File, body: any): Promise<{
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
    getChapters(req: any, subject: string): Promise<any>;
    getUserDocuments(req: any): Promise<{
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
    getDocument(req: any, id: string): Promise<{
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
    getDocumentStatus(req: any, id: string): Promise<{
        id: string;
        fileName: string;
        processed: boolean;
        status: string;
    }>;
    deleteDocument(req: any, id: string): Promise<{
        message: string;
    }>;
}
