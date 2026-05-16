import { ExamAssistantService } from './exam-assistant.service';
export declare class ExamAssistantController {
    private readonly examAssistantService;
    constructor(examAssistantService: ExamAssistantService);
    chat(req: any, body: {
        message: string;
        context?: any;
    }): Promise<import("./exam-assistant.service").ChatResponse>;
    getHistory(req: any): Promise<any>;
    clearHistory(req: any): Promise<any>;
    health(): Promise<any>;
}
