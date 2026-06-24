"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionBanksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let QuestionBanksService = class QuestionBanksService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async assertTeacherClassroom(teacherId, classroomId) {
        const classroom = await this.prisma.classroom.findFirst({
            where: { id: classroomId, teacherId, isActive: true },
        });
        if (!classroom) {
            throw new common_1.NotFoundException('Classroom not found');
        }
        return classroom;
    }
    async assertBankAccess(teacherId, bankId) {
        const bank = await this.prisma.questionBank.findFirst({
            where: { id: bankId, teacherId },
            include: {
                items: { orderBy: { orderIndex: 'asc' } },
                classroom: { select: { id: true, subject: true } },
            },
        });
        if (!bank) {
            throw new common_1.NotFoundException('Question bank not found');
        }
        return bank;
    }
    async listBanks(teacherId, classroomId) {
        await this.assertTeacherClassroom(teacherId, classroomId);
        const banks = await this.prisma.questionBank.findMany({
            where: { classroomId, teacherId },
            orderBy: { updatedAt: 'desc' },
            include: { _count: { select: { items: true } } },
        });
        return { success: true, banks };
    }
    async getBank(teacherId, bankId) {
        const bank = await this.assertBankAccess(teacherId, bankId);
        return { success: true, bank };
    }
    async createBank(teacherId, classroomId, dto) {
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
    async updateBank(teacherId, bankId, dto) {
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
    async deleteBank(teacherId, bankId) {
        await this.assertBankAccess(teacherId, bankId);
        await this.prisma.questionBank.delete({ where: { id: bankId } });
        return { success: true, message: 'Question bank deleted' };
    }
    async addItem(teacherId, bankId, dto) {
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
    async updateItem(teacherId, bankId, itemId, dto) {
        await this.assertBankAccess(teacherId, bankId);
        const existing = await this.prisma.questionBankItem.findFirst({
            where: { id: itemId, bankId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Question not found in bank');
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
    async deleteItem(teacherId, bankId, itemId) {
        await this.assertBankAccess(teacherId, bankId);
        const existing = await this.prisma.questionBankItem.findFirst({
            where: { id: itemId, bankId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Question not found in bank');
        }
        await this.prisma.questionBankItem.delete({ where: { id: itemId } });
        await this.prisma.questionBank.update({
            where: { id: bankId },
            data: { updatedAt: new Date() },
        });
        return { success: true, message: 'Question removed from bank' };
    }
    async importFromAssignment(teacherId, classroomId, dto) {
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
            throw new common_1.NotFoundException('Assignment questions not found');
        }
        let bankId = dto.bankId;
        if (bankId) {
            await this.assertBankAccess(teacherId, bankId);
        }
        else {
            const name = dto.bankName?.trim() ||
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
                options: (q.options ?? {}),
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
    async resolveItemsForAssignment(teacherId, classroomId, itemIds) {
        if (!itemIds.length) {
            throw new common_1.BadRequestException('Select at least one question from the bank');
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
            throw new common_1.BadRequestException('One or more selected questions are invalid for this class');
        }
        const orderMap = new Map(itemIds.map((id, i) => [id, i]));
        items.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
        return items;
    }
};
exports.QuestionBanksService = QuestionBanksService;
exports.QuestionBanksService = QuestionBanksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QuestionBanksService);
//# sourceMappingURL=question-banks.service.js.map