import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';
import { hashPassword, comparePassword } from './utils/password.util';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as crypto from 'crypto';

const RESEND_OTP_COOLDOWN_MS = 60 * 1000;
const FORGOT_PASSWORD_COOLDOWN_MS = 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password, role } = registerDto;
    /* full dto kept for profile creation below */

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await hashPassword(password);
    const resolvedRole = (role as string) || 'USER';

    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: resolvedRole as any,
        },
        select: {
          id: true, name: true, email: true,
          role: true, plan: true, isVerified: true, createdAt: true,
        },
      });

      if (resolvedRole === 'USER') {
        await tx.studentProfile.create({
          data: {
            userId:         newUser.id,
            educationLevel: registerDto.educationLevel || 'matric',
            classGrade:     registerDto.classGrade     || null,
            group:          registerDto.group          || null,
            board:          registerDto.board          || null,
            degree:         registerDto.degree         || null,
            semester:       registerDto.semester       || null,
            subjects:       registerDto.subjects       || [],
            targetExam:     registerDto.targetExam     || null,
            schoolName:     registerDto.schoolName     || null,
            city:           registerDto.city           || null,
          },
        });
      }

      if (resolvedRole === 'TEACHER') {
        await tx.teacherProfile.create({
          data: {
            userId:          newUser.id,
            subjectsTaught:  registerDto.subjectsTaught  || [],
            classesTaught:   registerDto.classesTaught   || [],
            board:           registerDto.board           || null,
            institutionType: registerDto.institutionType || null,
            schoolName:      registerDto.schoolName      || null,
            city:            registerDto.city            || null,
            experienceYears: registerDto.experienceYears ?? null,
          },
        });
      }

      return newUser;
    });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in database
    await this.prisma.otpCode.create({
      data: {
        userId: user.id,
        code: otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    // Send verification email
    await this.emailService.sendVerificationEmail(email, name, otp);

    return user;
  }

  async verifyEmail(userId: string, otp: string) {
    const otpRecord = await this.prisma.otpCode.findFirst({
      where: {
        userId,
        code: otp,
      },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid OTP');
    }

    if (otpRecord.expiresAt < new Date()) {
      await this.prisma.otpCode.delete({ where: { id: otpRecord.id } });
      throw new BadRequestException('OTP expired');
    }

    // Mark user as verified
    await this.prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });

    // Delete used OTP
    await this.prisma.otpCode.delete({ where: { id: otpRecord.id } });

    return { message: 'Email verified successfully' };
  }

  async getVerificationStatus(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, isVerified: true },
    });

    if (!user) {
      throw new NotFoundException('No account found with this email');
    }

    return {
      needsVerification: !user.isVerified,
      userId: user.isVerified ? undefined : user.id,
    };
  }

  private async assertResendCooldown(userId: string) {
    const latestOtp = await this.prisma.otpCode.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (latestOtp) {
      const elapsed = Date.now() - latestOtp.createdAt.getTime();
      if (elapsed < RESEND_OTP_COOLDOWN_MS) {
        const waitSec = Math.ceil((RESEND_OTP_COOLDOWN_MS - elapsed) / 1000);
        throw new BadRequestException(
          `Please wait ${waitSec} seconds before requesting a new code`,
        );
      }
    }
  }

  async resendOtp(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('Email already verified');
    }

    await this.assertResendCooldown(userId);

    // Delete old OTPs
    await this.prisma.otpCode.deleteMany({
      where: { userId },
    });

    // Generate new OTP
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

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException({
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

  async forgotPassword(email: string) {
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
        throw new BadRequestException(
          `Please wait ${waitSec} seconds before requesting another reset link`,
        );
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

  async getResetTokenStatus(token: string) {
    const resetRecord = await this.prisma.passwordReset.findUnique({
      where: { token },
    });

    if (!resetRecord) {
      return { valid: false, reason: 'INVALID' as const };
    }

    if (resetRecord.expiresAt < new Date()) {
      return { valid: false, reason: 'EXPIRED' as const };
    }

    return { valid: true };
  }

  async resetPassword(token: string, newPassword: string) {
    const resetRecord = await this.prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetRecord) {
      throw new BadRequestException({
        message: 'This reset link is invalid or has already been used',
        code: 'RESET_TOKEN_INVALID',
      });
    }

    if (resetRecord.expiresAt < new Date()) {
      await this.prisma.passwordReset.delete({ where: { token } });
      throw new BadRequestException({
        message: 'This reset link has expired. Please request a new one.',
        code: 'RESET_TOKEN_EXPIRED',
      });
    }

    const hashedPassword = await hashPassword(newPassword);
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

  async refreshAccessToken(token: string) {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      await this.prisma.refreshToken.delete({ where: { token } });
      throw new UnauthorizedException('Refresh token expired');
    }

    try {
      this.jwtService.verify(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
    } catch {
      await this.prisma.refreshToken.delete({ where: { token } });
      throw new UnauthorizedException('Invalid refresh token');
    }

    const newAccessToken = this.generateAccessToken(
      storedToken.user.id,
      storedToken.user.role,
    );

    return { accessToken: newAccessToken };
  }

  async logout(userId: string, token: string) {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!storedToken) {
      throw new NotFoundException('Token not found');
    }

    if (storedToken.userId !== userId) {
      throw new UnauthorizedException('Unauthorized to logout this token');
    }

    await this.prisma.refreshToken.delete({ where: { token } });

    return { message: 'Logged out successfully' };
  }

  private generateAccessToken(userId: string, role: string): string {
    return this.jwtService.sign(
      { id: userId, role },
      {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      },
    );
  }

  private generateRefreshToken(userId: string): string {
    return this.jwtService.sign(
      { id: userId },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      },
    );
  }
}
