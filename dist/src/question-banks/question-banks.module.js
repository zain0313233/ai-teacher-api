"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionBanksModule = void 0;
const common_1 = require("@nestjs/common");
const question_banks_controller_1 = require("./question-banks.controller");
const question_banks_service_1 = require("./question-banks.service");
const prisma_module_1 = require("../prisma/prisma.module");
const roles_guard_1 = require("../auth/guards/roles.guard");
let QuestionBanksModule = class QuestionBanksModule {
};
exports.QuestionBanksModule = QuestionBanksModule;
exports.QuestionBanksModule = QuestionBanksModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [question_banks_controller_1.QuestionBanksController],
        providers: [question_banks_service_1.QuestionBanksService, roles_guard_1.RolesGuard],
        exports: [question_banks_service_1.QuestionBanksService],
    })
], QuestionBanksModule);
//# sourceMappingURL=question-banks.module.js.map