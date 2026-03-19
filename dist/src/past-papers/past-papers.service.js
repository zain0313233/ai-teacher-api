"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PastPapersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const fs = __importStar(require("fs"));
let PastPapersService = class PastPapersService {
    prisma;
    fastApiUrl = process.env.FASTAPI_URL || 'http://localhost:8000';
    constructor(prisma) {
        this.prisma = prisma;
    }
    async uploadPastPaper(userId, file, metadata) {
        try {
            const isMultiYear = metadata.isMultiYear === 'true';
            let year;
            let yearFrom = null;
            let yearTo = null;
            if (isMultiYear) {
                yearFrom = parseInt(metadata.yearFrom);
                yearTo = parseInt(metadata.yearTo);
                if (isNaN(yearFrom) || isNaN(yearTo)) {
                    throw new Error('Valid year range (yearFrom and yearTo) is required for multi-year papers');
                }
                year = yearFrom;
            }
            else {
                year = parseInt(metadata.year);
                if (isNaN(year)) {
                    throw new Error('Valid year is required for single-year papers');
                }
            }
            const formData = new form_data_1.default();
            formData.append('file', fs.createReadStream(file.path), file.originalname);
            formData.append('user_id', userId);
            formData.append('subject', metadata.subject);
            formData.append('year', year.toString());
            formData.append('class_name', metadata.class);
            formData.append('board', metadata.board || 'Punjab Board');
            formData.append('exam_type', metadata.examType || 'final');
            const uploadResponse = await axios_1.default.post(`${this.fastApiUrl}/past-papers/upload`, formData, {
                headers: formData.getHeaders(),
                timeout: 60000,
            });
            const fileUrl = uploadResponse.data.file_url;
            const fileSize = uploadResponse.data.file_size;
            const pastPaper = await this.prisma.pastPaper.create({
                data: {
                    userId,
                    subject: metadata.subject,
                    examType: metadata.examType || 'final',
                    year: year,
                    board: metadata.board || 'Punjab Board',
                    class: metadata.class,
                    fileName: file.originalname,
                    fileUrl: fileUrl,
                    fileSize: fileSize,
                    processed: false,
                },
            });
            this.processPastPaperAsync(pastPaper.id, fileUrl, metadata, userId, year);
            return {
                success: true,
                pastPaperId: pastPaper.id,
                message: isMultiYear
                    ? `Past paper uploaded for years ${yearFrom}-${yearTo}. Processing started.`
                    : 'Past paper uploaded and processing started',
            };
        }
        catch (error) {
            console.error('Error uploading past paper:', error.message);
            throw error;
        }
    }
    async processPastPaperAsync(pastPaperId, fileUrl, metadata, userId, year) {
        try {
            const requestData = {
                user_id: userId,
                subject: metadata.subject,
                year: year,
                class_name: metadata.class,
                board: metadata.board || 'Punjab Board',
                exam_type: metadata.examType || 'final',
                file_url: fileUrl,
            };
            const processResponse = await axios_1.default.post(`${this.fastApiUrl}/past-papers/process`, requestData, {
                timeout: 600000,
            });
            await this.prisma.pastPaper.update({
                where: { id: pastPaperId },
                data: { processed: true },
            });
            console.log(`Past paper ${pastPaperId} processed successfully`);
        }
        catch (error) {
            console.error(`Error processing past paper ${pastPaperId}:`, error.message);
            try {
                await this.prisma.pastPaper.update({
                    where: { id: pastPaperId },
                    data: { processed: true },
                });
            }
            catch (dbError) {
                console.error(`Failed to update database for ${pastPaperId}:`, dbError.message);
            }
        }
    }
    async getUserPastPapers(userId) {
        const pastPapers = await this.prisma.pastPaper.findMany({
            where: { userId },
            orderBy: { year: 'desc' },
        });
        return pastPapers;
    }
    async getPatterns(userId, subject, chapters, mode = 'smart') {
        try {
            const response = await axios_1.default.post(`${this.fastApiUrl}/past-papers/patterns/retrieve`, {
                user_id: userId,
                subject,
                chapters,
                mode,
            });
            return response.data;
        }
        catch (error) {
            console.error('Error retrieving patterns:', error.message);
            throw error;
        }
    }
    async deletePastPaper(pastPaperId, userId) {
        const pastPaper = await this.prisma.pastPaper.findFirst({
            where: { id: pastPaperId, userId },
        });
        if (!pastPaper) {
            throw new Error('Past paper not found');
        }
        await this.prisma.pastPaper.delete({
            where: { id: pastPaperId },
        });
        return { message: 'Past paper deleted successfully' };
    }
};
exports.PastPapersService = PastPapersService;
exports.PastPapersService = PastPapersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PastPapersService);
//# sourceMappingURL=past-papers.service.js.map