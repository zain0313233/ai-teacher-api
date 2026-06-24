import { ExamAssistantService } from './exam-assistant.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class ExamAssistantController {
    private readonly examAssistantService;
    private readonly prisma;
    constructor(examAssistantService: ExamAssistantService, prisma: PrismaService);
    private buildProfileContext;
    prepare(req: any, body: {
        message: string;
        context?: any;
    }): Promise<any>;
    chat(req: any, body: {
        message: string;
        context?: any;
    }): Promise<import("./exam-assistant.service").ChatResponse>;
    getHistory(req: any): Promise<any>;
    clearHistory(req: any): Promise<any>;
    health(): Promise<any>;
}
