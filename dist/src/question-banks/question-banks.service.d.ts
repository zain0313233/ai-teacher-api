import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionBankDto } from './dto/create-question-bank.dto';
import { UpdateQuestionBankDto } from './dto/create-question-bank.dto';
import { CreateQuestionBankItemDto, UpdateQuestionBankItemDto } from './dto/question-bank-item.dto';
import { ImportFromAssignmentDto } from './dto/import-from-assignment.dto';
export declare class QuestionBanksService {
    private prisma;
    constructor(prisma: PrismaService);
    private assertTeacherClassroom;
    private assertBankAccess;
    listBanks(teacherId: string, classroomId: string): Promise<{
        success: boolean;
        banks: ({
            _count: {
                items: number;
            };
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            subject: string | null;
            classroomId: string;
            teacherId: string;
            description: string | null;
        })[];
    }>;
    getBank(teacherId: string, bankId: string): Promise<{
        success: boolean;
        bank: {
            classroom: {
                id: string;
                subject: string;
            };
            items: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                options: import("@prisma/client/runtime/client").JsonValue;
                concept: string | null;
                difficulty: string | null;
                questionType: string;
                orderIndex: number;
                questionText: string;
                correctOption: string;
                topicTag: string | null;
                explanation: string | null;
                bankId: string;
            }[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            subject: string | null;
            classroomId: string;
            teacherId: string;
            description: string | null;
        };
    }>;
    createBank(teacherId: string, classroomId: string, dto: CreateQuestionBankDto): Promise<{
        success: boolean;
        bank: {
            _count: {
                items: number;
            };
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            subject: string | null;
            classroomId: string;
            teacherId: string;
            description: string | null;
        };
    }>;
    updateBank(teacherId: string, bankId: string, dto: UpdateQuestionBankDto): Promise<{
        success: boolean;
        bank: {
            _count: {
                items: number;
            };
            items: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                options: import("@prisma/client/runtime/client").JsonValue;
                concept: string | null;
                difficulty: string | null;
                questionType: string;
                orderIndex: number;
                questionText: string;
                correctOption: string;
                topicTag: string | null;
                explanation: string | null;
                bankId: string;
            }[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            subject: string | null;
            classroomId: string;
            teacherId: string;
            description: string | null;
        };
    }>;
    deleteBank(teacherId: string, bankId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    addItem(teacherId: string, bankId: string, dto: CreateQuestionBankItemDto): Promise<{
        success: boolean;
        item: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            options: import("@prisma/client/runtime/client").JsonValue;
            concept: string | null;
            difficulty: string | null;
            questionType: string;
            orderIndex: number;
            questionText: string;
            correctOption: string;
            topicTag: string | null;
            explanation: string | null;
            bankId: string;
        };
    }>;
    updateItem(teacherId: string, bankId: string, itemId: string, dto: UpdateQuestionBankItemDto): Promise<{
        success: boolean;
        item: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            options: import("@prisma/client/runtime/client").JsonValue;
            concept: string | null;
            difficulty: string | null;
            questionType: string;
            orderIndex: number;
            questionText: string;
            correctOption: string;
            topicTag: string | null;
            explanation: string | null;
            bankId: string;
        };
    }>;
    deleteItem(teacherId: string, bankId: string, itemId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    importFromAssignment(teacherId: string, classroomId: string, dto: ImportFromAssignmentDto): Promise<{
        success: boolean;
        bank: {
            classroom: {
                id: string;
                subject: string;
            };
            items: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                options: import("@prisma/client/runtime/client").JsonValue;
                concept: string | null;
                difficulty: string | null;
                questionType: string;
                orderIndex: number;
                questionText: string;
                correctOption: string;
                topicTag: string | null;
                explanation: string | null;
                bankId: string;
            }[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            subject: string | null;
            classroomId: string;
            teacherId: string;
            description: string | null;
        };
        importedCount: number;
    }>;
    resolveItemsForAssignment(teacherId: string, classroomId: string, itemIds: string[]): Promise<({
        bank: {
            subject: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        options: import("@prisma/client/runtime/client").JsonValue;
        concept: string | null;
        difficulty: string | null;
        questionType: string;
        orderIndex: number;
        questionText: string;
        correctOption: string;
        topicTag: string | null;
        explanation: string | null;
        bankId: string;
    })[]>;
}
