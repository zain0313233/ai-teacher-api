import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getMyProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        teacherProfile: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const { password, ...safeUser } = user;
    return safeUser;
  }

  async updateMyProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Update base user name if provided
    if (dto.name) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { name: dto.name },
      });
    }

    // Extract profile-specific fields
    const { name, ...profileData } = dto;

    if (user.role === 'USER') {
      const { subjectsTaught, classesTaught, institutionType, experienceYears, ...studentData } = profileData;
      await this.prisma.studentProfile.upsert({
        where: { userId },
        create: { userId, educationLevel: 'matric', ...studentData },
        update: { ...studentData },
      });
    } else if (user.role === 'TEACHER') {
      const { educationLevel, classGrade, group, degree, semester, subjects, targetExam, ...teacherData } = profileData;
      await this.prisma.teacherProfile.upsert({
        where: { userId },
        create: { userId, ...teacherData },
        update: { ...teacherData },
      });
    }

    return this.getMyProfile(userId);
  }

  async updateProfile(userId: string, data: { name?: string }) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async updatePlan(userId: string, plan: 'FREE' | 'BASIC' | 'PRO') {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { plan },
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
      },
    });

    return user;
  }
}
