export interface StudentContext {
    education_level?: string;
    class_grade?: string;
    group?: string;
    board?: string;
    subjects?: string[];
    target_exam?: string;
}
export interface ChatRequest {
    userId: string;
    message: string;
    context?: {
        subject?: string;
        class?: string;
        examType?: string;
        year?: number;
    };
    studentContext?: StudentContext | null;
}
export interface ChatResponse {
    success: boolean;
    data: {
        results?: any[];
        total_results?: number;
        query?: string;
        exam_preview?: any;
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
    private readonly fastApiUrl;
    chat(chatRequest: ChatRequest): Promise<ChatResponse>;
    getConversationHistory(userId: string): Promise<any>;
    clearConversationHistory(userId: string): Promise<any>;
    healthCheck(): Promise<any>;
}
