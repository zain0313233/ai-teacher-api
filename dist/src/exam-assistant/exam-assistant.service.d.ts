export interface ChatRequest {
    userId: string;
    message: string;
    context?: {
        subject?: string;
        class?: string;
        examType?: string;
        year?: number;
    };
}
export interface ChatResponse {
    success: boolean;
    data: {
        results?: any[];
        total_results?: number;
        query?: string;
    };
    message: string;
    tool_used: string;
    next_suggestions: string[];
}
export declare class ExamAssistantService {
    private readonly fastApiUrl;
    chat(chatRequest: ChatRequest): Promise<ChatResponse>;
    getConversationHistory(userId: string): Promise<any>;
    clearConversationHistory(userId: string): Promise<any>;
    healthCheck(): Promise<any>;
}
