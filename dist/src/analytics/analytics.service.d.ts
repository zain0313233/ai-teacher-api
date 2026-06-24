import { PrismaService } from '../prisma/prisma.service';
export declare class AnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    getClassroomAnalytics(teacherId: string, classroomId: string): Promise<{
        success: boolean;
        classroom: {
            id: string;
            name: string;
            subject: string;
            board: string | null;
            classGrade: string | null;
        };
        summary: {
            studentCount: number;
            totalAssignments: number;
            totalSubmissions: number;
            classAvgScore: number | null;
            submissionRate: number;
        };
        assignmentTrend: {
            assignmentId: string;
            title: string;
            createdAt: Date;
            avgScore: number | null;
            submittedCount: number;
            totalStudents: number;
            submissionRate: number;
        }[];
        monthlyTrend: {
            month: string;
            avgScore: number;
            attemptCount: number;
        }[];
        weakTopics: import("./analytics.helpers").TopicWeaknessRow[];
        boardBenchmark: {
            targetPercent: number;
            classAvgScore: number | null;
            delta: number | null;
            message: string;
        };
    }>;
    getStudentSubjectAnalytics(userId: string): Promise<{
        success: boolean;
        overall: {
            totalAttempts: number;
            avgScore: number | null;
            benchmarkTarget: number;
            board: string | null;
            message: string;
        };
        subjects: {
            weakTopics: import("./analytics.helpers").TopicWeaknessRow[];
            benchmarkTarget: number;
            vsBenchmark: number | null;
            subject: string;
            attemptCount: number;
            avgScore: number;
            bestScore: number;
            latestScore: number | null;
            strength: "moderate" | "strong" | "weak";
        }[];
        weakTopics: import("./analytics.helpers").TopicWeaknessRow[];
        scoreTrend: {
            label: string;
            subject: string;
            score: number;
            completedAt: Date | null;
        }[];
    }>;
}
