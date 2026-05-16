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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const admin_service_1 = require("./admin.service");
let AdminController = class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    async uploadOfficialContent(file, body, req) {
        if (req.user.role !== 'ADMIN') {
            throw new Error('Unauthorized: Admin access required');
        }
        return this.adminService.uploadOfficialContent(file, body, req.user.id);
    }
    async getAllUsers(role, search, req) {
        if (req.user.role !== 'ADMIN') {
            throw new Error('Unauthorized: Admin access required');
        }
        return this.adminService.getAllUsers(role, search);
    }
    async updateUserRole(userId, role, req) {
        if (req.user.role !== 'ADMIN') {
            throw new Error('Unauthorized: Admin access required');
        }
        return this.adminService.updateUserRole(userId, role);
    }
    async getPendingContent(req) {
        if (req.user.role !== 'ADMIN') {
            throw new Error('Unauthorized: Admin access required');
        }
        return this.adminService.getPendingContent();
    }
    async approveContent(documentId, req) {
        if (req.user.role !== 'ADMIN') {
            throw new Error('Unauthorized: Admin access required');
        }
        return this.adminService.approveContent(documentId);
    }
    async rejectContent(documentId, req) {
        if (req.user.role !== 'ADMIN') {
            throw new Error('Unauthorized: Admin access required');
        }
        return this.adminService.rejectContent(documentId);
    }
    async getSystemStats(req) {
        if (req.user.role !== 'ADMIN') {
            throw new Error('Unauthorized: Admin access required');
        }
        return this.adminService.getSystemStats();
    }
    async getSettings(req) {
        if (req.user.role !== 'ADMIN') {
            throw new Error('Unauthorized: Admin access required');
        }
        return this.adminService.getSettings();
    }
    async updateSettings(settings, req) {
        if (req.user.role !== 'ADMIN') {
            throw new Error('Unauthorized: Admin access required');
        }
        return this.adminService.updateSettings(settings);
    }
    async startScraping(body, req) {
        if (req.user.role !== 'ADMIN') {
            throw new Error('Unauthorized: Admin access required');
        }
        return this.adminService.startScraping(body.subject, body.tier);
    }
    async getScrapingJobs(req) {
        if (req.user.role !== 'ADMIN') {
            throw new Error('Unauthorized: Admin access required');
        }
        return this.adminService.getScrapingJobs();
    }
    async getScrapingStats(req) {
        if (req.user.role !== 'ADMIN') {
            throw new Error('Unauthorized: Admin access required');
        }
        return this.adminService.getScrapingStats();
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Post)('content/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "uploadOfficialContent", null);
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Query)('role')),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Patch)('users/:id/role'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('role')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUserRole", null);
__decorate([
    (0, common_1.Get)('verification/pending'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPendingContent", null);
__decorate([
    (0, common_1.Patch)('verification/:id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "approveContent", null);
__decorate([
    (0, common_1.Patch)('verification/:id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "rejectContent", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSystemStats", null);
__decorate([
    (0, common_1.Get)('settings'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Patch)('settings'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateSettings", null);
__decorate([
    (0, common_1.Post)('scraping/start'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "startScraping", null);
__decorate([
    (0, common_1.Get)('scraping/jobs'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getScrapingJobs", null);
__decorate([
    (0, common_1.Get)('scraping/stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getScrapingStats", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map