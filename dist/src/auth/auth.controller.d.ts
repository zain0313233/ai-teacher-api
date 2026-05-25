import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        success: boolean;
        message: string;
        user: {
            name: string;
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
            plan: import("@prisma/client").$Enums.PlanType;
            isVerified: boolean;
            createdAt: Date;
        };
    }>;
    verifyEmail(body: {
        userId: string;
        otp: string;
    }): Promise<{
        message: string;
        success: boolean;
    }>;
    resendOtp(body: {
        userId: string;
    }): Promise<{
        message: string;
        success: boolean;
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
            plan: import("@prisma/client").$Enums.PlanType;
        };
        profile: {
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
            onboardingDone: boolean;
        } | {
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
        success: boolean;
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
        success: boolean;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
        success: boolean;
    }>;
    refresh(refreshTokenDto: RefreshTokenDto): Promise<{
        accessToken: string;
        success: boolean;
    }>;
    logout(req: any, refreshTokenDto: RefreshTokenDto): Promise<{
        message: string;
        success: boolean;
    }>;
}
