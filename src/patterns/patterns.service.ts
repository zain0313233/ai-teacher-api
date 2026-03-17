import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatternDto } from './dto/create-pattern.dto';
import { UpdatePatternDto } from './dto/update-pattern.dto';

@Injectable()
export class PatternsService {
  constructor(private prisma: PrismaService) {}

  async createPattern(userId: string, createPatternDto: CreatePatternDto) {
    const pattern = await this.prisma.pattern.create({
      data: {
        userId,
        name: createPatternDto.name,
        subject: createPatternDto.subject,
        totalMarks: createPatternDto.totalMarks,
        duration: createPatternDto.duration,
        sections: createPatternDto.sections,
      },
    });

    return pattern;
  }

  async getUserPatterns(userId: string) {
    const patterns = await this.prisma.pattern.findMany({
      where: { userId },
      orderBy: { lastUsed: 'desc' },
    });

    return patterns;
  }

  async getPatternById(patternId: string, userId: string) {
    const pattern = await this.prisma.pattern.findFirst({
      where: {
        id: patternId,
        userId,
      },
    });

    if (!pattern) {
      throw new NotFoundException('Pattern not found');
    }

    return pattern;
  }

  async updatePattern(
    patternId: string,
    userId: string,
    updatePatternDto: UpdatePatternDto,
  ) {
    const pattern = await this.prisma.pattern.findFirst({
      where: {
        id: patternId,
        userId,
      },
    });

    if (!pattern) {
      throw new NotFoundException('Pattern not found');
    }

    const updatedPattern = await this.prisma.pattern.update({
      where: { id: patternId },
      data: updatePatternDto,
    });

    return updatedPattern;
  }

  async deletePattern(patternId: string, userId: string) {
    const pattern = await this.prisma.pattern.findFirst({
      where: {
        id: patternId,
        userId,
      },
    });

    if (!pattern) {
      throw new NotFoundException('Pattern not found');
    }

    await this.prisma.pattern.delete({
      where: { id: patternId },
    });

    return { message: 'Pattern deleted successfully' };
  }

  async markAsUsed(patternId: string, userId: string) {
    const pattern = await this.prisma.pattern.findFirst({
      where: {
        id: patternId,
        userId,
      },
    });

    if (!pattern) {
      throw new NotFoundException('Pattern not found');
    }

    await this.prisma.pattern.update({
      where: { id: patternId },
      data: { lastUsed: new Date() },
    });
  }

  async getPatternStats(userId: string) {
    const patterns = await this.prisma.pattern.findMany({
      where: { userId },
    });

    const totalPatterns = patterns.length;
    
    // Calculate most used subject
    const subjectCounts = patterns.reduce((acc, pattern) => {
      acc[pattern.subject] = (acc[pattern.subject] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostUsed = Object.entries(subjectCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    
    // Calculate average marks
    const avgMarks = patterns.length > 0
      ? Math.round(patterns.reduce((sum, p) => sum + p.totalMarks, 0) / patterns.length)
      : 0;
    
    // Calculate average duration (in hours)
    const avgDuration = patterns.length > 0
      ? Math.round(patterns.reduce((sum, p) => sum + p.duration, 0) / patterns.length / 60)
      : 0;

    return {
      totalPatterns,
      mostUsed,
      avgMarks,
      avgDuration: `${avgDuration}h`,
    };
  }
}
