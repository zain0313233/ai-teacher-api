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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const supabase_service_1 = require("../documents/supabase.service");
const axios_1 = __importDefault(require("axios"));
let AdminService = class AdminService {
    prisma;
    supabaseService;
    fastApiUrl = process.env.FASTAPI_URL || 'http://localhost:8000';
    constructor(prisma, supabaseService) {
        this.prisma = prisma;
        this.supabaseService = supabaseService;
    }
    async uploadOfficialContent(file, metadata, adminId) {
        try {
            const fileUrl = await this.supabaseService.uploadFile(file);
            const uploadMode = metadata.uploadMode || 'auto';
            const chapterNumber = metadata.chapterNumber ? parseInt(metadata.chapterNumber) : null;
            const chapterName = metadata.chapterName || null;
            const document = await this.prisma.document.create({
                data: {
                    userId: adminId,
                    fileName: file.originalname,
                    fileType: file.mimetype,
                    fileUrl: fileUrl,
                    fileSize: file.size,
                    subject: metadata.subject,
                    level: metadata.level,
                    class: metadata.class,
                    educationSystem: metadata.educationSystem,
                    documentType: metadata.documentType,
                    language: metadata.language || 'english',
                    year: metadata.year ? parseInt(metadata.year) : null,
                    board: metadata.board,
                    isOfficial: true,
                    verified: true,
                    processed: false,
                    uploadMode: uploadMode,
                    chapterNumber: chapterNumber,
                    chapterName: chapterName,
                },
            });
            this.processDocumentAsync(document.id, fileUrl, file.mimetype, adminId, {
                subject: metadata.subject,
                level: metadata.level,
                class: metadata.class,
                educationSystem: metadata.educationSystem,
                documentType: metadata.documentType,
                chapterMetadata: chapterNumber && chapterName ? {
                    chapterNumber,
                    chapterName,
                } : undefined,
            }, uploadMode);
            return {
                success: true,
                message: `Official content uploaded successfully${chapterNumber ? ` (Chapter ${chapterNumber})` : chapterName ? ` (${chapterName})` : ''}`,
                document,
                uploadInfo: {
                    uploadMode,
                    chapterNumber,
                    chapterName,
                },
            };
        }
        catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }
    async processDocumentAsync(documentId, fileUrl, fileType, userId, metadata, uploadMode) {
        try {
            const payload = {
                document_id: documentId,
                file_url: fileUrl,
                file_type: fileType,
                user_id: userId,
                subject: metadata.subject,
                level: metadata.level,
                class: metadata.class,
                education_system: metadata.educationSystem,
                document_type: metadata.documentType,
                upload_mode: uploadMode,
                is_official: true,
            };
            if (metadata.chapterMetadata) {
                payload.chapter_number = metadata.chapterMetadata.chapterNumber;
                payload.chapter_name = metadata.chapterMetadata.chapterName;
            }
            const response = await axios_1.default.post(`${this.fastApiUrl}/documents/process`, payload, {
                timeout: 1800000,
            });
            if (response.data.chapters && response.data.chapters.length > 0) {
                await this.storeChapters(documentId, response.data.chapters);
            }
            if (uploadMode === 'chapter' && metadata.chapterMetadata) {
                await this.prisma.chapter.upsert({
                    where: {
                        documentId_chapterNumber: {
                            documentId,
                            chapterNumber: metadata.chapterMetadata.chapterNumber,
                        },
                    },
                    create: {
                        documentId,
                        chapterNumber: metadata.chapterMetadata.chapterNumber,
                        chapterName: metadata.chapterMetadata.chapterName,
                        startPosition: 0,
                        endPosition: 0,
                    },
                    update: {
                        chapterName: metadata.chapterMetadata.chapterName,
                    },
                });
            }
            await this.prisma.document.update({
                where: { id: documentId },
                data: { processed: true },
            });
        }
        catch (error) {
            console.error('FastAPI processing error:', error.message);
            await this.prisma.document.update({
                where: { id: documentId },
                data: { processed: false },
            });
        }
    }
    async storeChapters(documentId, chapters) {
        for (const chapter of chapters) {
            await this.prisma.chapter.create({
                data: {
                    documentId,
                    chapterNumber: chapter.chapter_number,
                    chapterName: chapter.chapter_name,
                    startPosition: chapter.start_position,
                    endPosition: chapter.end_position,
                },
            });
        }
    }
    async getAllUsers(role, search) {
        const where = {};
        if (role) {
            where.role = role;
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        const users = await this.prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                plan: true,
                isVerified: true,
                createdAt: true,
                _count: {
                    select: {
                        documents: true,
                        exams: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return {
            success: true,
            users,
            total: users.length,
        };
    }
    async updateUserRole(userId, newRole) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { role: newRole },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });
        return {
            success: true,
            message: 'User role updated successfully',
            user,
        };
    }
    async deleteUser(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true, name: true, email: true },
        });
        if (!user) {
            throw new Error('User not found');
        }
        if (user.role === 'ADMIN') {
            throw new Error('Cannot delete admin accounts');
        }
        await this.prisma.user.delete({ where: { id: userId } });
        return {
            success: true,
            message: `User "${user.name}" deleted successfully`,
        };
    }
    async getPendingContent() {
        const documents = await this.prisma.document.findMany({
            where: {
                verified: false,
                isOfficial: false,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
            },
            orderBy: { uploadDate: 'desc' },
        });
        return {
            success: true,
            documents,
            total: documents.length,
        };
    }
    async approveContent(documentId) {
        const document = await this.prisma.document.update({
            where: { id: documentId },
            data: { verified: true },
        });
        return {
            success: true,
            message: 'Content approved successfully',
            document,
        };
    }
    async rejectContent(documentId) {
        const document = await this.prisma.document.update({
            where: { id: documentId },
            data: { verified: false },
        });
        return {
            success: true,
            message: 'Content rejected',
            document,
        };
    }
    async getSystemStats() {
        const [totalUsers, totalStudents, totalTeachers, totalAdmins, totalDocuments, verifiedDocuments, pendingDocuments, processedDocuments, processingDocuments, totalExams,] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { role: 'USER' } }),
            this.prisma.user.count({ where: { role: 'TEACHER' } }),
            this.prisma.user.count({ where: { role: 'ADMIN' } }),
            this.prisma.document.count(),
            this.prisma.document.count({ where: { verified: true } }),
            this.prisma.document.count({ where: { verified: false } }),
            this.prisma.document.count({ where: { processed: true } }),
            this.prisma.document.count({ where: { processed: false } }),
            this.prisma.exam.count(),
        ]);
        return {
            success: true,
            stats: {
                users: {
                    total: totalUsers,
                    students: totalStudents,
                    teachers: totalTeachers,
                    admins: totalAdmins,
                },
                documents: {
                    total: totalDocuments,
                    verified: verifiedDocuments,
                    pending: pendingDocuments,
                    processed: processedDocuments,
                    processing: processingDocuments,
                },
                exams: {
                    total: totalExams,
                },
            },
        };
    }
    async getSettings() {
        return {
            success: true,
            settings: {
                boards: [
                    { id: '1', name: 'Punjab Board', code: 'punjab_board', active: true },
                    { id: '2', name: 'Federal Board', code: 'federal_board', active: true },
                    { id: '3', name: 'Sindh Board', code: 'sindh_board', active: true },
                    { id: '4', name: 'KPK Board', code: 'kpk_board', active: true },
                    { id: '5', name: 'Balochistan Board', code: 'balochistan_board', active: true },
                ],
                subjects: [
                    { id: '1', name: 'Mathematics', code: 'mathematics', active: true },
                    { id: '2', name: 'Physics', code: 'physics', active: true },
                    { id: '3', name: 'Chemistry', code: 'chemistry', active: true },
                    { id: '4', name: 'Biology', code: 'biology', active: true },
                    { id: '5', name: 'English', code: 'english', active: true },
                    { id: '6', name: 'Urdu', code: 'urdu', active: true },
                    { id: '7', name: 'Computer Science', code: 'computer_science', active: true },
                    { id: '8', name: 'Islamiat', code: 'islamiat', active: true },
                    { id: '9', name: 'Pakistan Studies', code: 'pakistan_studies', active: true },
                ],
                systemConfig: {
                    maxUploadSize: 50,
                    allowedFileTypes: ['pdf', 'jpg', 'jpeg', 'png'],
                    enableOCR: true,
                    enableVisionModel: true,
                    defaultLanguage: 'english',
                },
            },
        };
    }
    async updateSettings(settings) {
        return {
            success: true,
            message: 'Settings updated successfully',
            settings,
        };
    }
    async getOfficialContent(filters) {
        const where = { isOfficial: true };
        if (filters.subject)
            where.subject = filters.subject;
        if (filters.documentType)
            where.documentType = filters.documentType;
        if (filters.search) {
            where.OR = [
                { fileName: { contains: filters.search, mode: 'insensitive' } },
                { subject: { contains: filters.search, mode: 'insensitive' } },
                { board: { contains: filters.search, mode: 'insensitive' } },
                { chapterName: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        const documents = await this.prisma.document.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, email: true } },
                chapters: { orderBy: { chapterNumber: 'asc' } },
            },
            orderBy: { uploadDate: 'desc' },
        });
        return { success: true, documents, total: documents.length };
    }
    async deleteOfficialContent(documentId) {
        const document = await this.prisma.document.findFirst({
            where: { id: documentId, isOfficial: true },
        });
        if (!document) {
            throw new Error('Official document not found');
        }
        try {
            await this.supabaseService.deleteFile(document.fileUrl);
        }
        catch (err) {
            console.warn('Supabase delete failed (file may already be gone):', err.message);
        }
        await this.prisma.chapter.deleteMany({ where: { documentId } });
        await this.prisma.document.delete({ where: { id: documentId } });
        return { success: true, message: 'Official content deleted successfully' };
    }
    async startScraping(subject, tier) {
        const { exec } = require('child_process');
        const path = require('path');
        const jobId = `job_${Date.now()}`;
        const pythonScript = path.join(process.cwd(), '..', 'ai-teacher-ai-engine', 'scrapers', 'run_scraping.py');
        const command = `python "${pythonScript}" --subject ${subject.toLowerCase()} --tier ${tier.toLowerCase()}`;
        console.log(`Starting scraping job: ${jobId}`);
        console.log(`Command: ${command}`);
        exec(command, { cwd: path.dirname(pythonScript) }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Scraping error for job ${jobId}:`, error);
                return;
            }
            if (stderr) {
                console.error(`Scraping stderr for job ${jobId}:`, stderr);
            }
            console.log(`Scraping output for job ${jobId}:`, stdout);
        });
        return {
            success: true,
            message: 'Scraping job started successfully',
            jobId,
            subject,
            tier,
            status: 'running',
            estimatedTime: '5-10 minutes',
            note: 'Check server console for progress logs',
        };
    }
    async getScrapingJobs() {
        return {
            success: true,
            jobs: [
                {
                    id: 'job_1',
                    subject: 'physics',
                    tier: 'conceptual',
                    source: 'Wikipedia + Khan Academy',
                    status: 'completed',
                    itemsScraped: 45,
                    startedAt: new Date(Date.now() - 3600000).toISOString(),
                    completedAt: new Date(Date.now() - 3000000).toISOString(),
                },
            ],
        };
    }
    async getScrapingStats() {
        const [totalScraped, conceptualCount, researchCount,] = await Promise.all([
            this.prisma.document.count({
                where: { contentTier: { in: ['conceptual', 'research'] } },
            }),
            this.prisma.document.count({
                where: { contentTier: 'conceptual' },
            }),
            this.prisma.document.count({
                where: { contentTier: 'research' },
            }),
        ]);
        const documents = await this.prisma.document.findMany({
            where: { contentTier: { in: ['conceptual', 'research'] } },
            select: { trustScore: true },
        });
        const avgTrustScore = documents.length > 0
            ? documents.reduce((sum, doc) => sum + doc.trustScore, 0) / documents.length
            : 0;
        return {
            success: true,
            stats: {
                totalScraped,
                conceptual: conceptualCount,
                research: researchCount,
                avgTrustScore: Math.round(avgTrustScore * 100) / 100,
                lastUpdate: new Date().toISOString(),
            },
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        supabase_service_1.SupabaseService])
], AdminService);
//# sourceMappingURL=admin.service.js.map