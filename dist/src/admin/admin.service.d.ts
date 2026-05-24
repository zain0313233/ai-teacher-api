import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../documents/supabase.service';
import { DocumentsService } from '../documents/documents.service';
export declare class AdminService {
    private prisma;
    private supabaseService;
    private documentsService;
    private readonly fastApiUrl;
    constructor(prisma: PrismaService, supabaseService: SupabaseService, documentsService: DocumentsService);
    uploadOfficialContent(file: Express.Multer.File, metadata: any, adminId: string): Promise<{
        success: boolean;
        message: string;
        document: {
            uploadMode: string;
            subject: string | null;
            level: string;
            class: string | null;
            educationSystem: string;
            documentType: string;
            chapterNumber: number | null;
            chapterName: string | null;
            id: string;
            year: number | null;
            board: string | null;
            examType: string | null;
            language: string;
            fileName: string;
            fileType: string;
            fileUrl: string;
            fileSize: number;
            processed: boolean;
            extractionMethod: string | null;
            extractionQuality: number | null;
            verified: boolean;
            isOfficial: boolean;
            contentTier: string;
            topic: string | null;
            concept: string | null;
            difficulty: string | null;
            sourceUrl: string | null;
            sourceDomain: string | null;
            trustScore: number;
            examRelevance: string | null;
            realWorldApp: boolean;
            interactive: boolean;
            uploadDate: Date;
            userId: string;
        };
        uploadInfo: {
            uploadMode: any;
            chapterNumber: number | null;
            chapterName: any;
        };
    }>;
    private processDocumentAsync;
    private storeChapters;
    getAllUsers(role?: string, search?: string): Promise<{
        success: boolean;
        users: {
            id: string;
            name: string;
            _count: {
                documents: number;
                exams: number;
            };
            createdAt: Date;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
            plan: import("@prisma/client").$Enums.PlanType;
            isVerified: boolean;
        }[];
        total: number;
    }>;
    updateUserRole(userId: string, newRole: string): Promise<{
        success: boolean;
        message: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
    }>;
    deleteUser(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getPendingContent(): Promise<{
        success: boolean;
        documents: ({
            user: {
                id: string;
                name: string;
                email: string;
                role: import("@prisma/client").$Enums.UserRole;
            };
        } & {
            uploadMode: string;
            subject: string | null;
            level: string;
            class: string | null;
            educationSystem: string;
            documentType: string;
            chapterNumber: number | null;
            chapterName: string | null;
            id: string;
            year: number | null;
            board: string | null;
            examType: string | null;
            language: string;
            fileName: string;
            fileType: string;
            fileUrl: string;
            fileSize: number;
            processed: boolean;
            extractionMethod: string | null;
            extractionQuality: number | null;
            verified: boolean;
            isOfficial: boolean;
            contentTier: string;
            topic: string | null;
            concept: string | null;
            difficulty: string | null;
            sourceUrl: string | null;
            sourceDomain: string | null;
            trustScore: number;
            examRelevance: string | null;
            realWorldApp: boolean;
            interactive: boolean;
            uploadDate: Date;
            userId: string;
        })[];
        total: number;
    }>;
    approveContent(documentId: string): Promise<{
        success: boolean;
        message: string;
        document: {
            uploadMode: string;
            subject: string | null;
            level: string;
            class: string | null;
            educationSystem: string;
            documentType: string;
            chapterNumber: number | null;
            chapterName: string | null;
            id: string;
            year: number | null;
            board: string | null;
            examType: string | null;
            language: string;
            fileName: string;
            fileType: string;
            fileUrl: string;
            fileSize: number;
            processed: boolean;
            extractionMethod: string | null;
            extractionQuality: number | null;
            verified: boolean;
            isOfficial: boolean;
            contentTier: string;
            topic: string | null;
            concept: string | null;
            difficulty: string | null;
            sourceUrl: string | null;
            sourceDomain: string | null;
            trustScore: number;
            examRelevance: string | null;
            realWorldApp: boolean;
            interactive: boolean;
            uploadDate: Date;
            userId: string;
        };
    }>;
    rejectContent(documentId: string): Promise<{
        success: boolean;
        message: string;
        document: {
            uploadMode: string;
            subject: string | null;
            level: string;
            class: string | null;
            educationSystem: string;
            documentType: string;
            chapterNumber: number | null;
            chapterName: string | null;
            id: string;
            year: number | null;
            board: string | null;
            examType: string | null;
            language: string;
            fileName: string;
            fileType: string;
            fileUrl: string;
            fileSize: number;
            processed: boolean;
            extractionMethod: string | null;
            extractionQuality: number | null;
            verified: boolean;
            isOfficial: boolean;
            contentTier: string;
            topic: string | null;
            concept: string | null;
            difficulty: string | null;
            sourceUrl: string | null;
            sourceDomain: string | null;
            trustScore: number;
            examRelevance: string | null;
            realWorldApp: boolean;
            interactive: boolean;
            uploadDate: Date;
            userId: string;
        };
    }>;
    getSystemStats(): Promise<{
        success: boolean;
        stats: {
            users: {
                total: number;
                students: number;
                teachers: number;
                admins: number;
            };
            documents: {
                total: number;
                verified: number;
                pending: number;
                processed: number;
                processing: number;
            };
            exams: {
                total: number;
            };
        };
    }>;
    getSettings(): Promise<{
        success: boolean;
        settings: {
            boards: {
                id: string;
                name: string;
                code: string;
                active: boolean;
            }[];
            subjects: {
                id: string;
                name: string;
                code: string;
                active: boolean;
            }[];
            systemConfig: {
                maxUploadSize: number;
                allowedFileTypes: string[];
                enableOCR: boolean;
                enableVisionModel: boolean;
                defaultLanguage: string;
            };
        };
    }>;
    updateSettings(settings: any): Promise<{
        success: boolean;
        message: string;
        settings: any;
    }>;
    getOfficialContent(filters: {
        subject?: string;
        documentType?: string;
        search?: string;
    }): Promise<{
        success: boolean;
        documents: ({
            user: {
                id: string;
                name: string;
                email: string;
            };
            chapters: {
                chapterNumber: number;
                chapterName: string;
                id: string;
                documentId: string;
                startPosition: number;
                endPosition: number;
                createdAt: Date;
            }[];
        } & {
            uploadMode: string;
            subject: string | null;
            level: string;
            class: string | null;
            educationSystem: string;
            documentType: string;
            chapterNumber: number | null;
            chapterName: string | null;
            id: string;
            year: number | null;
            board: string | null;
            examType: string | null;
            language: string;
            fileName: string;
            fileType: string;
            fileUrl: string;
            fileSize: number;
            processed: boolean;
            extractionMethod: string | null;
            extractionQuality: number | null;
            verified: boolean;
            isOfficial: boolean;
            contentTier: string;
            topic: string | null;
            concept: string | null;
            difficulty: string | null;
            sourceUrl: string | null;
            sourceDomain: string | null;
            trustScore: number;
            examRelevance: string | null;
            realWorldApp: boolean;
            interactive: boolean;
            uploadDate: Date;
            userId: string;
        })[];
        total: number;
    }>;
    reprocessOfficialContent(documentId: string): Promise<{
        success: boolean;
        message: string;
        document: {
            id: string;
            fileName: string;
            processed: boolean;
        };
    }>;
    deleteOfficialContent(documentId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    startScraping(subject: string, tier: string): Promise<{
        success: boolean;
        message: string;
        jobId: string;
        subject: string;
        tier: string;
        status: string;
        estimatedTime: string;
        note: string;
    }>;
    getScrapingJobs(): Promise<{
        success: boolean;
        jobs: {
            id: string;
            subject: string;
            tier: string;
            source: string;
            status: string;
            itemsScraped: number;
            startedAt: string;
            completedAt: string;
        }[];
    }>;
    getScrapingStats(): Promise<{
        success: boolean;
        stats: {
            totalScraped: number;
            conceptual: number;
            research: number;
            avgTrustScore: number;
            lastUpdate: string;
        };
    }>;
}
