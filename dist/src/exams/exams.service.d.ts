import { PrismaService } from '../prisma/prisma.service';
import { GenerateExamDto } from './dto/generate-exam.dto';
export declare class ExamsService {
    private prisma;
    private readonly fastApiUrl;
    constructor(prisma: PrismaService);
    generateExam(_userId: string, _generateExamDto: GenerateExamDto): Promise<void>;
    getUserExams(userId: string): Promise<{
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
        patternId: string | null;
        examContent: import("@prisma/client/runtime/client").JsonValue;
        fileUrls: string[];
    }[]>;
    getExamById(examId: string, userId: string): Promise<{
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
        patternId: string | null;
        examContent: import("@prisma/client/runtime/client").JsonValue;
        fileUrls: string[];
    }>;
    deleteExam(examId: string, userId: string): Promise<{
        message: string;
    }>;
    generateExamWithDocuments(userId: string, examData: any): Promise<{
        examId: string;
        fileBuffer: any;
        contentType: any;
        fileName: string;
    }>;
    private extractFileName;
    private buildExamFileName;
}
