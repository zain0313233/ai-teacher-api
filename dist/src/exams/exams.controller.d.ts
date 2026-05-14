import type { Response } from 'express';
import { ExamsService } from './exams.service';
import { GenerateExamDto } from './dto/generate-exam.dto';
export declare class ExamsController {
    private readonly examsService;
    constructor(examsService: ExamsService);
    generateExam(req: any, generateExamDto: GenerateExamDto): Promise<{
        success: boolean;
        exam: {
            id: string;
            createdAt: Date;
            userId: string;
            class: string;
            subject: string;
            examType: string;
            topics: string[];
            section: string;
            chapterStart: number | null;
            chapterEnd: number | null;
            examContent: import("@prisma/client/runtime/client").JsonValue;
            fileUrls: string[];
            patternId: string | null;
        };
    }>;
    generateExamWithDocuments(req: any, examData: any, res: Response): Promise<void>;
    getUserExams(req: any): Promise<{
        success: boolean;
        exams: {
            id: string;
            createdAt: Date;
            userId: string;
            class: string;
            subject: string;
            examType: string;
            topics: string[];
            section: string;
            chapterStart: number | null;
            chapterEnd: number | null;
            examContent: import("@prisma/client/runtime/client").JsonValue;
            fileUrls: string[];
            patternId: string | null;
        }[];
    }>;
    getExam(req: any, id: string): Promise<{
        success: boolean;
        exam: {
            id: string;
            createdAt: Date;
            userId: string;
            class: string;
            subject: string;
            examType: string;
            topics: string[];
            section: string;
            chapterStart: number | null;
            chapterEnd: number | null;
            examContent: import("@prisma/client/runtime/client").JsonValue;
            fileUrls: string[];
            patternId: string | null;
        };
    }>;
    deleteExam(req: any, id: string): Promise<{
        message: string;
        success: boolean;
    }>;
}
