import { PatternsService } from './patterns.service';
export declare class PatternsInternalController {
    private readonly patternsService;
    constructor(patternsService: PatternsService);
    resolveForGeneration(userId: string, subject: string, patternId?: string, board?: string, classLevel?: string): Promise<{
        name: string;
        subject: string;
        totalMarks: number;
        duration: number;
        sections: unknown;
        instructions: string;
    }>;
}
