import { ExamsService } from '../exams/exams.service';
export interface StudentContext {
    education_level?: string;
    class_grade?: string;
    classes_taught?: string[];
    group?: string;
    board?: string;
    subjects?: string[];
    target_exam?: string;
    learning_level?: number;
}
export interface ChatContext {
    subject?: string;
    class?: string;
    examType?: string;
    exam_type?: string;
    patternId?: string;
    section?: string;
    chapterStart?: number | null;
    chapterEnd?: number | null;
    topics?: string[];
    board?: string;
    confirmed?: boolean;
}
export interface ChatRequest {
    userId: string;
    message: string;
    context?: ChatContext;
    studentContext?: StudentContext | null;
}
export interface ChatResponse {
    success: boolean;
    data: {
        results?: any[];
        total_results?: number;
        query?: string;
        exam_preview?: any;
        exam_id?: string;
        file_urls?: string[];
        files?: Array<{
            filename: string;
            data: string;
            size: number;
        }>;
        download_ready?: boolean;
    };
    message: string;
    response?: string;
    tool_used: string;
    next_suggestions: string[];
    suggestions?: string[];
}
export declare class ExamAssistantService {
    private readonly examsService;
    private readonly fastApiUrl;
    constructor(examsService: ExamsService);
    private normalizeContext;
    private persistAssistantExamIfNeeded;
    prepareExamGeneration(chatRequest: {
        userId: string;
        message: string;
        context?: ChatContext;
        studentContext?: StudentContext | null;
    }): Promise<any>;
    chat(chatRequest: ChatRequest): Promise<ChatResponse>;
    getConversationHistory(userId: string): Promise<any>;
    clearConversationHistory(userId: string): Promise<any>;
    healthCheck(): Promise<any>;
}
