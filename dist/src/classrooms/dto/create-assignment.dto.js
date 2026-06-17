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
exports.CreateAssignmentDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateAssignmentDto {
    title;
    subject;
    chapterStart;
    chapterEnd;
    patternId;
    questionCount;
    mode;
    quizType;
    instructions;
    assignmentMode;
    durationMinutes;
    dueAt;
    allowReviewAfterSubmit;
}
exports.CreateAssignmentDto = CreateAssignmentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssignmentDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssignmentDto.prototype, "subject", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], CreateAssignmentDto.prototype, "chapterStart", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], CreateAssignmentDto.prototype, "chapterEnd", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssignmentDto.prototype, "patternId", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => !o.patternId),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateAssignmentDto.prototype, "questionCount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['normal', 'smart', 'prediction']),
    __metadata("design:type", String)
], CreateAssignmentDto.prototype, "mode", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => !o.patternId),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['mcq', 'short', 'long', 'mcq_short', 'mcq_long', 'short_long', 'all']),
    __metadata("design:type", String)
], CreateAssignmentDto.prototype, "quizType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssignmentDto.prototype, "instructions", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['practice', 'timed']),
    __metadata("design:type", String)
], CreateAssignmentDto.prototype, "assignmentMode", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.assignmentMode === 'timed'),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(5),
    (0, class_validator_1.Max)(180),
    __metadata("design:type", Number)
], CreateAssignmentDto.prototype, "durationMinutes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAssignmentDto.prototype, "dueAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAssignmentDto.prototype, "allowReviewAfterSubmit", void 0);
//# sourceMappingURL=create-assignment.dto.js.map