import type { Response } from 'express';
import { ClassroomsService } from './classrooms.service';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { JoinClassroomDto } from './dto/join-classroom.dto';
import { ShareMaterialDto } from './dto/share-material.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { DuplicateAssignmentDto } from './dto/duplicate-assignment.dto';
import { SubmitQuizDto } from '../exam-genie/dto/submit-quiz.dto';
export declare class ClassroomsController {
    private readonly classroomsService;
    constructor(classroomsService: ClassroomsService);
    createClassroom(req: any, dto: CreateClassroomDto): Promise<{
        success: boolean;
        classroom: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            classGrade: string | null;
            board: string | null;
            subject: string;
            teacherId: string;
            joinCode: string;
            description: string | null;
            isActive: boolean;
        };
    }>;
    listTeacherClassrooms(req: any): Promise<{
        success: boolean;
        classrooms: {
            id: string;
            name: string;
            subject: string;
            classGrade: string | null;
            board: string | null;
            joinCode: string;
            isActive: boolean;
            studentCount: number;
            assignmentCount: number;
            createdAt: Date;
        }[];
    }>;
    getTeacherClassroom(req: any, id: string): Promise<{
        success: boolean;
        classroom: ({
            enrollments: ({
                student: {
                    name: string;
                    id: string;
                    email: string;
                };
            } & {
                id: string;
                classroomId: string;
                studentId: string;
                status: string;
                joinedAt: Date;
            })[];
            materials: ({
                document: {
                    id: string;
                    subject: string | null;
                    fileName: string;
                    processed: boolean;
                } | null;
                pastPaper: {
                    id: string;
                    subject: string;
                    fileName: string;
                    processed: boolean;
                    extractionStatus: string;
                } | null;
            } & {
                id: string;
                documentId: string | null;
                classroomId: string;
                teacherId: string;
                title: string | null;
                pastPaperId: string | null;
                note: string | null;
                sharedAt: Date;
            })[];
            assignments: ({
                quizSession: {
                    id: string;
                    subject: string;
                    chapterStart: number | null;
                    chapterEnd: number | null;
                    questionCount: number;
                    quizType: string;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                classroomId: string;
                status: string;
                teacherId: string;
                title: string;
                quizSessionId: string;
                instructions: string | null;
                assignmentMode: string;
                durationMinutes: number | null;
                dueAt: Date | null;
                allowReviewAfterSubmit: boolean;
            })[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            classGrade: string | null;
            board: string | null;
            subject: string;
            teacherId: string;
            joinCode: string;
            description: string | null;
            isActive: boolean;
        }) | null;
    }>;
    getClassroomReport(req: any, id: string): Promise<{
        success: boolean;
        reports: {
            assignmentId: string;
            title: string;
            status: string;
            assignmentMode: string;
            durationMinutes: number | null;
            dueAt: Date | null;
            questionCount: number;
            submittedCount: number;
            totalStudents: number;
            averageScore: number | null;
            studentResults: {
                studentId: string;
                name: string;
                email: string;
                submitted: boolean;
                score: number | null;
                total: number | null;
                percentage: number | null;
                completedAt: Date | null;
            }[];
        }[];
        studentCount: number;
    }>;
    shareMaterial(req: any, id: string, dto: ShareMaterialDto): Promise<{
        success: boolean;
        material: {
            document: {
                id: string;
                fileName: string;
            } | null;
            pastPaper: {
                id: string;
                fileName: string;
            } | null;
        } & {
            id: string;
            documentId: string | null;
            classroomId: string;
            teacherId: string;
            title: string | null;
            pastPaperId: string | null;
            note: string | null;
            sharedAt: Date;
        };
    }>;
    exportClassroomReport(req: any, id: string, res: Response): Promise<void>;
    createAssignment(req: any, id: string, dto: CreateAssignmentDto): Promise<{
        success: boolean;
        assignment: {
            quizSession: {
                id: string;
                subject: string;
                questionCount: number;
                quizType: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            classroomId: string;
            status: string;
            teacherId: string;
            title: string;
            quizSessionId: string;
            instructions: string | null;
            assignmentMode: string;
            durationMinutes: number | null;
            dueAt: Date | null;
            allowReviewAfterSubmit: boolean;
        };
    }>;
    duplicateAssignment(req: any, classroomId: string, assignmentId: string, dto: DuplicateAssignmentDto): Promise<{
        success: boolean;
        assignment: {
            quizSession: {
                id: string;
                subject: string;
                questionCount: number;
                quizType: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            classroomId: string;
            status: string;
            teacherId: string;
            title: string;
            quizSessionId: string;
            instructions: string | null;
            assignmentMode: string;
            durationMinutes: number | null;
            dueAt: Date | null;
            allowReviewAfterSubmit: boolean;
        };
    }>;
    joinClassroom(req: any, dto: JoinClassroomDto): Promise<{
        success: boolean;
        message: string;
        classroom: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            classGrade: string | null;
            board: string | null;
            subject: string;
            teacherId: string;
            joinCode: string;
            description: string | null;
            isActive: boolean;
        };
    } | {
        success: boolean;
        message: string;
        classroom: {
            id: string;
            name: string;
            subject: string;
        };
    }>;
    listStudentClassrooms(req: any): Promise<{
        success: boolean;
        classrooms: {
            id: string;
            name: string;
            subject: string;
            classGrade: string | null;
            teacherName: string;
            materialCount: number;
            assignmentCount: number;
            pendingAssignments: number;
            overdueAssignments: number;
            joinedAt: Date;
        }[];
    }>;
    listStudentAssignments(req: any): Promise<{
        success: boolean;
        assignments: {
            id: string;
            title: string;
            classroomId: string;
            classroomName: string;
            subject: string;
            assignmentMode: string;
            durationMinutes: number | null;
            dueAt: Date | null;
            createdAt: Date;
            questionCount: number;
            chapterStart: number | null;
            chapterEnd: number | null;
            submitted: boolean;
            status: "submitted" | "overdue" | "due_soon" | "pending";
            isOverdue: boolean;
            latestAttempt: {
                score: number | null;
                total: number;
                percentage: number | null;
                completedAt: Date | null;
            } | null;
        }[];
        summary: {
            total: number;
            pending: number;
            overdue: number;
            dueSoon: number;
            submitted: number;
        };
    }>;
    getStudentClassroom(req: any, id: string): Promise<{
        success: boolean;
        classroom: {
            assignments: {
                id: string;
                title: string;
                instructions: string | null;
                assignmentMode: string;
                durationMinutes: number | null;
                dueAt: Date | null;
                createdAt: Date;
                quizSessionId: string;
                subject: string;
                questionCount: number;
                quizType: string;
                chapterStart: number | null;
                chapterEnd: number | null;
                submitted: boolean;
                status: "submitted" | "overdue" | "due_soon" | "pending";
                isOverdue: boolean;
                latestAttempt: {
                    score: number | null;
                    total: number;
                    percentage: number | null;
                } | null;
            }[];
            teacher?: {
                name: string;
                id: string;
            } | undefined;
            materials?: ({
                document: {
                    id: string;
                    subject: string | null;
                    fileName: string;
                } | null;
                pastPaper: {
                    id: string;
                    year: number;
                    subject: string;
                    fileName: string;
                } | null;
            } & {
                id: string;
                documentId: string | null;
                classroomId: string;
                teacherId: string;
                title: string | null;
                pastPaperId: string | null;
                note: string | null;
                sharedAt: Date;
            })[] | undefined;
            name?: string | undefined;
            id?: string | undefined;
            createdAt?: Date | undefined;
            updatedAt?: Date | undefined;
            classGrade?: string | null | undefined;
            board?: string | null | undefined;
            subject?: string | undefined;
            teacherId?: string | undefined;
            joinCode?: string | undefined;
            description?: string | null | undefined;
            isActive?: boolean | undefined;
        };
    }>;
    getAssignmentQuiz(req: any, assignmentId: string): Promise<{
        assignment: {
            id: string;
            title: string;
            instructions: string | null;
            assignmentMode: string;
            durationMinutes: number | null;
            dueAt: Date | null;
            allowReviewAfterSubmit: boolean;
        };
        timing: {
            startedAt: Date;
            endsAt: Date | null;
            remainingSeconds: number | null;
            durationMinutes: number | null;
        } | null;
        timeExpired: boolean;
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
        assignment: {
            id: string;
            title: string;
            instructions: string | null;
            assignmentMode: string;
            durationMinutes: number | null;
            dueAt: Date | null;
            allowReviewAfterSubmit: boolean;
        };
        timing: {
            startedAt: Date;
            endsAt: Date | null;
            remainingSeconds: number | null;
            durationMinutes: number | null;
        } | null;
        timeExpired: boolean;
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
    submitAssignment(req: any, assignmentId: string, dto: SubmitQuizDto): Promise<{
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
