import { ExamGenieService } from './exam-genie.service';
import { GenerateQuizDto } from './dto/generate-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
export declare class ExamGenieController {
    private readonly examGenieService;
    constructor(examGenieService: ExamGenieService);
    getMaterials(req: any, subject?: string): Promise<{
        success: boolean;
        documents: {
            id: string;
            documentType: string;
            subject: string | null;
            fileName: string;
            chapterNumber: number | null;
            chapterName: string | null;
            processed: boolean;
            uploadDate: Date;
        }[];
        pastPapers: {
            id: string;
            createdAt: Date;
            board: string;
            year: number;
            class: string;
            subject: string;
            fileName: string;
            processed: boolean;
            extractionMethod: string | null;
            extractionStatus: string;
            questionCount: number | null;
        }[];
        readyForQuiz: boolean;
    }>;
    getPredictions(req: any, subject: string, chapters?: string, mode?: string): Promise<{
        success: boolean;
        mode: any;
        highChanceTopics: any;
        totalPatterns: any;
        coverage: {
            success: boolean;
            subject: string;
            chapters: number[];
            mode: string;
            patternCount: number;
            rawPatternCount: number;
            patternsFilteredByMode: boolean;
            quality: string;
            qualityLabel: string;
            qualityScore: number;
            isReadyForPrediction: boolean;
            papers: {
                total: number;
                indexed: number;
                pendingReview: number;
                extracting: number;
                failed: number;
            };
            chapterQuestions: number;
            extractionMethods: Record<string, number>;
            guidance: {
                title: string;
                message: string;
                actions: {
                    label: string;
                    href: string;
                }[];
            };
            recentPapers: {
                id: string;
                fileName: string;
                year: number;
                extractionStatus: string;
                extractionMethod: string | null;
                questionCount: number | null;
                indexed: boolean;
            }[];
        };
        marksPatternHint: {
            mcq: number;
            short: number;
            long: number;
            source: string;
        };
        message: string;
    }>;
    getAvailablePatterns(req: any, subject: string): Promise<{
        success: boolean;
        patterns: {
            id: string;
            name: string;
            subject: string;
            totalMarks: number;
            duration: number;
            sections: unknown;
            source: "builtin" | "teacher";
        }[];
    }>;
    getWeakTopics(req: any, subject?: string): Promise<{
        success: boolean;
        completedAttempts: number;
        weakTopics: {
            topic: string;
            subject: string;
            chapterLabel: string;
            wrongCount: number;
            accuracy: number;
            concepts: string[];
            recommendation: string;
        }[];
        summary: string;
    }>;
    generateQuiz(req: any, dto: GenerateQuizDto): Promise<{
        success: boolean;
        quiz: {
            id: any;
            subject: any;
            board: any;
            class: any;
            chapterStart: any;
            chapterEnd: any;
            questionCount: any;
            status: any;
            mode: any;
            quizType: any;
            sourceSummary: any;
            questions: any;
        } | {
            paperPattern: {
                name: string;
                subject: string;
                totalMarks: number | null;
                duration: number | null;
                totalSections: number;
                totalQuestions: any;
                sections: {
                    name: any;
                    questionType: any;
                    numberOfQuestions: number;
                    questionsToAttempt: number;
                    marksPerQuestion: number;
                    notes: any;
                    sectionMarks: number;
                    attemptLabel: string | null;
                    questions: any[];
                }[];
            };
            id: any;
            subject: any;
            board: any;
            class: any;
            chapterStart: any;
            chapterEnd: any;
            questionCount: any;
            status: any;
            mode: any;
            quizType: any;
            sourceSummary: any;
            questions: any;
        };
    }>;
    listQuizzes(req: any): Promise<{
        success: boolean;
        quizzes: {
            id: string;
            subject: string;
            chapterStart: number | null;
            chapterEnd: number | null;
            questionCount: number;
            status: string;
            mode: string;
            quizType: string;
            createdAt: Date;
            latestAttempt: {
                score: number | null;
                total: number;
                percentage: number | null;
                completedAt: Date | null;
            } | null;
        }[];
    }>;
    getQuiz(req: any, id: string): Promise<{
        success: boolean;
        quiz: {
            id: any;
            subject: any;
            chapterStart: any;
            chapterEnd: any;
            status: any;
            allowReview: boolean;
            reviewDisabled: boolean;
            attempt: {
                score: any;
                total: any;
                percentage: any;
            };
            questions: any;
        } | {
            paperPattern: {
                name: string;
                subject: string;
                totalMarks: number | null;
                duration: number | null;
                totalSections: number;
                totalQuestions: any;
                sections: {
                    name: any;
                    questionType: any;
                    numberOfQuestions: number;
                    questionsToAttempt: number;
                    marksPerQuestion: number;
                    notes: any;
                    sectionMarks: number;
                    attemptLabel: string | null;
                    questions: any[];
                }[];
            };
            id: any;
            subject: any;
            chapterStart: any;
            chapterEnd: any;
            status: any;
            allowReview: boolean;
            reviewDisabled: boolean;
            attempt: {
                score: any;
                total: any;
                percentage: any;
            };
            questions: any;
        };
    } | {
        success: boolean;
        quiz: {
            id: any;
            subject: any;
            board: any;
            class: any;
            chapterStart: any;
            chapterEnd: any;
            questionCount: any;
            status: any;
            mode: any;
            quizType: any;
            sourceSummary: any;
            questions: any;
        } | {
            paperPattern: {
                name: string;
                subject: string;
                totalMarks: number | null;
                duration: number | null;
                totalSections: number;
                totalQuestions: any;
                sections: {
                    name: any;
                    questionType: any;
                    numberOfQuestions: number;
                    questionsToAttempt: number;
                    marksPerQuestion: number;
                    notes: any;
                    sectionMarks: number;
                    attemptLabel: string | null;
                    questions: any[];
                }[];
            };
            id: any;
            subject: any;
            board: any;
            class: any;
            chapterStart: any;
            chapterEnd: any;
            questionCount: any;
            status: any;
            mode: any;
            quizType: any;
            sourceSummary: any;
            questions: any;
        };
    }>;
    submitQuiz(req: any, id: string, dto: SubmitQuizDto): Promise<{
        success: boolean;
        attempt: {
            id: any;
            score: number;
            total: number;
            percentage: number;
            allowReview: boolean;
            reviewDisabled: boolean;
            results: {
                questionId: string;
                questionText: string;
                questionType: string;
                options: import("@prisma/client/runtime/client").JsonValue | undefined;
                selectedOption: string | null;
                correctOption: string | undefined;
                isCorrect: boolean | null;
                explanation: string | null | undefined;
            }[];
        };
    }>;
}
