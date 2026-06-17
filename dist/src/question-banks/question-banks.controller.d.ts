import { QuestionBanksService } from './question-banks.service';
import { CreateQuestionBankDto, UpdateQuestionBankDto } from './dto/create-question-bank.dto';
import { CreateQuestionBankItemDto, UpdateQuestionBankItemDto } from './dto/question-bank-item.dto';
import { ImportFromAssignmentDto } from './dto/import-from-assignment.dto';
export declare class QuestionBanksController {
    private readonly questionBanksService;
    constructor(questionBanksService: QuestionBanksService);
    listBanks(req: any, classroomId: string): Promise<{
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
    createBank(req: any, classroomId: string, dto: CreateQuestionBankDto): Promise<{
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
    importFromAssignment(req: any, classroomId: string, dto: ImportFromAssignmentDto): Promise<{
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
    getBank(req: any, bankId: string): Promise<{
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
    updateBank(req: any, bankId: string, dto: UpdateQuestionBankDto): Promise<{
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
    deleteBank(req: any, bankId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    addItem(req: any, bankId: string, dto: CreateQuestionBankItemDto): Promise<{
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
    updateItem(req: any, bankId: string, itemId: string, dto: UpdateQuestionBankItemDto): Promise<{
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
    deleteItem(req: any, bankId: string, itemId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
