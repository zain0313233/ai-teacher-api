"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("./email.service");
const password_util_1 = require("./utils/password.util");
const crypto = __importStar(require("crypto"));
const RESEND_OTP_COOLDOWN_MS = 60 * 1000;
const FORGOT_PASSWORD_COOLDOWN_MS = 60 * 1000;
let AuthService = class AuthService {
    prisma;
    jwtService;
    configService;
    emailService;
    constructor(prisma, jwtService, configService, emailService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.emailService = emailService;
    }
    async register(registerDto) {
        const { name, email, password, role } = registerDto;
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User already exists');
        }
        const hashedPassword = await (0, password_util_1.hashPassword)(password);
        const resolvedRole = role || 'USER';
        const user = await this.prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: resolvedRole,
                },
                select: {
                    id: true, name: true, email: true,
                    role: true, plan: true, isVerified: true, createdAt: true,
                },
            });
            if (resolvedRole === 'USER') {
                await tx.studentProfile.create({
                    data: {
                        userId: newUser.id,
                        educationLevel: registerDto.educationLevel || 'matric',
                        classGrade: registerDto.classGrade || null,
                        group: registerDto.group || null,
                        board: registerDto.board || null,
                        degree: registerDto.degree || null,
                        semester: registerDto.semester || null,
                        subjects: registerDto.subjects || [],
                        targetExam: registerDto.targetExam || null,
                        schoolName: registerDto.schoolName || null,
                        city: registerDto.city || null,
                    },
                });
            }
            if (resolvedRole === 'TEACHER') {
                await tx.teacherProfile.create({
                    data: {
                        userId: newUser.id,
                        subjectsTaught: registerDto.subjectsTaught || [],
                        classesTaught: registerDto.classesTaught || [],
                        board: registerDto.board || null,
                        institutionType: registerDto.institutionType || null,
                        schoolName: registerDto.schoolName || null,
                        city: registerDto.city || null,
                        experienceYears: registerDto.experienceYears ?? null,
                    },
                });
            }
            return newUser;
        });
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await this.prisma.otpCode.create({
            data: {
                userId: user.id,
                code: otp,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            },
        });
        await this.emailService.sendVerificationEmail(email, name, otp);
        return user;
    }
    async verifyEmail(userId, otp) {
        const otpRecord = await this.prisma.otpCode.findFirst({
            where: {
                userId,
                code: otp,
            },
        });
        if (!otpRecord) {
            throw new common_1.BadRequestException('Invalid OTP');
        }
        if (otpRecord.expiresAt < new Date()) {
            await this.prisma.otpCode.delete({ where: { id: otpRecord.id } });
            throw new common_1.BadRequestException('OTP expired');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: { isVerified: true },
        });
        await this.prisma.otpCode.delete({ where: { id: otpRecord.id } });
        return { message: 'Email verified successfully' };
    }
    async getVerificationStatus(email) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            select: { id: true, isVerified: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('No account found with this email');
        }
        return {
            needsVerification: !user.isVerified,
            userId: user.isVerified ? undefined : user.id,
        };
    }
    async assertResendCooldown(userId) {
        const latestOtp = await this.prisma.otpCode.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        if (latestOtp) {
            const elapsed = Date.now() - latestOtp.createdAt.getTime();
            if (elapsed < RESEND_OTP_COOLDOWN_MS) {
                const waitSec = Math.ceil((RESEND_OTP_COOLDOWN_MS - elapsed) / 1000);
                throw new common_1.BadRequestException(`Please wait ${waitSec} seconds before requesting a new code`);
            }
        }
    }
    async resendOtp(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.isVerified) {
            throw new common_1.BadRequestException('Email already verified');
        }
        await this.assertResendCooldown(userId);
        await this.prisma.otpCode.deleteMany({
            where: { userId },
        });
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await this.prisma.otpCode.create({
            data: {
                userId,
                code: otp,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            },
        });
        await this.emailService.sendVerificationEmail(user.email, user.name, otp);
        return { message: 'OTP sent successfully' };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await (0, password_util_1.comparePassword)(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isVerified) {
            throw new common_1.UnauthorizedException({
                message: 'Please verify your email first',
                code: 'EMAIL_NOT_VERIFIED',
                userId: user.id,
            });
        }
        const accessToken = this.generateAccessToken(user.id, user.role);
        const refreshToken = this.generateRefreshToken(user.id);
        await this.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        const profile = user.role === 'USER'
            ? await this.prisma.studentProfile.findUnique({ where: { userId: user.id } })
            : user.role === 'TEACHER'
                ? await this.prisma.teacherProfile.findUnique({ where: { userId: user.id } })
                : null;
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                plan: user.plan,
            },
            profile,
        };
    }
    async forgotPassword(email) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return { message: 'If email exists, reset link has been sent' };
        }
        const latestReset = await this.prisma.passwordReset.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
        });
        if (latestReset) {
            const elapsed = Date.now() - latestReset.createdAt.getTime();
            if (elapsed < FORGOT_PASSWORD_COOLDOWN_MS) {
                const waitSec = Math.ceil((FORGOT_PASSWORD_COOLDOWN_MS - elapsed) / 1000);
                throw new common_1.BadRequestException(`Please wait ${waitSec} seconds before requesting another reset link`);
            }
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        await this.prisma.passwordReset.deleteMany({
            where: { userId: user.id },
        });
        await this.prisma.passwordReset.create({
            data: {
                userId: user.id,
                token: resetToken,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000),
            },
        });
        await this.emailService.sendPasswordResetEmail(user.email, user.name, resetToken);
        return { message: 'If email exists, reset link has been sent' };
    }
    async getResetTokenStatus(token) {
        const resetRecord = await this.prisma.passwordReset.findUnique({
            where: { token },
        });
        if (!resetRecord) {
            return { valid: false, reason: 'INVALID' };
        }
        if (resetRecord.expiresAt < new Date()) {
            return { valid: false, reason: 'EXPIRED' };
        }
        return { valid: true };
    }
    async resetPassword(token, newPassword) {
        const resetRecord = await this.prisma.passwordReset.findUnique({
            where: { token },
            include: { user: true },
        });
        if (!resetRecord) {
            throw new common_1.BadRequestException({
                message: 'This reset link is invalid or has already been used',
                code: 'RESET_TOKEN_INVALID',
            });
        }
        if (resetRecord.expiresAt < new Date()) {
            await this.prisma.passwordReset.delete({ where: { token } });
            throw new common_1.BadRequestException({
                message: 'This reset link has expired. Please request a new one.',
                code: 'RESET_TOKEN_EXPIRED',
            });
        }
        const hashedPassword = await (0, password_util_1.hashPassword)(newPassword);
        await this.prisma.user.update({
            where: { id: resetRecord.userId },
            data: { password: hashedPassword },
        });
        await this.prisma.passwordReset.delete({ where: { token } });
        await this.prisma.refreshToken.deleteMany({
            where: { userId: resetRecord.userId },
        });
        return { message: 'Password reset successfully' };
    }
    async refreshAccessToken(token) {
        const storedToken = await this.prisma.refreshToken.findUnique({
            where: { token },
            include: { user: true },
        });
        if (!storedToken) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (storedToken.expiresAt < new Date()) {
            await this.prisma.refreshToken.delete({ where: { token } });
            throw new common_1.UnauthorizedException('Refresh token expired');
        }
        try {
            this.jwtService.verify(token, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });
        }
        catch {
            await this.prisma.refreshToken.delete({ where: { token } });
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const newAccessToken = this.generateAccessToken(storedToken.user.id, storedToken.user.role);
        return { accessToken: newAccessToken };
    }
    async logout(userId, token) {
        const storedToken = await this.prisma.refreshToken.findUnique({
            where: { token },
        });
        if (!storedToken) {
            throw new common_1.NotFoundException('Token not found');
        }
        if (storedToken.userId !== userId) {
            throw new common_1.UnauthorizedException('Unauthorized to logout this token');
        }
        await this.prisma.refreshToken.delete({ where: { token } });
        return { message: 'Logged out successfully' };
    }
    generateAccessToken(userId, role) {
        return this.jwtService.sign({ id: userId, role }, {
            secret: this.configService.get('JWT_ACCESS_SECRET'),
            expiresIn: '15m',
        });
    }
    generateRefreshToken(userId) {
        return this.jwtService.sign({ id: userId }, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: '7d',
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map