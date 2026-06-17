"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamGenieModule = void 0;
const common_1 = require("@nestjs/common");
const exam_genie_controller_1 = require("./exam-genie.controller");
const exam_genie_service_1 = require("./exam-genie.service");
const prisma_module_1 = require("../prisma/prisma.module");
const past_papers_module_1 = require("../past-papers/past-papers.module");
const patterns_module_1 = require("../patterns/patterns.module");
const analytics_module_1 = require("../analytics/analytics.module");
let ExamGenieModule = class ExamGenieModule {
};
exports.ExamGenieModule = ExamGenieModule;
exports.ExamGenieModule = ExamGenieModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, past_papers_module_1.PastPapersModule, patterns_module_1.PatternsModule, analytics_module_1.AnalyticsModule],
        controllers: [exam_genie_controller_1.ExamGenieController],
        providers: [exam_genie_service_1.ExamGenieService],
        exports: [exam_genie_service_1.ExamGenieService],
    })
], ExamGenieModule);
//# sourceMappingURL=exam-genie.module.js.map