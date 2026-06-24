import { PrismaService } from '../prisma/prisma.service';
import { PastPapersService } from '../past-papers/past-papers.service';
import { PatternsService } from '../patterns/patterns.service';
import { GenerateQuizDto } from './dto/generate-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
export declare class ExamGenieService {
    private prisma;
    private pastPapersService;
    private patternsService;
    private readonly fastApiUrl;
    constructor(prisma: PrismaService, pastPapersService: PastPapersService, patternsService: PatternsService);
    private getStudentContext;
    private mapBoard;
    getMaterials(userId: string, subject?: string): Promise<{
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
    getPredictions(userId: string, subject: string, chapters: number[], mode?: string): Promise<{
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
    generateQuiz(userId: string, dto: GenerateQuizDto): Promise<{
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
    getAvailablePatterns(userId: string, subject: string): Promise<{
        success: boolean;
        patterns: {
            id: string;
            name: string;
            subject: string;
            totalMarks: number;
            duration: number;
            sections: unknown;
            source: "builtin" | "teacher" | "saved";
        }[];
    }>;
    getWeakTopicRecommendations(userId: string, subject?: string): Promise<{
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
    private ensureDbReady;
    private isMcqQuestion;
    private gradeSubjectiveAnswers;
    private buildPaperPatternSectionGroups;
    private resolvePaperPatternForQuiz;
    createQuizSessionFromAi(params: {
        ownerId: string;
        dto: GenerateQuizDto;
        classGrade: string;
        board: string;
        isClassTemplate?: boolean;
        patternSections?: any[];
        patternName?: string;
        patternId?: string;
        patternTotalMarks?: number;
        patternDuration?: number;
    }): Promise<{
        questions: {
            id: string;
            options: import("@prisma/client/runtime/client").JsonValue;
            concept: string | null;
            difficulty: string | null;
            questionType: string;
            orderIndex: number;
            questionText: string;
            correctOption: string;
            topicTag: string | null;
            explanation: string | null;
            quizSessionId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        board: string | null;
        userId: string;
        class: string | null;
        subject: string;
        mode: string;
        chapterStart: number | null;
        chapterEnd: number | null;
        status: string;
        questionCount: number;
        quizType: string;
        sourceSummary: import("@prisma/client/runtime/client").JsonValue | null;
        isClassTemplate: boolean;
    }>;
    createQuizSessionFromBankItems(params: {
        ownerId: string;
        subject: string;
        classGrade: string;
        board: string;
        chapterStart: number;
        chapterEnd: number;
        items: Array<{
            questionText: string;
            questionType: string;
            options: unknown;
            correctOption: string;
            topicTag?: string | null;
            concept?: string | null;
            difficulty?: string | null;
            explanation?: string | null;
        }>;
        bankItemIds: string[];
    }): Promise<{
        questions: {
            id: string;
            options: import("@prisma/client/runtime/client").JsonValue;
            concept: string | null;
            difficulty: string | null;
            questionType: string;
            orderIndex: number;
            questionText: string;
            correctOption: string;
            topicTag: string | null;
            explanation: string | null;
            quizSessionId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        board: string | null;
        userId: string;
        class: string | null;
        subject: string;
        mode: string;
        chapterStart: number | null;
        chapterEnd: number | null;
        status: string;
        questionCount: number;
        quizType: string;
        sourceSummary: import("@prisma/client/runtime/client").JsonValue | null;
        isClassTemplate: boolean;
    }>;
    cloneClassQuizSession(sourceQuizId: string, ownerId: string): Promise<{
        questions: {
            id: string;
            options: import("@prisma/client/runtime/client").JsonValue;
            concept: string | null;
            difficulty: string | null;
            questionType: string;
            orderIndex: number;
            questionText: string;
            correctOption: string;
            topicTag: string | null;
            explanation: string | null;
            quizSessionId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        board: string | null;
        userId: string;
        class: string | null;
        subject: string;
        mode: string;
        chapterStart: number | null;
        chapterEnd: number | null;
        status: string;
        questionCount: number;
        quizType: string;
        sourceSummary: import("@prisma/client/runtime/client").JsonValue | null;
        isClassTemplate: boolean;
    }>;
    listQuizzes(userId: string): Promise<{
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
    getQuiz(userId: string, quizId: string): Promise<{
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
    startOrGetClassQuizAttempt(quizSessionId: string, userId: string): Promise<{
        id: string;
        userId: string;
        quizSessionId: string;
        score: number | null;
        total: number;
        percentage: number | null;
        startedAt: Date;
        completedAt: Date | null;
    }>;
    submitQuizAnswers(userId: string, quizId: string, dto: SubmitQuizDto, options?: {
        allowClassTemplate?: boolean;
        timedEndsAt?: Date;
        autoSubmitted?: boolean;
        graceSeconds?: number;
        allowReview?: boolean;
    }): Promise<{
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
    submitQuiz(userId: string, quizId: string, dto: SubmitQuizDto): Promise<{
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
    getQuizSessionForTaking(quizId: string, studentUserId: string, allowReview?: boolean): Promise<{
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
        alreadySubmitted: boolean;
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
        alreadySubmitted: boolean;
    }>;
    sanitizeQuizForTakingWithPattern(session: any, userId?: string): Promise<{
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
    }>;
    sanitizeQuizForReviewWithPattern(session: any, attempt: any, allowReview?: boolean, userId?: string): Promise<{
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
    }>;
    sanitizeQuizForTaking(session: any): {
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
    private sanitizeQuizForReview;
}
