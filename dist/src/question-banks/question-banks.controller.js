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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionBanksController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const question_banks_service_1 = require("./question-banks.service");
const create_question_bank_dto_1 = require("./dto/create-question-bank.dto");
const question_bank_item_dto_1 = require("./dto/question-bank-item.dto");
const import_from_assignment_dto_1 = require("./dto/import-from-assignment.dto");
let QuestionBanksController = class QuestionBanksController {
    questionBanksService;
    constructor(questionBanksService) {
        this.questionBanksService = questionBanksService;
    }
    listBanks(req, classroomId) {
        return this.questionBanksService.listBanks(req.user.id, classroomId);
    }
    createBank(req, classroomId, dto) {
        return this.questionBanksService.createBank(req.user.id, classroomId, dto);
    }
    importFromAssignment(req, classroomId, dto) {
        return this.questionBanksService.importFromAssignment(req.user.id, classroomId, dto);
    }
    getBank(req, bankId) {
        return this.questionBanksService.getBank(req.user.id, bankId);
    }
    updateBank(req, bankId, dto) {
        return this.questionBanksService.updateBank(req.user.id, bankId, dto);
    }
    deleteBank(req, bankId) {
        return this.questionBanksService.deleteBank(req.user.id, bankId);
    }
    addItem(req, bankId, dto) {
        return this.questionBanksService.addItem(req.user.id, bankId, dto);
    }
    updateItem(req, bankId, itemId, dto) {
        return this.questionBanksService.updateItem(req.user.id, bankId, itemId, dto);
    }
    deleteItem(req, bankId, itemId) {
        return this.questionBanksService.deleteItem(req.user.id, bankId, itemId);
    }
};
exports.QuestionBanksController = QuestionBanksController;
__decorate([
    (0, common_1.Get)('classroom/:classroomId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('classroomId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], QuestionBanksController.prototype, "listBanks", null);
__decorate([
    (0, common_1.Post)('classroom/:classroomId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('classroomId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_question_bank_dto_1.CreateQuestionBankDto]),
    __metadata("design:returntype", void 0)
], QuestionBanksController.prototype, "createBank", null);
__decorate([
    (0, common_1.Post)('classroom/:classroomId/import-from-assignment'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('classroomId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, import_from_assignment_dto_1.ImportFromAssignmentDto]),
    __metadata("design:returntype", void 0)
], QuestionBanksController.prototype, "importFromAssignment", null);
__decorate([
    (0, common_1.Get)(':bankId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('bankId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], QuestionBanksController.prototype, "getBank", null);
__decorate([
    (0, common_1.Patch)(':bankId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('bankId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_question_bank_dto_1.UpdateQuestionBankDto]),
    __metadata("design:returntype", void 0)
], QuestionBanksController.prototype, "updateBank", null);
__decorate([
    (0, common_1.Delete)(':bankId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('bankId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], QuestionBanksController.prototype, "deleteBank", null);
__decorate([
    (0, common_1.Post)(':bankId/items'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('bankId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, question_bank_item_dto_1.CreateQuestionBankItemDto]),
    __metadata("design:returntype", void 0)
], QuestionBanksController.prototype, "addItem", null);
__decorate([
    (0, common_1.Patch)(':bankId/items/:itemId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('bankId')),
    __param(2, (0, common_1.Param)('itemId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, question_bank_item_dto_1.UpdateQuestionBankItemDto]),
    __metadata("design:returntype", void 0)
], QuestionBanksController.prototype, "updateItem", null);
__decorate([
    (0, common_1.Delete)(':bankId/items/:itemId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('bankId')),
    __param(2, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], QuestionBanksController.prototype, "deleteItem", null);
exports.QuestionBanksController = QuestionBanksController = __decorate([
    (0, common_1.Controller)('question-banks'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('TEACHER'),
    __metadata("design:paramtypes", [question_banks_service_1.QuestionBanksService])
], QuestionBanksController);
//# sourceMappingURL=question-banks.controller.js.map