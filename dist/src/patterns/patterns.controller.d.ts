import { PatternsService } from './patterns.service';
import { CreatePatternDto } from './dto/create-pattern.dto';
import { UpdatePatternDto } from './dto/update-pattern.dto';
export declare class PatternsController {
    private readonly patternsService;
    constructor(patternsService: PatternsService);
    createPattern(req: any, createPatternDto: CreatePatternDto): Promise<{
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
    getUserPatterns(req: any): Promise<{
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
    getPatternStats(req: any): Promise<{
        totalPatterns: number;
        mostUsed: string;
        avgMarks: number;
        avgDuration: string;
    }>;
    getPattern(req: any, id: string): Promise<{
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
    updatePattern(req: any, id: string, updatePatternDto: UpdatePatternDto): Promise<{
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
    deletePattern(req: any, id: string): Promise<{
        message: string;
    }>;
    markPatternAsUsed(req: any, id: string): Promise<{
        message: string;
    }>;
    createPatternWithAI(req: any, body: {
        prompt: string;
    }): Promise<any>;
    listTemplates(board?: string, subject?: string, verified?: string): Promise<{
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
    correctTemplate(req: any, id: string, body: {
        name: string;
        subject: string;
        totalMarks: number;
        duration: number;
        sections: any[];
        reason?: string;
    }): Promise<any>;
}
