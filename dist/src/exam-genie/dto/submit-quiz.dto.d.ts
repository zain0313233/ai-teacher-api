declare class QuizAnswerDto {
    questionId: string;
    selectedOption: string;
}
export declare class SubmitQuizDto {
    answers: QuizAnswerDto[];
    autoSubmitted?: boolean;
}
export {};
