import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<{
        success: boolean;
        user: {
            name: string;
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
            plan: import("@prisma/client").$Enums.PlanType;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    updateProfile(req: any, updateProfileDto: UpdateProfileDto): Promise<{
        success: boolean;
        user: {
            name: string;
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
            plan: import("@prisma/client").$Enums.PlanType;
            updatedAt: Date;
        };
    }>;
    getMyProfile(req: any): Promise<{
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
        emailNotifyAssignments: boolean;
        emailNotifyDueReminders: boolean;
        inAppNotifications: boolean;
        createdAt: Date;
        updatedAt: Date;
        success: boolean;
    }>;
    updateMyProfile(req: any, updateProfileDto: UpdateProfileDto): Promise<{
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
        emailNotifyAssignments: boolean;
        emailNotifyDueReminders: boolean;
        inAppNotifications: boolean;
        createdAt: Date;
        updatedAt: Date;
        success: boolean;
    }>;
    updatePlan(req: any, updatePlanDto: UpdatePlanDto): Promise<{
        success: boolean;
        user: {
            name: string;
            id: string;
            email: string;
            plan: import("@prisma/client").$Enums.PlanType;
        };
    }>;
}
