export type TopicWeaknessRow = {
    topic: string;
    subject: string;
    chapterLabel: string;
    wrongCount: number;
    totalAnswered: number;
    accuracy: number;
};
export declare function getBoardBenchmarkTarget(board?: string | null): number;
export declare function classifyStrength(avgScore: number): 'strong' | 'moderate' | 'weak';
export declare function buildBenchmarkMessage(classAvg: number | null, benchmark: number, subject: string): string;
type AnswerRow = {
    questionId: string;
    isCorrect: boolean | null;
    attempt: {
        quizSession: {
            subject: string;
            chapterStart: number | null;
            chapterEnd: number | null;
        };
    };
};
type QuestionMeta = {
    id: string;
    topicTag: string | null;
    concept: string | null;
};
export declare function aggregateTopicWeakness(answers: AnswerRow[], questionMap: Map<string, QuestionMeta>, limit?: number): TopicWeaknessRow[];
export {};
