"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassroomsModule = void 0;
const common_1 = require("@nestjs/common");
const classrooms_controller_1 = require("./classrooms.controller");
const classrooms_service_1 = require("./classrooms.service");
const prisma_module_1 = require("../prisma/prisma.module");
const exam_genie_module_1 = require("../exam-genie/exam-genie.module");
const patterns_module_1 = require("../patterns/patterns.module");
const notifications_module_1 = require("../notifications/notifications.module");
const question_banks_module_1 = require("../question-banks/question-banks.module");
const analytics_module_1 = require("../analytics/analytics.module");
const roles_guard_1 = require("../auth/guards/roles.guard");
let ClassroomsModule = class ClassroomsModule {
};
exports.ClassroomsModule = ClassroomsModule;
exports.ClassroomsModule = ClassroomsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, exam_genie_module_1.ExamGenieModule, patterns_module_1.PatternsModule, notifications_module_1.NotificationsModule, question_banks_module_1.QuestionBanksModule, analytics_module_1.AnalyticsModule],
        controllers: [classrooms_controller_1.ClassroomsController],
        providers: [classrooms_service_1.ClassroomsService, roles_guard_1.RolesGuard],
    })
], ClassroomsModule);
//# sourceMappingURL=classrooms.module.js.map