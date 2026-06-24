import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  aggregateTopicWeakness,
  buildBenchmarkMessage,
  classifyStrength,
  getBoardBenchmarkTarget,
} from './analytics.helpers';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getClassroomAnalytics(teacherId: string, classroomId: string) {
    const classroom = await this.prisma.classroom.findFirst({
      where: { id: classroomId, teacherId },
    });
    if (!classroom) {
      throw new NotFoundException('Classroom not found');
    }

    const enrollments = await this.prisma.classEnrollment.count({
      where: { classroomId, status: 'active' },
    });

    const assignments = await this.prisma.classAssignment.findMany({
      where: { classroomId },
      orderBy: { createdAt: 'asc' },
      include: {
        quizSession: {
          include: {
            attempts: {
              where: { completedAt: { not: null } },
              select: {
                percentage: true,
                completedAt: true,
              },
            },
          },
        },
      },
    });

    const quizSessionIds = assignments.map((a) => a.quizSessionId);

    const assignmentTrend = assignments.map((a) => {
      const attempts = a.quizSession.attempts;
      const avgScore =
        attempts.length > 0
          ? Math.round(
              (attempts.reduce((sum, att) => sum + (att.percentage || 0), 0) /
                attempts.length) *
                10,
            ) / 10
          : null;
      const submittedCount = attempts.length;
      return {
        assignmentId: a.id,
        title: a.title,
        createdAt: a.createdAt,
        avgScore,
        submittedCount,
        totalStudents: enrollments,
        submissionRate:
          enrollments > 0
            ? Math.round((submittedCount / enrollments) * 100)
            : 0,
      };
    });

    const allAttempts = assignments.flatMap((a) =>
      a.quizSession.attempts.map((att) => ({
        percentage: att.percentage,
        completedAt: att.completedAt!,
      })),
    );

    const classAvgScore =
      allAttempts.length > 0
        ? Math.round(
            (allAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) /
              allAttempts.length) *
              10,
          ) / 10
        : null;

    const monthlyMap = new Map<string, { total: number; count: number }>();
    for (const att of allAttempts) {
      const key = att.completedAt.toISOString().slice(0, 7);
      const row = monthlyMap.get(key) || { total: 0, count: 0 };
      row.total += att.percentage || 0;
      row.count += 1;
      monthlyMap.set(key, row);
    }
    const monthlyTrend = [...monthlyMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, row]) => ({
        month,
        avgScore: Math.round((row.total / row.count) * 10) / 10,
        attemptCount: row.count,
      }));

    let weakTopics: ReturnType<typeof aggregateTopicWeakness> = [];
    if (quizSessionIds.length > 0) {
      const answers = await this.prisma.attemptAnswer.findMany({
        where: {
          attempt: {
            completedAt: { not: null },
            quizSessionId: { in: quizSessionIds },
          },
        },
        include: {
          attempt: {
            include: {
              quizSession: {
                select: {
                  subject: true,
                  chapterStart: true,
                  chapterEnd: true,
                },
              },
            },
          },
        },
        take: 500,
      });

      const questionIds = [...new Set(answers.map((a) => a.questionId))];
      const questions = questionIds.length
        ? await this.prisma.quizQuestion.findMany({
            where: { id: { in: questionIds } },
            select: { id: true, topicTag: true, concept: true },
          })
        : [];
      weakTopics = aggregateTopicWeakness(
        answers,
        new Map(questions.map((q) => [q.id, q])),
        10,
      );
    }

    const benchmarkTarget = getBoardBenchmarkTarget(classroom.board);
    const totalSubmissions = allAttempts.length;

    return {
      success: true,
      classroom: {
        id: classroom.id,
        name: classroom.name,
        subject: classroom.subject,
        board: classroom.board,
        classGrade: classroom.classGrade,
      },
      summary: {
        studentCount: enrollments,
        totalAssignments: assignments.length,
        totalSubmissions,
        classAvgScore,
        submissionRate:
          assignments.length > 0 && enrollments > 0
            ? Math.round(
                (totalSubmissions / (assignments.length * enrollments)) * 100,
              )
            : 0,
      },
      assignmentTrend,
      monthlyTrend,
      weakTopics,
      boardBenchmark: {
        targetPercent: benchmarkTarget,
        classAvgScore,
        delta:
          classAvgScore != null
            ? Math.round((classAvgScore - benchmarkTarget) * 10) / 10
            : null,
        message: buildBenchmarkMessage(
          classAvgScore,
          benchmarkTarget,
          classroom.subject,
        ),
      },
    };
  }

  async getStudentSubjectAnalytics(userId: string) {
    const profile = await this.prisma.studentProfile.findUnique({
      where: { userId },
      select: { board: true, subjects: true },
    });

    const attempts = await this.prisma.quizAttempt.findMany({
      where: { userId, completedAt: { not: null } },
      include: {
        quizSession: {
          select: {
            subject: true,
            chapterStart: true,
            chapterEnd: true,
          },
        },
      },
      orderBy: { completedAt: 'desc' },
    });

    const bySubject = new Map<
      string,
      {
        subject: string;
        scores: number[];
        attemptCount: number;
        bestScore: number;
        latestScore: number | null;
        latestAt: Date | null;
      }
    >();

    for (const att of attempts) {
      const subject = att.quizSession.subject || 'General';
      const pct = att.percentage ?? 0;
      const row = bySubject.get(subject) || {
        subject,
        scores: [],
        attemptCount: 0,
        bestScore: 0,
        latestScore: null,
        latestAt: null,
      };
      row.scores.push(pct);
      row.attemptCount += 1;
      row.bestScore = Math.max(row.bestScore, pct);
      if (!row.latestAt || (att.completedAt && att.completedAt > row.latestAt)) {
        row.latestAt = att.completedAt;
        row.latestScore = pct;
      }
      bySubject.set(subject, row);
    }

    const subjects = [...bySubject.values()]
      .map((row) => {
        const avgScore =
          row.scores.length > 0
            ? Math.round(
                (row.scores.reduce((a, b) => a + b, 0) / row.scores.length) * 10,
              ) / 10
            : 0;
        return {
          subject: row.subject,
          attemptCount: row.attemptCount,
          avgScore,
          bestScore: row.bestScore,
          latestScore: row.latestScore,
          strength: classifyStrength(avgScore),
        };
      })
      .sort((a, b) => b.attemptCount - a.attemptCount);

    const overallAvg =
      attempts.length > 0
        ? Math.round(
            (attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) /
              attempts.length) *
              10,
          ) / 10
        : null;

    const benchmarkTarget = getBoardBenchmarkTarget(profile?.board);

    const answers = await this.prisma.attemptAnswer.findMany({
      where: {
        attempt: { userId, completedAt: { not: null } },
      },
      include: {
        attempt: {
          include: {
            quizSession: {
              select: {
                subject: true,
                chapterStart: true,
                chapterEnd: true,
              },
            },
          },
        },
      },
      orderBy: { attempt: { completedAt: 'desc' } },
      take: 300,
    });

    const questionIds = [...new Set(answers.map((a) => a.questionId))];
    const questions = questionIds.length
      ? await this.prisma.quizQuestion.findMany({
          where: { id: { in: questionIds } },
          select: { id: true, topicTag: true, concept: true },
        })
      : [];

    const weakTopics = aggregateTopicWeakness(
      answers,
      new Map(questions.map((q) => [q.id, q])),
      8,
    );

    const weakBySubject = new Map<string, typeof weakTopics>();
    for (const topic of weakTopics) {
      const list = weakBySubject.get(topic.subject) || [];
      list.push(topic);
      weakBySubject.set(topic.subject, list);
    }

    const subjectsWithTopics = subjects.map((s) => ({
      ...s,
      weakTopics: (weakBySubject.get(s.subject) || []).slice(0, 3),
      benchmarkTarget,
      vsBenchmark:
        s.avgScore > 0
          ? Math.round((s.avgScore - benchmarkTarget) * 10) / 10
          : null,
    }));

    const scoreTrend = [...attempts]
      .reverse()
      .slice(-12)
      .map((att, index) => ({
        label: `Attempt ${index + 1}`,
        subject: att.quizSession.subject,
        score: att.percentage ?? 0,
        completedAt: att.completedAt,
      }));

    return {
      success: true,
      overall: {
        totalAttempts: attempts.length,
        avgScore: overallAvg,
        benchmarkTarget,
        board: profile?.board || null,
        message:
          overallAvg != null
            ? buildBenchmarkMessage(overallAvg, benchmarkTarget, 'your subjects')
            : 'Take quizzes to unlock subject-wise analytics.',
      },
      subjects: subjectsWithTopics,
      weakTopics,
      scoreTrend,
    };
  }
}
