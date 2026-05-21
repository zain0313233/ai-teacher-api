import { PrismaService } from '../prisma/prisma.service';
export declare class PastPapersService {
    private prisma;
    private readonly fastApiUrl;
    constructor(prisma: PrismaService);
    uploadPastPaper(userId: string, file: Express.Multer.File, metadata: any): Promise<{
        success: boolean;
        pastPaperId: string;
        message: string;
    }>;
    private processPastPaperAsync;
    getUserPastPapers(userId: string): Promise<{
        id: string;
        createdAt: Date;
        board: string;
        userId: string;
        year: number;
        class: string;
        subject: string;
        examType: string;
        fileName: string;
        fileUrl: string;
        fileSize: number;
        processed: boolean;
    }[]>;
    getPatterns(userId: string, subject: string, chapters: number[], mode?: string): Promise<any>;
    deletePastPaper(pastPaperId: string, userId: string): Promise<{
        message: string;
    }>;
}
