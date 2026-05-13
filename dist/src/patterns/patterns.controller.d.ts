import { PatternsService } from './patterns.service';
import { CreatePatternDto } from './dto/create-pattern.dto';
import { UpdatePatternDto } from './dto/update-pattern.dto';
export declare class PatternsController {
    private readonly patternsService;
    constructor(patternsService: PatternsService);
    createPattern(req: any, createPatternDto: CreatePatternDto): Promise<{
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
    getUserPatterns(req: any): Promise<{
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
    getPatternStats(req: any): Promise<{
        totalPatterns: number;
        mostUsed: string;
        avgMarks: number;
        avgDuration: string;
    }>;
    getPattern(req: any, id: string): Promise<{
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
    updatePattern(req: any, id: string, updatePatternDto: UpdatePatternDto): Promise<{
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
    deletePattern(req: any, id: string): Promise<{
        message: string;
    }>;
    markPatternAsUsed(req: any, id: string): Promise<{
        message: string;
    }>;
    createPatternWithAI(req: any, body: {
        prompt: string;
    }): Promise<any>;
}
