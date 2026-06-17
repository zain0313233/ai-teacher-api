import { PastPapersService } from './past-papers.service';
export declare class PastPapersController {
    private readonly pastPapersService;
    constructor(pastPapersService: PastPapersService);
    uploadPastPaper(req: any, file: Express.Multer.File, metadata: any): Promise<{
        success: boolean;
        pastPaperId: string;
        message: string;
    }>;
    getPatternCoverage(req: any, subject: string, chapters?: string, mode?: string): Promise<{
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
    getUserPastPapers(req: any): Promise<{
        success: boolean;
        pastPapers: {
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
            extractionDraft: import("@prisma/client/runtime/client").JsonValue | null;
            questionCount: number | null;
        }[];
    }>;
    getPatterns(req: any, body: any): Promise<any>;
    getExtraction(req: any, id: string): Promise<{
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
    triggerExtract(req: any, id: string, method?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    approvePastPaper(req: any, id: string): Promise<any>;
    rejectPastPaper(req: any, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    deletePastPaper(req: any, id: string): Promise<{
        message: string;
        success: boolean;
    }>;
}
