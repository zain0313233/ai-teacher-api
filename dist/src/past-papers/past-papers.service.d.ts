import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class PastPapersService {
    private prisma;
    private readonly fastApiUrl;
    constructor(prisma: PrismaService);
    uploadPastPaper(userId: string, file: Express.Multer.File, metadata: any): Promise<{
        success: boolean;
        pastPaperId: string;
        message: string;
    }>;
    private extractPastPaperAsync;
    triggerExtract(pastPaperId: string, userId: string, method?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private extractPastPaperWithMethodAsync;
    getExtraction(pastPaperId: string, userId: string): Promise<{
        success: boolean;
        pastPaper: {
            id: string;
            subject: string;
            year: number;
            class: string;
            board: string;
            examType: string;
            fileName: string;
            extractionStatus: string;
            questionCount: number | null;
            extractionMethod: string | null;
            processed: boolean;
        };
        draft: any;
        questions: any;
        summary: any;
    }>;
    approvePastPaper(pastPaperId: string, userId: string): Promise<any>;
    rejectPastPaper(pastPaperId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
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
        extractionMethod: string | null;
        extractionStatus: string;
        extractionDraft: Prisma.JsonValue | null;
        questionCount: number | null;
    }[]>;
    getPatterns(userId: string, subject: string, chapters: number[], mode?: string): Promise<any>;
    private computePatternQuality;
    private buildCoverageGuidance;
    getPatternCoverage(userId: string, subject: string, chapters: number[], mode?: string): Promise<{
        success: boolean;
        subject: string;
        chapters: number[];
        mode: string;
        patternCount: number;
        rawPatternCount: number;
        patternsFilteredByMode: boolean;
        quality: string;
        qualityLabel: string;
        qualityScore: number;
        isReadyForPrediction: boolean;
        papers: {
            total: number;
            indexed: number;
            pendingReview: number;
            extracting: number;
            failed: number;
        };
        chapterQuestions: number;
        extractionMethods: Record<string, number>;
        guidance: {
            title: string;
            message: string;
            actions: {
                label: string;
                href: string;
            }[];
        };
        recentPapers: {
            id: string;
            fileName: string;
            year: number;
            extractionStatus: string;
            extractionMethod: string | null;
            questionCount: number | null;
            indexed: boolean;
        }[];
    }>;
    deletePastPaper(pastPaperId: string, userId: string): Promise<{
        message: string;
    }>;
}
