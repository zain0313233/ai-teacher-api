export declare class GenerateExamDto {
    subject: string;
    examType: string;
    topics: string[];
    structure: {
        mcqs?: number;
        shortQuestions?: number;
        longQuestions?: number;
    };
}
