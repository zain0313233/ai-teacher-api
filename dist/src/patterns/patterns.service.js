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
exports.PatternsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PatternsService = class PatternsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createPattern(userId, createPatternDto) {
        const pattern = await this.prisma.pattern.create({
            data: {
                userId,
                name: createPatternDto.name,
                subject: createPatternDto.subject,
                totalMarks: createPatternDto.totalMarks,
                duration: createPatternDto.duration,
                sections: createPatternDto.sections,
            },
        });
        return pattern;
    }
    async getUserPatterns(userId) {
        const patterns = await this.prisma.pattern.findMany({
            where: { userId },
            orderBy: { lastUsed: 'desc' },
        });
        return patterns;
    }
    async getPatternById(patternId, userId) {
        const pattern = await this.prisma.pattern.findFirst({
            where: {
                id: patternId,
                userId,
            },
        });
        if (!pattern) {
            throw new common_1.NotFoundException('Pattern not found');
        }
        return pattern;
    }
    async updatePattern(patternId, userId, updatePatternDto) {
        const pattern = await this.prisma.pattern.findFirst({
            where: {
                id: patternId,
                userId,
            },
        });
        if (!pattern) {
            throw new common_1.NotFoundException('Pattern not found');
        }
        const updatedPattern = await this.prisma.pattern.update({
            where: { id: patternId },
            data: updatePatternDto,
        });
        return updatedPattern;
    }
    async deletePattern(patternId, userId) {
        const pattern = await this.prisma.pattern.findFirst({
            where: {
                id: patternId,
                userId,
            },
        });
        if (!pattern) {
            throw new common_1.NotFoundException('Pattern not found');
        }
        await this.prisma.pattern.delete({
            where: { id: patternId },
        });
        return { message: 'Pattern deleted successfully' };
    }
    async markAsUsed(patternId, userId) {
        const pattern = await this.prisma.pattern.findFirst({
            where: {
                id: patternId,
                userId,
            },
        });
        if (!pattern) {
            throw new common_1.NotFoundException('Pattern not found');
        }
        await this.prisma.pattern.update({
            where: { id: patternId },
            data: { lastUsed: new Date() },
        });
    }
    async getPatternStats(userId) {
        const patterns = await this.prisma.pattern.findMany({
            where: { userId },
        });
        const totalPatterns = patterns.length;
        const subjectCounts = patterns.reduce((acc, pattern) => {
            acc[pattern.subject] = (acc[pattern.subject] || 0) + 1;
            return acc;
        }, {});
        const mostUsed = Object.entries(subjectCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
        const avgMarks = patterns.length > 0
            ? Math.round(patterns.reduce((sum, p) => sum + p.totalMarks, 0) / patterns.length)
            : 0;
        const avgDuration = patterns.length > 0
            ? Math.round(patterns.reduce((sum, p) => sum + p.duration, 0) / patterns.length / 60)
            : 0;
        return {
            totalPatterns,
            mostUsed,
            avgMarks,
            avgDuration: `${avgDuration}h`,
        };
    }
};
exports.PatternsService = PatternsService;
exports.PatternsService = PatternsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PatternsService);
//# sourceMappingURL=patterns.service.js.map