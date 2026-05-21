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
        id: string;
        name: string;
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
        id: string;
        name: string;
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
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        subject: string;
        totalMarks: number;
        duration: number;
        sections: import("@prisma/client/runtime/client").JsonValue;
        lastUsed: Date | null;
    }>;
    updatePattern(patternId: string, userId: string, updatePatternDto: UpdatePatternDto): Promise<{
        id: string;
        name: string;
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
    createPatternWithAI(userId: string, userPrompt: string): Promise<any>;
    private lookupVerifiedTemplate;
    private hardValidatePattern;
    private saveDraftTemplate;
    correctPattern(templateId: string, correctedData: PatternData, correctedBy: string, reason?: string): Promise<any>;
    listTemplates(filters?: {
        board?: string;
        subject?: string;
        isVerified?: boolean;
    }): Promise<{
        id: string;
        name: string;
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
        country: string;
        classLevel: string;
        source: string;
        confidence: number;
        usageCount: number;
        notes: string | null;
        createdBy: string | null;
        verifiedBy: string | null;
    }[]>;
    getTemplate(id: string): Promise<{
        id: string;
        name: string;
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
        country: string;
        classLevel: string;
        source: string;
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
}
export {};
