import { PrismaService } from '../prisma/prisma.service';
import { CreatePatternDto } from './dto/create-pattern.dto';
import { UpdatePatternDto } from './dto/update-pattern.dto';
interface PatternSection {
    name: string;
    questionType: 'MCQ' | 'Short Answer' | 'Long Answer' | 'Case Study' | 'Practical' | 'Essay' | 'Numerical';
    numberOfQuestions: number;
    questionsToAttempt: number;
    marksPerQuestion: number;
    notes?: string;
}
interface PatternData {
    name: string;
    subject: string;
    totalMarks: number;
    duration: number;
    sections: PatternSection[];
}
export declare class PatternsService {
    private prisma;
    private groqClient;
    private tavilyClient;
    constructor(prisma: PrismaService);
    createPattern(userId: string, createPatternDto: CreatePatternDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        subject: string;
        totalMarks: number;
        duration: number;
        sections: import("@prisma/client/runtime/client").JsonValue;
        lastUsed: Date | null;
    }>;
    getUserPatterns(userId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        subject: string;
        totalMarks: number;
        duration: number;
        sections: import("@prisma/client/runtime/client").JsonValue;
        lastUsed: Date | null;
    }[]>;
    getPatternById(patternId: string, userId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        subject: string;
        totalMarks: number;
        duration: number;
        sections: import("@prisma/client/runtime/client").JsonValue;
        lastUsed: Date | null;
    }>;
    normalizeBoardForPecta(board?: string | null): string | null;
    resolvePatternForGeneration(userId: string, subject: string, patternId?: string, board?: string | null, classLevel?: string | null): Promise<{
        name: string;
        subject: string;
        totalMarks: number;
        duration: number;
        sections: unknown;
        instructions: string;
    } | null>;
    private toGenerationPayload;
    updatePattern(patternId: string, userId: string, updatePatternDto: UpdatePatternDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        subject: string;
        totalMarks: number;
        duration: number;
        sections: import("@prisma/client/runtime/client").JsonValue;
        lastUsed: Date | null;
    }>;
    deletePattern(patternId: string, userId: string): Promise<{
        message: string;
    }>;
    markAsUsed(patternId: string, userId: string): Promise<void>;
    getPatternStats(userId: string): Promise<{
        totalPatterns: number;
        mostUsed: string;
        avgMarks: number;
        avgDuration: string;
    }>;
    previewPatternWithAI(userId: string, userPrompt: string): Promise<any>;
    createPatternWithAI(userId: string, userPrompt: string, save?: boolean): Promise<any>;
    private generatePatternData;
    private lookupVerifiedTemplate;
    private hardValidatePattern;
    private saveDraftTemplate;
    correctPattern(templateId: string, correctedData: PatternData, correctedBy: string, reason?: string): Promise<any>;
    listTemplates(filters?: {
        board?: string;
        subject?: string;
        isVerified?: boolean;
    }): Promise<{
        name: string;
        id: string;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
        educationLevel: string;
        board: string;
        subject: string;
        totalMarks: number;
        duration: number;
        sections: import("@prisma/client/runtime/client").JsonValue;
        lastUsed: Date | null;
        source: string;
        country: string;
        classLevel: string;
        confidence: number;
        usageCount: number;
        notes: string | null;
        createdBy: string | null;
        verifiedBy: string | null;
    }[]>;
    getTemplate(id: string): Promise<{
        name: string;
        id: string;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
        educationLevel: string;
        board: string;
        subject: string;
        totalMarks: number;
        duration: number;
        sections: import("@prisma/client/runtime/client").JsonValue;
        lastUsed: Date | null;
        source: string;
        country: string;
        classLevel: string;
        confidence: number;
        usageCount: number;
        notes: string | null;
        createdBy: string | null;
        verifiedBy: string | null;
    }>;
    private detectContext;
    private searchWebForPattern;
    private parseSearchResults;
    private recalculateMarks;
    private generateCustomPattern;
    questionCountFromSections(sections: any[]): number;
    private builtInPatternId;
    getAvailablePatternsForStudent(userId: string, subject: string): Promise<{
        success: boolean;
        patterns: {
            id: string;
            name: string;
            subject: string;
            totalMarks: number;
            duration: number;
            sections: unknown;
            source: "builtin" | "teacher";
        }[];
    }>;
    resolvePatternForStudentQuiz(userId: string, patternId: string, subject: string): Promise<{
        name: string;
        subject: string;
        totalMarks: number;
        duration: number;
        sections: unknown;
        instructions: string;
        patternId: string;
    }>;
}
export {};
