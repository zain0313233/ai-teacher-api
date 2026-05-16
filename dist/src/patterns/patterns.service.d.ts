import { PrismaService } from '../prisma/prisma.service';
import { CreatePatternDto } from './dto/create-pattern.dto';
import { UpdatePatternDto } from './dto/update-pattern.dto';
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
    private detectContext;
    private searchWebForPattern;
    private parseSearchResults;
    private validateAndCorrectPattern;
    private generateCustomPattern;
}
