import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../documents/supabase.service';
import { GenerateExamDto } from './dto/generate-exam.dto';
export declare class ExamsService {
    private prisma;
    private supabaseService;
    private readonly fastApiUrl;
    constructor(prisma: PrismaService, supabaseService: SupabaseService);
    generateExam(_userId: string, _generateExamDto: GenerateExamDto): Promise<void>;
    getUserExams(userId: string): Promise<{
        id: string;
        userId: string;
        subject: string;
        class: string;
        section: string;
        examType: string;
        chapterStart: number | null;
        chapterEnd: number | null;
        patternId: string | null;
        topics: string[];
        examContent: import("@prisma/client/runtime/client").JsonValue;
        fileUrls: string[];
        createdAt: Date;
    }[]>;
    getExamById(examId: string, userId: string): Promise<{
        id: string;
        userId: string;
        subject: string;
        class: string;
        section: string;
        examType: string;
        chapterStart: number | null;
        chapterEnd: number | null;
        patternId: string | null;
        topics: string[];
        examContent: import("@prisma/client/runtime/client").JsonValue;
        fileUrls: string[];
        createdAt: Date;
    }>;
    deleteExam(examId: string, userId: string): Promise<{
        message: string;
    }>;
    generateExamWithDocuments(userId: string, examData: any): Promise<{
        examId: string;
        fileBuffer: Buffer<any>;
        contentType: any;
        fileName: string;
    }>;
    private extractFileName;
    private buildExamFileName;
}
