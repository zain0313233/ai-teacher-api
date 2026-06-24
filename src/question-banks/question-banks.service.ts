import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionBankDto } from './dto/create-question-bank.dto';
import { UpdateQuestionBankDto } from './dto/create-question-bank.dto';
import {
  CreateQuestionBankItemDto,
  UpdateQuestionBankItemDto,
} from './dto/question-bank-item.dto';
import { ImportFromAssignmentDto } from './dto/import-from-assignment.dto';

@Injectable()
export class QuestionBanksService {
  constructor(private prisma: PrismaService) {}

  private async assertTeacherClassroom(teacherId: string, classroomId: string) {
    const classroom = await this.prisma.classroom.findFirst({
      where: { id: classroomId, teacherId, isActive: true },
    });
    if (!classroom) {
      throw new NotFoundException('Classroom not found');
    }
    return classroom;
  }

  private async assertBankAccess(teacherId: string, bankId: string) {
    const bank = await this.prisma.questionBank.findFirst({
      where: { id: bankId, teacherId },
      include: {
        items: { orderBy: { orderIndex: 'asc' } },
        classroom: { select: { id: true, subject: true } },
      },
    });
    if (!bank) {
      throw new NotFoundException('Question bank not found');
    }
    return bank;
  }

  async listBanks(teacherId: string, classroomId: string) {
    await this.assertTeacherClassroom(teacherId, classroomId);
    const banks = await this.prisma.questionBank.findMany({
      where: { classroomId, teacherId },
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { items: true } } },
    });
    return { success: true, banks };
  }

  async getBank(teacherId: string, bankId: string) {
    const bank = await this.assertBankAccess(teacherId, bankId);
    return { success: true, bank };
  }

  async createBank(
    teacherId: string,
    classroomId: string,
    dto: CreateQuestionBankDto,
  ) {
    const classroom = await this.assertTeacherClassroom(teacherId, classroomId);
    const bank = await this.prisma.questionBank.create({
      data: {
        classroomId,
        teacherId,
        name: dto.name,
        subject: dto.subject ?? classroom.subject,
        description: dto.description,
      },
      include: { _count: { select: { items: true } } },
    });
    return { success: true, bank };
  }

  async updateBank(teacherId: string, bankId: string, dto: UpdateQuestionBankDto) {
    await this.assertBankAccess(teacherId, bankId);
    const bank = await this.prisma.questionBank.update({
      where: { id: bankId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
      },
      include: {
        items: { orderBy: { orderIndex: 'asc' } },
        _count: { select: { items: true } },
      },
    });
    return { success: true, bank };
  }

  async deleteBank(teacherId: string, bankId: string) {
    await this.assertBankAccess(teacherId, bankId);
    await this.prisma.questionBank.delete({ where: { id: bankId } });
    return { success: true, message: 'Question bank deleted' };
  }

  async addItem(teacherId: string, bankId: string, dto: CreateQuestionBankItemDto) {
    const bank = await this.assertBankAccess(teacherId, bankId);
    const questionType = (dto.questionType || 'mcq').toLowerCase();
    const maxOrder = bank.items.reduce((m, i) => Math.max(m, i.orderIndex), 0);

    const item = await this.prisma.questionBankItem.create({
      data: {
        bankId,
        orderIndex: maxOrder + 1,
        questionText: dto.questionText.trim(),
        questionType,
        options: dto.options ?? (questionType === 'mcq' ? {} : {}),
        correctOption: dto.correctOption || '-',
        topicTag: dto.topicTag,
        concept: dto.concept,
        difficulty: dto.difficulty,
        explanation: dto.explanation,
      },
    });

    await this.prisma.questionBank.update({
      where: { id: bankId },
      data: { updatedAt: new Date() },
    });

    return { success: true, item };
  }

  async updateItem(
    teacherId: string,
    bankId: string,
    itemId: string,
    dto: UpdateQuestionBankItemDto,
  ) {
    await this.assertBankAccess(teacherId, bankId);
    const existing = await this.prisma.questionBankItem.findFirst({
      where: { id: itemId, bankId },
    });
    if (!existing) {
      throw new NotFoundException('Question not found in bank');
    }

    const item = await this.prisma.questionBankItem.update({
      where: { id: itemId },
      data: {
        ...(dto.questionText !== undefined ? { questionText: dto.questionText.trim() } : {}),
        ...(dto.questionType !== undefined ? { questionType: dto.questionType.toLowerCase() } : {}),
        ...(dto.options !== undefined ? { options: dto.options } : {}),
        ...(dto.correctOption !== undefined ? { correctOption: dto.correctOption } : {}),
        ...(dto.topicTag !== undefined ? { topicTag: dto.topicTag } : {}),
        ...(dto.concept !== undefined ? { concept: dto.concept } : {}),
        ...(dto.difficulty !== undefined ? { difficulty: dto.difficulty } : {}),
        ...(dto.explanation !== undefined ? { explanation: dto.explanation } : {}),
      },
    });

    await this.prisma.questionBank.update({
      where: { id: bankId },
      data: { updatedAt: new Date() },
    });

    return { success: true, item };
  }

  async deleteItem(teacherId: string, bankId: string, itemId: string) {
    await this.assertBankAccess(teacherId, bankId);
    const existing = await this.prisma.questionBankItem.findFirst({
      where: { id: itemId, bankId },
    });
    if (!existing) {
      throw new NotFoundException('Question not found in bank');
    }
    await this.prisma.questionBankItem.delete({ where: { id: itemId } });
    await this.prisma.questionBank.update({
      where: { id: bankId },
      data: { updatedAt: new Date() },
    });
    return { success: true, message: 'Question removed from bank' };
  }

  async importFromAssignment(
    teacherId: string,
    classroomId: string,
    dto: ImportFromAssignmentDto,
  ) {
    await this.assertTeacherClassroom(teacherId, classroomId);

    const assignment = await this.prisma.classAssignment.findFirst({
      where: { id: dto.assignmentId, classroomId, teacherId },
      include: {
        quizSession: {
          include: { questions: { orderBy: { orderIndex: 'asc' } } },
        },
      },
    });
    if (!assignment?.quizSession?.questions?.length) {
      throw new NotFoundException('Assignment questions not found');
    }

    let bankId = dto.bankId;
    if (bankId) {
      await this.assertBankAccess(teacherId, bankId);
    } else {
      const name =
        dto.bankName?.trim() ||
        `${assignment.title} — saved questions`;
      const created = await this.prisma.questionBank.create({
        data: {
          classroomId,
          teacherId,
          name,
          subject: assignment.quizSession.subject,
          description: `Imported from assignment "${assignment.title}"`,
        },
      });
      bankId = created.id;
    }

    const bank = await this.assertBankAccess(teacherId, bankId);
    const startOrder = bank.items.reduce((m, i) => Math.max(m, i.orderIndex), 0);

    await this.prisma.questionBankItem.createMany({
      data: assignment.quizSession.questions.map((q, idx) => ({
        bankId,
        orderIndex: startOrder + idx + 1,
        questionText: q.questionText,
        questionType: q.questionType,
        options: (q.options ?? {}) as object,
        correctOption: q.correctOption,
        topicTag: q.topicTag,
        concept: q.concept,
        difficulty: q.difficulty,
        explanation: q.explanation,
      })),
    });

    await this.prisma.questionBank.update({
      where: { id: bankId },
      data: { updatedAt: new Date() },
    });

    const updated = await this.assertBankAccess(teacherId, bankId);
    return {
      success: true,
      bank: updated,
      importedCount: assignment.quizSession.questions.length,
    };
  }

  async resolveItemsForAssignment(
    teacherId: string,
    classroomId: string,
    itemIds: string[],
  ) {
    if (!itemIds.length) {
      throw new BadRequestException('Select at least one question from the bank');
    }

    await this.assertTeacherClassroom(teacherId, classroomId);

    const items = await this.prisma.questionBankItem.findMany({
      where: {
        id: { in: itemIds },
        bank: { teacherId, classroomId },
      },
      include: { bank: { select: { subject: true } } },
    });

    if (items.length !== itemIds.length) {
      throw new BadRequestException('One or more selected questions are invalid for this class');
    }

    const orderMap = new Map(itemIds.map((id, i) => [id, i]));
    items.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));

    return items;
  }
}
