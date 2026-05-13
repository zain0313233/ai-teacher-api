"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamAssistantModule = void 0;
const common_1 = require("@nestjs/common");
const exam_assistant_controller_1 = require("./exam-assistant.controller");
const exam_assistant_service_1 = require("./exam-assistant.service");
let ExamAssistantModule = class ExamAssistantModule {
};
exports.ExamAssistantModule = ExamAssistantModule;
exports.ExamAssistantModule = ExamAssistantModule = __decorate([
    (0, common_1.Module)({
        controllers: [exam_assistant_controller_1.ExamAssistantController],
        providers: [exam_assistant_service_1.ExamAssistantService],
        exports: [exam_assistant_service_1.ExamAssistantService],
    })
], ExamAssistantModule);
//# sourceMappingURL=exam-assistant.module.js.map