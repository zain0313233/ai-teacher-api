import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ExamGenieService } from '../exam-genie/exam-genie.service';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { JoinClassroomDto } from './dto/join-classroom.dto';
import { ShareMaterialDto } from './dto/share-material.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { DuplicateAssignmentDto } from './dto/duplicate-assignment.dto';
import { SubmitQuizDto } from '../exam-genie/dto/submit-quiz.dto';
import { PatternsService } from '../patterns/patterns.service';
import { GenerateQuizDto } from '../exam-genie/dto/generate-quiz.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { QuestionBanksService } from '../question-banks/question-banks.service';

@Injectable()
export class ClassroomsService {
  constructor(
    private prisma: PrismaService,
    private examGenieService: ExamGenieService,
    private patternsService: PatternsService,
    private notificationsService: NotificationsService,
    private questionBanksService: QuestionBanksService,
  ) {}

  private generateJoinCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  private async uniqueJoinCode(): Promise<string> {
    for (let attempt = 0; attempt < 10; attempt++) {
      const code = this.generateJoinCode();
      const exists = await this.prisma.classroom.findUnique({
        where: { joinCode: code },
      });
      if (!exists) return code;
    }
    throw new BadRequestException('Could not generate join code. Try again.');
  }

  private async assertTeacherClassroom(teacherId: string, classroomId: string) {
    const classroom = await this.prisma.classroom.findFirst({
      where: { id: classroomId, teacherId },
    });
    if (!classroom) throw new NotFoundException('Classroom not found');
    return classroom;
  }

  private isAssignmentPublished(publishAt: Date | null | undefined): boolean {
    if (!publishAt) return true;
    return publishAt.getTime() <= Date.now();
  }

