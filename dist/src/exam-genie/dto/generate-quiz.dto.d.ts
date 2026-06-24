export declare class GenerateQuizDto {
    subject: string;
    chapterStart: number;
    chapterEnd: number;
    quizType?: string;
    questionCount?: number;
    mode?: string;
    sourceDocumentIds?: string[];
    sourcePastPaperIds?: string[];
    patternId?: string;
}
