import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    uploadOfficialContent(file: Express.Multer.File, body: any, req: any): Promise<{
        success: boolean;
        message: string;
        document: {
            id: string;
            board: string | null;
            userId: string;
            year: number | null;
            documentType: string;
            educationSystem: string;
            level: string;
            class: string | null;
            subject: string | null;
            examType: string | null;
            language: string;
            fileName: string;
            fileType: string;
            fileUrl: string;
            fileSize: number;
            uploadMode: string;
            chapterNumber: number | null;
            chapterName: string | null;
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
        };
        uploadInfo: {
            uploadMode: any;
            chapterNumber: number | null;
            chapterName: any;
        };
    }>;
    getAllUsers(role: string, search: string, req: any): Promise<{
        success: boolean;
        users: {
            name: string;
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
            plan: import("@prisma/client").$Enums.PlanType;
            isVerified: boolean;
            createdAt: Date;
            _count: {
                documents: number;
                exams: number;
            };
        }[];
        total: number;
    }>;
    updateUserRole(userId: string, role: string, req: any): Promise<{
        success: boolean;
        message: string;
        user: {
            name: string;
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
    }>;
    deleteUser(userId: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getPendingContent(req: any): Promise<{
        success: boolean;
        documents: ({
            user: {
                name: string;
                id: string;
                email: string;
                role: import("@prisma/client").$Enums.UserRole;
            };
        } & {
            id: string;
            board: string | null;
            userId: string;
            year: number | null;
            documentType: string;
            educationSystem: string;
            level: string;
            class: string | null;
            subject: string | null;
            examType: string | null;
            language: string;
            fileName: string;
            fileType: string;
            fileUrl: string;
            fileSize: number;
            uploadMode: string;
            chapterNumber: number | null;
            chapterName: string | null;
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
        })[];
        total: number;
    }>;
    approveContent(documentId: string, req: any): Promise<{
        success: boolean;
        message: string;
        document: {
            id: string;
            board: string | null;
            userId: string;
            year: number | null;
            documentType: string;
            educationSystem: string;
            level: string;
            class: string | null;
            subject: string | null;
            examType: string | null;
            language: string;
            fileName: string;
            fileType: string;
            fileUrl: string;
            fileSize: number;
            uploadMode: string;
            chapterNumber: number | null;
            chapterName: string | null;
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
        };
    }>;
    rejectContent(documentId: string, req: any): Promise<{
        success: boolean;
        message: string;
        document: {
            id: string;
            board: string | null;
            userId: string;
            year: number | null;
            documentType: string;
            educationSystem: string;
            level: string;
            class: string | null;
            subject: string | null;
            examType: string | null;
            language: string;
            fileName: string;
            fileType: string;
            fileUrl: string;
            fileSize: number;
            uploadMode: string;
            chapterNumber: number | null;
            chapterName: string | null;
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
        };
    }>;
    getSystemStats(req: any): Promise<{
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
    getSettings(req: any): Promise<{
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
    updateSettings(settings: any, req: any): Promise<{
        success: boolean;
        message: string;
        settings: any;
    }>;
    getOfficialContent(subject: string, documentType: string, search: string, req: any): Promise<{
        success: boolean;
        documents: ({
            chapters: {
                id: string;
                createdAt: Date;
                chapterNumber: number;
                chapterName: string;
                documentId: string;
                startPosition: number;
                endPosition: number;
            }[];
            user: {
                name: string;
                id: string;
                email: string;
            };
        } & {
            id: string;
            board: string | null;
            userId: string;
            year: number | null;
            documentType: string;
            educationSystem: string;
            level: string;
            class: string | null;
            subject: string | null;
            examType: string | null;
            language: string;
            fileName: string;
            fileType: string;
            fileUrl: string;
            fileSize: number;
            uploadMode: string;
            chapterNumber: number | null;
            chapterName: string | null;
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
        })[];
        total: number;
    }>;
    reprocessOfficialContent(documentId: string, req: any): Promise<{
        success: boolean;
        message: string;
        document: {
            id: string;
            fileName: string;
            processed: boolean;
        };
    }>;
    deleteOfficialContent(documentId: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    startScraping(body: {
        subject: string;
        tier: string;
    }, req: any): Promise<{
        success: boolean;
        message: string;
        jobId: string;
        subject: string;
        tier: string;
        status: string;
        estimatedTime: string;
        note: string;
    }>;
    getScrapingJobs(req: any): Promise<{
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
    getScrapingStats(req: any): Promise<{
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
