import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<{
        success: boolean;
        user: {
            id: string;
            email: string;
            name: string;
            role: import("@prisma/client").$Enums.UserRole;
            plan: import("@prisma/client").$Enums.PlanType;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    updateProfile(req: any, updateProfileDto: UpdateProfileDto): Promise<{
        success: boolean;
        user: {
            id: string;
            email: string;
            name: string;
            role: import("@prisma/client").$Enums.UserRole;
            plan: import("@prisma/client").$Enums.PlanType;
            updatedAt: Date;
        };
    }>;
    updatePlan(req: any, updatePlanDto: UpdatePlanDto): Promise<{
        success: boolean;
        user: {
            id: string;
            email: string;
            name: string;
            plan: import("@prisma/client").$Enums.PlanType;
        };
    }>;
}
