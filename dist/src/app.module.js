"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const documents_module_1 = require("./documents/documents.module");
const exams_module_1 = require("./exams/exams.module");
const patterns_module_1 = require("./patterns/patterns.module");
const past_papers_module_1 = require("./past-papers/past-papers.module");
const exam_assistant_module_1 = require("./exam-assistant/exam-assistant.module");
const admin_module_1 = require("./admin/admin.module");
const chat_module_1 = require("./chat/chat.module");
const exam_genie_module_1 = require("./exam-genie/exam-genie.module");
const classrooms_module_1 = require("./classrooms/classrooms.module");
const notifications_module_1 = require("./notifications/notifications.module");
const realtime_module_1 = require("./realtime/realtime.module");
const class_chat_module_1 = require("./class-chat/class-chat.module");
const question_banks_module_1 = require("./question-banks/question-banks.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            documents_module_1.DocumentsModule,
            exams_module_1.ExamsModule,
            patterns_module_1.PatternsModule,
            past_papers_module_1.PastPapersModule,
            exam_assistant_module_1.ExamAssistantModule,
            admin_module_1.AdminModule,
            chat_module_1.ChatModule,
            exam_genie_module_1.ExamGenieModule,
            classrooms_module_1.ClassroomsModule,
            notifications_module_1.NotificationsModule,
            realtime_module_1.RealtimeModule,
            class_chat_module_1.ClassChatModule,
            question_banks_module_1.QuestionBanksModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map