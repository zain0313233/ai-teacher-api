export declare class CreateAssignmentDto {
    title: string;
    subject: string;
    chapterStart: number;
    chapterEnd: number;
    patternId?: string;
    questionCount?: number;
    mode?: string;
    quizType?: string;
    instructions?: string;
    assignmentMode?: string;
    durationMinutes?: number;
    dueAt?: string;
    publishAt?: string;
    allowReviewAfterSubmit?: boolean;
    proctoringEnabled?: boolean;
    source?: 'ai' | 'bank';
    bankItemIds?: string[];
}
