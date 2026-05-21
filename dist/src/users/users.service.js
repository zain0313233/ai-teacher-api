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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                plan: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async getMyProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                studentProfile: true,
                teacherProfile: true,
            },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const { password, ...safeUser } = user;
        return safeUser;
    }
    async updateMyProfile(userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (dto.name) {
            await this.prisma.user.update({
                where: { id: userId },
                data: { name: dto.name },
            });
        }
        const { name, ...profileData } = dto;
        if (user.role === 'USER') {
            const { subjectsTaught, classesTaught, institutionType, experienceYears, ...studentData } = profileData;
            await this.prisma.studentProfile.upsert({
                where: { userId },
                create: { userId, educationLevel: 'matric', ...studentData },
                update: { ...studentData },
            });
        }
        else if (user.role === 'TEACHER') {
            const { educationLevel, classGrade, group, degree, semester, subjects, targetExam, ...teacherData } = profileData;
            await this.prisma.teacherProfile.upsert({
                where: { userId },
                create: { userId, ...teacherData },
                update: { ...teacherData },
            });
        }
        return this.getMyProfile(userId);
    }
    async updateProfile(userId, data) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                plan: true,
                updatedAt: true,
            },
        });
        return user;
    }
    async updatePlan(userId, plan) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { plan },
            select: {
                id: true,
                name: true,
                email: true,
                plan: true,
            },
        });
        return user;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map