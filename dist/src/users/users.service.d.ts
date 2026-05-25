import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
        name: string;
        id: string;
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
        plan: import("@prisma/client").$Enums.PlanType;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getMyProfile(userId: string): Promise<{
        studentProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            educationLevel: string;
            classGrade: string | null;
            group: string | null;
            board: string | null;
            degree: string | null;
            semester: string | null;
            subjects: string[];
            targetExam: string | null;
            schoolName: string | null;
            city: string | null;
            userId: string;
            learningLevel: number;
            onboardingDone: boolean;
        } | null;
        teacherProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            board: string | null;
            schoolName: string | null;
            city: string | null;
            subjectsTaught: string[];
            classesTaught: string[];
            institutionType: string | null;
            experienceYears: number | null;
            userId: string;
            onboardingDone: boolean;
        } | null;
        name: string;
        id: string;
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
        plan: import("@prisma/client").$Enums.PlanType;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateMyProfile(userId: string, dto: UpdateProfileDto): Promise<{
        studentProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            educationLevel: string;
            classGrade: string | null;
            group: string | null;
            board: string | null;
            degree: string | null;
            semester: string | null;
            subjects: string[];
            targetExam: string | null;
            schoolName: string | null;
            city: string | null;
            userId: string;
            learningLevel: number;
            onboardingDone: boolean;
        } | null;
        teacherProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            board: string | null;
            schoolName: string | null;
            city: string | null;
            subjectsTaught: string[];
            classesTaught: string[];
            institutionType: string | null;
            experienceYears: number | null;
            userId: string;
            onboardingDone: boolean;
        } | null;
        name: string;
        id: string;
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
        plan: import("@prisma/client").$Enums.PlanType;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProfile(userId: string, data: {
        name?: string;
    }): Promise<{
        name: string;
        id: string;
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
        plan: import("@prisma/client").$Enums.PlanType;
        updatedAt: Date;
    }>;
    updatePlan(userId: string, plan: 'FREE' | 'BASIC' | 'PRO'): Promise<{
        name: string;
        id: string;
        email: string;
        plan: import("@prisma/client").$Enums.PlanType;
    }>;
}
