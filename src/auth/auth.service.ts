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

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await hashPassword(password);

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as any || 'USER', // Default to USER if not provided
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        isVerified: true,
        createdAt: true,
      },
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
      throw new UnauthorizedException('Please verify your email first');
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
    };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { message: 'If email exists, reset link has been sent' };
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

  async resetPassword(token: string, newPassword: string) {
    const resetRecord = await this.prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetRecord) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (resetRecord.expiresAt < new Date()) {
      await this.prisma.passwordReset.delete({ where: { token } });
      throw new BadRequestException('Reset token expired');
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
