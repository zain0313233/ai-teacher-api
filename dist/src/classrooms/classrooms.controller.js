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
exports.ClassroomsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const classrooms_service_1 = require("./classrooms.service");
const analytics_service_1 = require("../analytics/analytics.service");
const create_classroom_dto_1 = require("./dto/create-classroom.dto");
const join_classroom_dto_1 = require("./dto/join-classroom.dto");
const share_material_dto_1 = require("./dto/share-material.dto");
const create_assignment_dto_1 = require("./dto/create-assignment.dto");
const duplicate_assignment_dto_1 = require("./dto/duplicate-assignment.dto");
const submit_quiz_dto_1 = require("../exam-genie/dto/submit-quiz.dto");
let ClassroomsController = class ClassroomsController {
    classroomsService;
    analyticsService;
    constructor(classroomsService, analyticsService) {
        this.classroomsService = classroomsService;
        this.analyticsService = analyticsService;
    }
    createClassroom(req, dto) {
        return this.classroomsService.createClassroom(req.user.id, dto);
    }
    listTeacherClassrooms(req) {
        return this.classroomsService.listTeacherClassrooms(req.user.id);
    }
    getTeacherClassroom(req, id) {
        return this.classroomsService.getTeacherClassroom(req.user.id, id);
    }
    getClassroomReport(req, id) {
        return this.classroomsService.getClassroomReport(req.user.id, id);
    }
    getClassroomAnalytics(req, id) {
        return this.analyticsService.getClassroomAnalytics(req.user.id, id);
    }
    shareMaterial(req, id, dto) {
        return this.classroomsService.shareMaterial(req.user.id, id, dto);
    }
    async exportClassroomReport(req, id, res) {
        const csv = await this.classroomsService.exportClassroomReportCsv(req.user.id, id);
        const filename = `class-report-${id.slice(0, 8)}.csv`;
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(csv);
    }
    createAssignment(req, id, dto) {
        return this.classroomsService.createAssignment(req.user.id, id, dto);
    }
    duplicateAssignment(req, classroomId, assignmentId, dto) {
        return this.classroomsService.duplicateAssignment(req.user.id, classroomId, assignmentId, dto);
    }
    joinClassroom(req, dto) {
        return this.classroomsService.joinClassroom(req.user.id, dto);
    }
    listStudentClassrooms(req) {
        return this.classroomsService.listStudentClassrooms(req.user.id);
    }
    listStudentAssignments(req) {
        return this.classroomsService.listStudentAssignments(req.user.id);
    }
    getStudentClassroom(req, id) {
        return this.classroomsService.getStudentClassroom(req.user.id, id);
    }
    getAssignmentQuiz(req, assignmentId) {
        return this.classroomsService.getAssignmentQuiz(req.user.id, assignmentId);
    }
    submitAssignment(req, assignmentId, dto) {
        return this.classroomsService.submitAssignment(req.user.id, assignmentId, dto);
    }
};
exports.ClassroomsController = ClassroomsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('TEACHER'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_classroom_dto_1.CreateClassroomDto]),
    __metadata("design:returntype", void 0)
], ClassroomsController.prototype, "createClassroom", null);
__decorate([
    (0, common_1.Get)('teacher'),
    (0, roles_decorator_1.Roles)('TEACHER'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ClassroomsController.prototype, "listTeacherClassrooms", null);
__decorate([
    (0, common_1.Get)('teacher/:id'),
    (0, roles_decorator_1.Roles)('TEACHER'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ClassroomsController.prototype, "getTeacherClassroom", null);
__decorate([
    (0, common_1.Get)('teacher/:id/reports'),
    (0, roles_decorator_1.Roles)('TEACHER'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ClassroomsController.prototype, "getClassroomReport", null);
__decorate([
    (0, common_1.Get)('teacher/:id/analytics'),
    (0, roles_decorator_1.Roles)('TEACHER'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ClassroomsController.prototype, "getClassroomAnalytics", null);
__decorate([
    (0, common_1.Post)('teacher/:id/materials'),
    (0, roles_decorator_1.Roles)('TEACHER'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, share_material_dto_1.ShareMaterialDto]),
    __metadata("design:returntype", void 0)
], ClassroomsController.prototype, "shareMaterial", null);
__decorate([
    (0, common_1.Get)('teacher/:id/reports/export'),
    (0, roles_decorator_1.Roles)('TEACHER'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ClassroomsController.prototype, "exportClassroomReport", null);
__decorate([
    (0, common_1.Post)('teacher/:id/assignments'),
    (0, roles_decorator_1.Roles)('TEACHER'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_assignment_dto_1.CreateAssignmentDto]),
    __metadata("design:returntype", void 0)
], ClassroomsController.prototype, "createAssignment", null);
__decorate([
    (0, common_1.Post)('teacher/:classroomId/assignments/:assignmentId/duplicate'),
    (0, roles_decorator_1.Roles)('TEACHER'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('classroomId')),
    __param(2, (0, common_1.Param)('assignmentId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, duplicate_assignment_dto_1.DuplicateAssignmentDto]),
    __metadata("design:returntype", void 0)
], ClassroomsController.prototype, "duplicateAssignment", null);
__decorate([
    (0, common_1.Post)('join'),
    (0, roles_decorator_1.Roles)('USER'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, join_classroom_dto_1.JoinClassroomDto]),
    __metadata("design:returntype", void 0)
], ClassroomsController.prototype, "joinClassroom", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, roles_decorator_1.Roles)('USER'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ClassroomsController.prototype, "listStudentClassrooms", null);
__decorate([
    (0, common_1.Get)('my/assignments'),
    (0, roles_decorator_1.Roles)('USER'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ClassroomsController.prototype, "listStudentAssignments", null);
__decorate([
    (0, common_1.Get)('my/:id'),
    (0, roles_decorator_1.Roles)('USER'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ClassroomsController.prototype, "getStudentClassroom", null);
__decorate([
    (0, common_1.Get)('assignments/:assignmentId/quiz'),
    (0, roles_decorator_1.Roles)('USER'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('assignmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ClassroomsController.prototype, "getAssignmentQuiz", null);
__decorate([
    (0, common_1.Post)('assignments/:assignmentId/submit'),
    (0, roles_decorator_1.Roles)('USER'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('assignmentId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, submit_quiz_dto_1.SubmitQuizDto]),
    __metadata("design:returntype", void 0)
], ClassroomsController.prototype, "submitAssignment", null);
exports.ClassroomsController = ClassroomsController = __decorate([
    (0, common_1.Controller)('classrooms'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [classrooms_service_1.ClassroomsService,
        analytics_service_1.AnalyticsService])
], ClassroomsController);
//# sourceMappingURL=classrooms.controller.js.map