  private parseOptionalDate(value: string | undefined, field: string): Date | null {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(`Invalid ${field}`);
    }
    return parsed;
  }

  private validateAssignmentSchedule(publishAt: Date | null, dueAt: Date | null) {
    if (publishAt && dueAt && publishAt.getTime() >= dueAt.getTime()) {
      throw new BadRequestException('Opens at must be before the due date');
    }
  }

  private async notifyAssignmentIfPublished(
    assignment: {
      id: string;
      title: string;
      assignmentMode: string;
      dueAt: Date | null;
      publishAt: Date | null;
      publishNotifiedAt: Date | null;
    },
    classroom: { id: string; name: string },
  ) {
    if (!this.isAssignmentPublished(assignment.publishAt)) return;
    if (assignment.publishNotifiedAt) return;

    await this.notificationsService.notifyNewAssignment(assignment, classroom);
    await this.prisma.classAssignment.update({
      where: { id: assignment.id },
      data: { publishNotifiedAt: new Date() },
    });
  }

  private resolveAssignmentStatus(
    submitted: boolean,
    dueAt: Date | null,
    publishAt: Date | null = null,
  ): {
    status: 'submitted' | 'overdue' | 'due_soon' | 'pending' | 'scheduled';
    isOverdue: boolean;
    isPublished: boolean;
  } {
    const isPublished = this.isAssignmentPublished(publishAt);
    if (!isPublished) {
      return { status: 'scheduled', isOverdue: false, isPublished: false };
    }
    if (submitted) return { status: 'submitted', isOverdue: false, isPublished: true };
    if (dueAt && new Date() > dueAt) {
      return { status: 'overdue', isOverdue: true, isPublished: true };
    }
    if (dueAt) {
      const hoursLeft = (dueAt.getTime() - Date.now()) / 3600000;
      if (hoursLeft > 0 && hoursLeft <= 48) {
        return { status: 'due_soon', isOverdue: false, isPublished: true };
      }
    }
    return { status: 'pending', isOverdue: false, isPublished: true };
  }

  private escapeCsv(value: string | number | null | undefined): string {
    if (value == null) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  private assignmentStatusSortOrder(status: string): number {
    const order: Record<string, number> = {
      overdue: 0,
      due_soon: 1,
      pending: 2,
      scheduled: 3,
      submitted: 4,
    };
    return order[status] ?? 5;
  }

  private publishedAssignmentFilter(now = new Date()) {
    return {
      OR: [{ publishAt: null }, { publishAt: { lte: now } }],
    };
  }

  private resolveProctoringEnabled(assignmentMode: string, enabled?: boolean): boolean {
    return assignmentMode === 'timed' && Boolean(enabled);
  }

  private async assertStudentEnrollment(studentId: string, classroomId: string) {
    const enrollment = await this.prisma.classEnrollment.findFirst({
      where: { classroomId, studentId, status: 'active' },
    });
    if (!enrollment) throw new ForbiddenException('You are not enrolled in this class');
    return enrollment;
  }

  async createClassroom(teacherId: string, dto: CreateClassroomDto) {
    const joinCode = await this.uniqueJoinCode();
    const classroom = await this.prisma.classroom.create({
      data: {
        teacherId,
        name: dto.name,
        subject: dto.subject,
        classGrade: dto.classGrade,
        board: dto.board,
        description: dto.description,
        joinCode,
      },
    });
    return { success: true, classroom };
  }

  async listTeacherClassrooms(teacherId: string) {
    const classrooms = await this.prisma.classroom.findMany({
      where: { teacherId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { enrollments: true, assignments: true } },
      },
    });
    return {
      success: true,
      classrooms: classrooms.map((c) => ({
        id: c.id,
        name: c.name,
        subject: c.subject,
        classGrade: c.classGrade,
        board: c.board,
        joinCode: c.joinCode,
        isActive: c.isActive,
        studentCount: c._count.enrollments,
        assignmentCount: c._count.assignments,
        createdAt: c.createdAt,
      })),
    };
  }

  async getTeacherClassroom(teacherId: string, classroomId: string) {
    await this.assertTeacherClassroom(teacherId, classroomId);

    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classroomId },
      include: {
        enrollments: {
          where: { status: 'active' },
          include: {
            student: { select: { id: true, name: true, email: true } },
          },
          orderBy: { joinedAt: 'desc' },
        },
        materials: {
          orderBy: { sharedAt: 'desc' },
          include: {
            document: { select: { id: true, fileName: true, subject: true, processed: true } },
            pastPaper: { select: { id: true, fileName: true, subject: true, processed: true, extractionStatus: true } },
          },
        },
        assignments: {
          orderBy: { createdAt: 'desc' },
          include: {
            quizSession: {
              select: {
                id: true,
                subject: true,
                questionCount: true,
                quizType: true,
                chapterStart: true,
                chapterEnd: true,
              },
            },
          },
        },
      },
    });

    return { success: true, classroom };
  }

  async joinClassroom(studentId: string, dto: JoinClassroomDto) {
    const classroom = await this.prisma.classroom.findFirst({
      where: { joinCode: dto.joinCode.toUpperCase().trim(), isActive: true },
    });
    if (!classroom) throw new NotFoundException('Invalid join code');

    const existing = await this.prisma.classEnrollment.findUnique({
      where: {
        classroomId_studentId: {
          classroomId: classroom.id,
          studentId,
        },
      },
    });

    if (existing?.status === 'active') {
      return { success: true, message: 'Already joined', classroom };
    }

    if (existing) {
      await this.prisma.classEnrollment.update({
        where: { id: existing.id },
        data: { status: 'active', joinedAt: new Date() },
      });
    } else {
      await this.prisma.classEnrollment.create({
        data: { classroomId: classroom.id, studentId },
      });
    }

    return {
      success: true,
      message: `Joined ${classroom.name}`,
      classroom: {
        id: classroom.id,
        name: classroom.name,
        subject: classroom.subject,
      },
    };
  }

  async listStudentClassrooms(studentId: string) {
    const enrollments = await this.prisma.classEnrollment.findMany({
      where: { studentId, status: 'active' },
      include: {
        classroom: {
          include: {
            teacher: { select: { id: true, name: true } },
            _count: { select: { assignments: true, materials: true } },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    const classrooms = await Promise.all(
      enrollments.map(async (e) => {
        const pending = await this.prisma.classAssignment.count({
          where: {
            classroomId: e.classroomId,
            status: 'active',
            ...this.publishedAssignmentFilter(),
            quizSession: {
              attempts: {
                none: { userId: studentId, completedAt: { not: null } },
              },
            },
          },
        });
        const overdue = await this.prisma.classAssignment.count({
          where: {
            classroomId: e.classroomId,
            status: 'active',
            ...this.publishedAssignmentFilter(),
            dueAt: { lt: new Date() },
            quizSession: {
              attempts: {
                none: { userId: studentId, completedAt: { not: null } },
              },
            },
          },
        });
        return {
          id: e.classroom.id,
          name: e.classroom.name,
          subject: e.classroom.subject,
          classGrade: e.classroom.classGrade,
          teacherName: e.classroom.teacher.name,
          materialCount: e.classroom._count.materials,
          assignmentCount: e.classroom._count.assignments,
          pendingAssignments: pending,
          overdueAssignments: overdue,
          joinedAt: e.joinedAt,
        };
      }),
    );

    return { success: true, classrooms };
  }

  async listStudentAssignments(studentId: string) {
    const enrollments = await this.prisma.classEnrollment.findMany({
      where: { studentId, status: 'active' },
      select: { classroomId: true },
    });

    const classroomIds = enrollments.map((e) => e.classroomId);
    if (classroomIds.length === 0) {
      return {
        success: true,
        assignments: [],
        summary: { total: 0, pending: 0, overdue: 0, dueSoon: 0, submitted: 0 },
      };
    }

    const assignments = await this.prisma.classAssignment.findMany({
      where: { classroomId: { in: classroomIds }, status: 'active' },
      include: {
        classroom: { select: { id: true, name: true, subject: true } },
        quizSession: {
          include: {
            attempts: {
              where: { userId: studentId, completedAt: { not: null } },
              orderBy: { completedAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    const mapped = assignments
      .map((a) => {
        const submitted = a.quizSession.attempts.length > 0;
        const { status, isOverdue, isPublished } = this.resolveAssignmentStatus(
          submitted,
          a.dueAt,
          a.publishAt,
        );
        const latestAttempt = a.quizSession.attempts[0];
        return {
          id: a.id,
          title: a.title,
          classroomId: a.classroomId,
          classroomName: a.classroom.name,
          subject: a.classroom.subject,
          assignmentMode: a.assignmentMode,
          durationMinutes: a.durationMinutes,
          dueAt: a.dueAt,
          publishAt: a.publishAt,
          proctoringEnabled: a.proctoringEnabled,
          createdAt: a.createdAt,
          questionCount: a.quizSession.questionCount,
          chapterStart: a.quizSession.chapterStart,
          chapterEnd: a.quizSession.chapterEnd,
          submitted,
          status,
          isOverdue,
          isPublished,
          latestAttempt: latestAttempt
            ? {
                score: latestAttempt.score,
                total: latestAttempt.total,
                percentage: latestAttempt.percentage,
                completedAt: latestAttempt.completedAt,
              }
            : null,
        };
      })
      .sort((a, b) => {
        const priority =
          this.assignmentStatusSortOrder(a.status) -
          this.assignmentStatusSortOrder(b.status);
        if (priority !== 0) return priority;
        if (a.dueAt && b.dueAt) return a.dueAt.getTime() - b.dueAt.getTime();
        if (a.dueAt) return -1;
        if (b.dueAt) return 1;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

    return {
      success: true,
      assignments: mapped,
      summary: {
        total: mapped.length,
        pending: mapped.filter((a) => !a.submitted).length,
        overdue: mapped.filter((a) => a.isOverdue).length,
        dueSoon: mapped.filter((a) => a.status === 'due_soon').length,
        scheduled: mapped.filter((a) => a.status === 'scheduled').length,
        submitted: mapped.filter((a) => a.submitted).length,
      },
    };
  }

  async getStudentClassroom(studentId: string, classroomId: string) {
    await this.assertStudentEnrollment(studentId, classroomId);

    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classroomId },
      include: {
        teacher: { select: { id: true, name: true } },
        materials: {
          orderBy: { sharedAt: 'desc' },
          include: {
            document: { select: { id: true, fileName: true, subject: true } },
            pastPaper: { select: { id: true, fileName: true, subject: true, year: true } },
          },
        },
        assignments: {
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          include: {
            quizSession: {
              include: {
                attempts: {
                  where: { userId: studentId, completedAt: { not: null } },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    const assignments = (classroom?.assignments || [])
      .map((a) => {
        const submitted = a.quizSession.attempts.length > 0;
        const { status, isOverdue, isPublished } = this.resolveAssignmentStatus(
          submitted,
          a.dueAt,
          a.publishAt,
        );
        return {
          id: a.id,
          title: a.title,
          instructions: a.instructions,
          assignmentMode: a.assignmentMode,
          durationMinutes: a.durationMinutes,
          dueAt: a.dueAt,
          publishAt: a.publishAt,
          proctoringEnabled: a.proctoringEnabled,
          createdAt: a.createdAt,
          quizSessionId: a.quizSessionId,
          subject: a.quizSession.subject,
          questionCount: a.quizSession.questionCount,
          quizType: a.quizSession.quizType,
          chapterStart: a.quizSession.chapterStart,
          chapterEnd: a.quizSession.chapterEnd,
          submitted,
          status,
          isOverdue,
          isPublished,
          latestAttempt: a.quizSession.attempts[0]
            ? {
                score: a.quizSession.attempts[0].score,
                total: a.quizSession.attempts[0].total,
                percentage: a.quizSession.attempts[0].percentage,
              }
            : null,
        };
      })
      .sort((a, b) => {
        const priority =
          this.assignmentStatusSortOrder(a.status) -
          this.assignmentStatusSortOrder(b.status);
        if (priority !== 0) return priority;
        if (a.dueAt && b.dueAt) return a.dueAt.getTime() - b.dueAt.getTime();
        if (a.dueAt) return -1;
        if (b.dueAt) return 1;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

    return {
      success: true,
      classroom: {
        ...classroom,
        assignments,
      },
    };
  }

  async shareMaterial(teacherId: string, classroomId: string, dto: ShareMaterialDto) {
    await this.assertTeacherClassroom(teacherId, classroomId);

    if (!dto.documentId && !dto.pastPaperId) {
      throw new BadRequestException('documentId or pastPaperId is required');
    }

    if (dto.documentId) {
      const doc = await this.prisma.document.findFirst({
        where: {
          id: dto.documentId,
          OR: [{ userId: teacherId }, { isOfficial: true }],
        },
      });
      if (!doc) throw new NotFoundException('Document not found');
    }

    if (dto.pastPaperId) {
      const paper = await this.prisma.pastPaper.findFirst({
        where: { id: dto.pastPaperId, userId: teacherId },
      });
      if (!paper) throw new NotFoundException('Past paper not found');
    }

    const material = await this.prisma.classMaterial.create({
      data: {
        classroomId,
        teacherId,
        documentId: dto.documentId,
        pastPaperId: dto.pastPaperId,
        title: dto.title,
        note: dto.note,
      },
      include: {
        document: { select: { id: true, fileName: true } },
        pastPaper: { select: { id: true, fileName: true } },
      },
    });

    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classroomId },
      select: { id: true, name: true },
    });
    if (classroom) {
      const title =
        dto.title ||
        material.document?.fileName ||
        material.pastPaper?.fileName ||
        'Class material';
      await this.notificationsService.notifyMaterialShared(classroom, title);
    }

    return { success: true, material };
  }

  private computeTimedWindow(
    assignment: { durationMinutes: number | null; dueAt: Date | null },
    startedAt: Date,
  ) {
    const timerEnd = assignment.durationMinutes
      ? new Date(startedAt.getTime() + assignment.durationMinutes * 60 * 1000)
      : null;
    let endsAt = timerEnd;
    if (assignment.dueAt && (!endsAt || assignment.dueAt < endsAt)) {
      endsAt = assignment.dueAt;
    }
    const remainingSeconds = endsAt
      ? Math.max(0, Math.floor((endsAt.getTime() - Date.now()) / 1000))
      : null;
    return { endsAt, timerEnd, remainingSeconds };
  }

  private assertAssignmentOpen(assignment: {
    dueAt: Date | null;
    publishAt?: Date | null;
  }) {
    if (!this.isAssignmentPublished(assignment.publishAt)) {
      throw new BadRequestException({
        message: 'This assignment is not open yet',
        code: 'ASSIGNMENT_NOT_PUBLISHED',
        publishAt: assignment.publishAt?.toISOString(),
      });
    }
    if (assignment.dueAt && new Date() > assignment.dueAt) {
      throw new BadRequestException('Assignment deadline has passed');
    }
  }

  private compositionFromPatternSections(sections: any[]) {
    const composition = { mcq: 0, short: 0, long: 0 };
    for (const section of sections || []) {
      const count = Number(section.numberOfQuestions || section.questionsToAttempt || 0);
      const type = String(section.questionType || '').toLowerCase();
      if (type.includes('mcq') || type.includes('objective')) {
        composition.mcq += count;
      } else if (type.includes('long') || type.includes('essay')) {
        composition.long += count;
      } else {
        composition.short += count;
      }
    }
    return composition;
  }

  private questionCountFromPattern(sections: any[]) {
    const composition = this.compositionFromPatternSections(sections);
    return composition.mcq + composition.short + composition.long;
  }

  async createAssignment(
    teacherId: string,
    classroomId: string,
    dto: CreateAssignmentDto,
  ) {
    const classroom = await this.assertTeacherClassroom(teacherId, classroomId);

    if (dto.chapterEnd < dto.chapterStart) {
      throw new BadRequestException('chapterEnd must be >= chapterStart');
    }

    const assignmentMode = dto.assignmentMode || 'practice';
    const publishAt = this.parseOptionalDate(dto.publishAt, 'publishAt');
    const dueAt = dto.dueAt ? new Date(dto.dueAt) : null;
    this.validateAssignmentSchedule(publishAt, dueAt);
    const proctoringEnabled = this.resolveProctoringEnabled(assignmentMode, dto.proctoringEnabled);

    let durationMinutes = dto.durationMinutes;
    const source = dto.source || 'ai';

    if (source === 'bank' && dto.patternId) {
      throw new BadRequestException('Question bank assignments cannot use a paper pattern');
    }

    if (source === 'bank') {
      if (assignmentMode === 'timed' && !durationMinutes) {
        throw new BadRequestException('durationMinutes is required for timed assignments');
      }

      const bankItems = await this.questionBanksService.resolveItemsForAssignment(
        teacherId,
        classroomId,
        dto.bankItemIds ?? [],
      );

      const session = await this.examGenieService.createQuizSessionFromBankItems({
        ownerId: teacherId,
        subject: dto.subject,
        classGrade: classroom.classGrade || '9',
        board: classroom.board || 'Punjab Board',
        chapterStart: dto.chapterStart,
        chapterEnd: dto.chapterEnd,
        items: bankItems,
        bankItemIds: dto.bankItemIds ?? [],
      });

      const assignment = await this.prisma.classAssignment.create({
        data: {
          classroomId,
          teacherId,
          quizSessionId: session.id,
          title: dto.title,
          instructions: dto.instructions,
          assignmentMode,
          durationMinutes: assignmentMode === 'timed' ? durationMinutes : null,
          dueAt,
          publishAt,
          proctoringEnabled,
          allowReviewAfterSubmit: dto.allowReviewAfterSubmit ?? true,
        },
        include: {
          quizSession: {
            select: {
              id: true,
              subject: true,
              questionCount: true,
              quizType: true,
            },
          },
        },
      });

      await this.notifyAssignmentIfPublished(assignment, classroom);
      return { success: true, assignment };
    }

    let patternSections: any[] | undefined;
    let patternName: string | undefined;
    let patternTotalMarks: number | undefined;
    let patternDuration: number | undefined;
    let questionCount = dto.questionCount ?? 15;
    let quizType = dto.quizType ?? 'mcq';

    if (dto.patternId) {
      const classroom = await this.prisma.classroom.findUnique({
        where: { id: classroomId },
        select: { classGrade: true, board: true },
      });
      const pattern = await this.patternsService.resolvePatternForAssignment(
        teacherId,
        dto.patternId,
        dto.subject,
        {
          classGrade: classroom?.classGrade ?? undefined,
          board: classroom?.board ?? undefined,
        },
      );
      patternSections = (pattern.sections as any[]) || [];
      patternName = pattern.name;
      patternTotalMarks = pattern.totalMarks;
      patternDuration = pattern.duration;
      questionCount = this.questionCountFromPattern(patternSections);
      if (questionCount < 1) {
        throw new BadRequestException('Selected paper pattern has no questions defined');
      }
      if (assignmentMode === 'timed' && !durationMinutes && pattern.duration) {
        durationMinutes = pattern.duration;
      }
      quizType = 'all';
      if (!pattern.isBuiltIn) {
        await this.patternsService.markAsUsed(dto.patternId, teacherId);
      }
    }

    if (assignmentMode === 'timed' && !durationMinutes) {
      throw new BadRequestException('durationMinutes is required for timed assignments');
    }

    const generateDto: GenerateQuizDto = {
      subject: dto.subject,
      chapterStart: dto.chapterStart,
      chapterEnd: dto.chapterEnd,
      questionCount,
      mode: dto.mode,
      quizType,
    };

    const session = await this.examGenieService.createQuizSessionFromAi({
      ownerId: teacherId,
      dto: generateDto,
      classGrade: classroom.classGrade || '9',
      board: classroom.board || 'Punjab Board',
      isClassTemplate: true,
      patternSections,
      patternName,
      patternId: dto.patternId,
      patternTotalMarks,
      patternDuration,
    });

    const assignment = await this.prisma.classAssignment.create({
      data: {
        classroomId,
        teacherId,
        quizSessionId: session.id,
        title: dto.title,
        instructions: dto.instructions,
        assignmentMode,
        durationMinutes: assignmentMode === 'timed' ? durationMinutes : null,
        dueAt,
        publishAt,
        proctoringEnabled,
        allowReviewAfterSubmit: dto.allowReviewAfterSubmit ?? true,
      },
      include: {
        quizSession: {
          select: {
            id: true,
            subject: true,
            questionCount: true,
            quizType: true,
          },
        },
      },
    });

    await this.notifyAssignmentIfPublished(assignment, classroom);

    return { success: true, assignment };
  }

  async duplicateAssignment(
    teacherId: string,
    classroomId: string,
    assignmentId: string,
    dto: DuplicateAssignmentDto,
  ) {
    await this.assertTeacherClassroom(teacherId, classroomId);

    const source = await this.prisma.classAssignment.findFirst({
      where: { id: assignmentId, classroomId, teacherId },
    });
    if (!source) {
      throw new NotFoundException('Assignment not found');
    }

    const newSession = await this.examGenieService.cloneClassQuizSession(
      source.quizSessionId,
      teacherId,
    );

    const assignmentMode = dto.assignmentMode ?? source.assignmentMode;
    let durationMinutes: number | null = source.durationMinutes;
    if (assignmentMode === 'timed') {
      durationMinutes = dto.durationMinutes ?? source.durationMinutes ?? 30;
    } else {
      durationMinutes = null;
    }

    const publishAt = dto.publishAt
      ? this.parseOptionalDate(dto.publishAt, 'publishAt')
      : source.publishAt;
    const dueAt = dto.dueAt ? new Date(dto.dueAt) : null;
    this.validateAssignmentSchedule(publishAt, dueAt);
    const proctoringEnabled = this.resolveProctoringEnabled(
      assignmentMode,
      dto.proctoringEnabled ?? source.proctoringEnabled,
    );

    const assignment = await this.prisma.classAssignment.create({
      data: {
        classroomId,
        teacherId,
        quizSessionId: newSession.id,
        title: dto.title ?? `${source.title} (Copy)`,
        instructions: source.instructions,
        assignmentMode,
        durationMinutes: assignmentMode === 'timed' ? durationMinutes : null,
        dueAt,
        publishAt,
        proctoringEnabled,
        allowReviewAfterSubmit: source.allowReviewAfterSubmit,
      },
      include: {
        quizSession: {
          select: {
            id: true,
            subject: true,
            questionCount: true,
            quizType: true,
          },
        },
      },
    });

    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classroomId },
      select: { id: true, name: true },
    });
    if (classroom) {
      await this.notifyAssignmentIfPublished(assignment, classroom);
    }

    return { success: true, assignment };
  }

  async getAssignmentQuiz(studentId: string, assignmentId: string) {
    const assignment = await this.prisma.classAssignment.findUnique({
      where: { id: assignmentId },
    });
    if (!assignment || assignment.status !== 'active') {
      throw new NotFoundException('Assignment not found');
    }

    await this.assertStudentEnrollment(studentId, assignment.classroomId);
    this.assertAssignmentOpen(assignment);

    const result = await this.examGenieService.getQuizSessionForTaking(
      assignment.quizSessionId,
      studentId,
      assignment.allowReviewAfterSubmit,
    );

    let timing: {
      startedAt: Date;
      endsAt: Date | null;
      remainingSeconds: number | null;
      durationMinutes: number | null;
    } | null = null;

    if (assignment.assignmentMode === 'timed' && !result.alreadySubmitted) {
      const attempt = await this.examGenieService.startOrGetClassQuizAttempt(
        assignment.quizSessionId,
        studentId,
      );
      const window = this.computeTimedWindow(assignment, attempt.startedAt);
      timing = {
        startedAt: attempt.startedAt,
        endsAt: window.endsAt,
        remainingSeconds: window.remainingSeconds,
        durationMinutes: assignment.durationMinutes,
      };
    }

    return {
      ...result,
      assignment: {
        id: assignment.id,
        title: assignment.title,
        instructions: assignment.instructions,
        assignmentMode: assignment.assignmentMode,
        durationMinutes: assignment.durationMinutes,
        dueAt: assignment.dueAt,
        publishAt: assignment.publishAt,
        proctoringEnabled: assignment.proctoringEnabled,
        allowReviewAfterSubmit: assignment.allowReviewAfterSubmit,
      },
      timing,
      timeExpired:
        assignment.assignmentMode === 'timed' &&
        timing?.remainingSeconds === 0 &&
        !result.alreadySubmitted,
    };
  }

  async submitAssignment(
    studentId: string,
    assignmentId: string,
    dto: SubmitQuizDto,
  ) {
    const assignment = await this.prisma.classAssignment.findUnique({
      where: { id: assignmentId },
    });
    if (!assignment || assignment.status !== 'active') {
      throw new NotFoundException('Assignment not found');
    }

    await this.assertStudentEnrollment(studentId, assignment.classroomId);

    let timedEndsAt: Date | undefined;
    if (assignment.assignmentMode === 'timed') {
      const inProgress = await this.prisma.quizAttempt.findFirst({
        where: {
          quizSessionId: assignment.quizSessionId,
          userId: studentId,
          completedAt: null,
        },
      });
      if (!inProgress) {
        throw new BadRequestException('Start the timed quiz before submitting');
      }
      const window = this.computeTimedWindow(assignment, inProgress.startedAt);
      timedEndsAt = window.endsAt ?? undefined;
      if (!dto.autoSubmitted) {
        this.assertAssignmentOpen(assignment);
      }
    } else {
      this.assertAssignmentOpen(assignment);
    }

    return this.examGenieService.submitQuizAnswers(
      studentId,
      assignment.quizSessionId,
      dto,
      {
        allowClassTemplate: true,
        timedEndsAt,
        autoSubmitted: dto.autoSubmitted,
        allowReview: assignment.allowReviewAfterSubmit,
      },
    );
  }

  async getClassroomReport(teacherId: string, classroomId: string) {
    await this.assertTeacherClassroom(teacherId, classroomId);

    const enrollments = await this.prisma.classEnrollment.findMany({
      where: { classroomId, status: 'active' },
      include: {
        student: { select: { id: true, name: true, email: true } },
      },
    });

    const assignments = await this.prisma.classAssignment.findMany({
      where: { classroomId },
      orderBy: { createdAt: 'desc' },
      include: {
        quizSession: {
          include: {
            attempts: {
              where: { completedAt: { not: null } },
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
      },
    });

    const reports = assignments.map((a) => {
      const submittedStudentIds = new Set(
        a.quizSession.attempts.map((att) => att.userId),
      );
      const studentResults = enrollments.map((e) => {
        const attempt = a.quizSession.attempts.find(
          (att) => att.userId === e.studentId,
        );
        return {
          studentId: e.studentId,
          name: e.student.name,
          email: e.student.email,
          submitted: !!attempt,
          score: attempt?.score ?? null,
          total: attempt?.total ?? null,
          percentage: attempt?.percentage ?? null,
          completedAt: attempt?.completedAt ?? null,
        };
      });

      return {
        assignmentId: a.id,
        title: a.title,
        status: a.status,
        assignmentMode: a.assignmentMode,
        durationMinutes: a.durationMinutes,
        dueAt: a.dueAt,
        questionCount: a.quizSession.questionCount,
        submittedCount: submittedStudentIds.size,
        totalStudents: enrollments.length,
        averageScore:
          a.quizSession.attempts.length > 0
            ? Math.round(
                (a.quizSession.attempts.reduce(
                  (sum, att) => sum + (att.percentage || 0),
                  0,
                ) /
                  a.quizSession.attempts.length) *
                  10,
              ) / 10
            : null,
        studentResults,
      };
    });

    return { success: true, reports, studentCount: enrollments.length };
  }

  async exportClassroomReportCsv(teacherId: string, classroomId: string) {
    const report = await this.getClassroomReport(teacherId, classroomId);
    const headers = [
      'Assignment',
      'Mode',
      'Due Date',
      'Student',
      'Email',
      'Status',
      'Score',
      'Total',
      'Percentage',
      'Completed At',
    ];
    const rows: string[] = [headers.join(',')];

    for (const r of report.reports) {
      for (const s of r.studentResults) {
        rows.push(
          [
            this.escapeCsv(r.title),
            this.escapeCsv(r.assignmentMode),
            this.escapeCsv(r.dueAt ? new Date(r.dueAt).toISOString() : ''),
            this.escapeCsv(s.name),
            this.escapeCsv(s.email),
            this.escapeCsv(s.submitted ? 'Submitted' : 'Pending'),
            this.escapeCsv(s.score),
            this.escapeCsv(s.total),
            this.escapeCsv(s.percentage),
            this.escapeCsv(
              s.completedAt ? new Date(s.completedAt).toISOString() : '',
            ),
          ].join(','),
        );
      }
    }

    return `\uFEFF${rows.join('\n')}`;
  }
}
