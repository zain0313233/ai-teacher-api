import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
        name: string;
        email: string;
        id: string;
        role: import("@prisma/client").$Enums.UserRole;
        plan: import("@prisma/client").$Enums.PlanType;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProfile(userId: string, data: {
        name?: string;
    }): Promise<{
        name: string;
        email: string;
        id: string;
        role: import("@prisma/client").$Enums.UserRole;
        plan: import("@prisma/client").$Enums.PlanType;
        updatedAt: Date;
    }>;
    updatePlan(userId: string, plan: 'FREE' | 'BASIC' | 'PRO'): Promise<{
        name: string;
        email: string;
        id: string;
        plan: import("@prisma/client").$Enums.PlanType;
    }>;
}
