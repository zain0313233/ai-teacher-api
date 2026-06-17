export declare class CreateQuestionBankItemDto {
    questionText: string;
    questionType?: string;
    options?: Record<string, string>;
    correctOption: string;
    topicTag?: string;
    concept?: string;
    difficulty?: string;
    explanation?: string;
}
export declare class UpdateQuestionBankItemDto {
    questionText?: string;
    questionType?: string;
    options?: Record<string, string>;
    correctOption?: string;
    topicTag?: string;
    concept?: string;
    difficulty?: string;
    explanation?: string;
}
