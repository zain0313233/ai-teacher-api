import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: import("@prisma/client").$Enums.UserRole;
        plan: import("@prisma/client").$Enums.PlanType;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProfile(userId: string, data: {
        name?: string;
    }): Promise<{
        id: string;
        email: string;
        name: string;
        role: import("@prisma/client").$Enums.UserRole;
        plan: import("@prisma/client").$Enums.PlanType;
        updatedAt: Date;
    }>;
    updatePlan(userId: string, plan: 'FREE' | 'BASIC' | 'PRO'): Promise<{
        id: string;
        email: string;
        name: string;
        plan: import("@prisma/client").$Enums.PlanType;
    }>;
}
