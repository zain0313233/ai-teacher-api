import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private configService;
    private emailService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService, emailService: EmailService);
    register(registerDto: RegisterDto): Promise<{
        name: string;
        id: string;
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
        plan: import("@prisma/client").$Enums.PlanType;
        isVerified: boolean;
        createdAt: Date;
    }>;
    verifyEmail(userId: string, otp: string): Promise<{
        message: string;
    }>;
    resendOtp(userId: string): Promise<{
        message: string;
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
            learningLevel: number;
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
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    refreshAccessToken(token: string): Promise<{
        accessToken: string;
    }>;
    logout(userId: string, token: string): Promise<{
        message: string;
    }>;
    private generateAccessToken;
    private generateRefreshToken;
}
