import { PastPapersService } from './past-papers.service';
export declare class PastPapersController {
    private readonly pastPapersService;
    constructor(pastPapersService: PastPapersService);
    uploadPastPaper(req: any, file: Express.Multer.File, metadata: any): Promise<{
        success: boolean;
        pastPaperId: string;
        message: string;
    }>;
    getUserPastPapers(req: any): Promise<{
        success: boolean;
        pastPapers: {
            id: string;
            createdAt: Date;
            userId: string;
            year: number;
            fileName: string;
            fileUrl: string;
            fileSize: number;
            subject: string;
            processed: boolean;
            examType: string;
            class: string;
            board: string;
        }[];
    }>;
    getPatterns(req: any, body: any): Promise<any>;
    deletePastPaper(req: any, id: string): Promise<{
        message: string;
        success: boolean;
    }>;
}
