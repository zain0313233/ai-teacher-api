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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../auth/email.service");
const realtime_gateway_1 = require("../realtime/realtime.gateway");
let NotificationsService = class NotificationsService {
    prisma;
    emailService;
    realtime;
    configService;
    constructor(prisma, emailService, realtime, configService) {
        this.prisma = prisma;
        this.emailService = emailService;
        this.realtime = realtime;
        this.configService = configService;
    }
    frontendBase() {
        return (this.configService.get('FRONTEND_URL') || 'http://localhost:3000').replace(/\/$/, '');
    }
    async getPreferences(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                emailNotifyAssignments: true,
                emailNotifyDueReminders: true,
                inAppNotifications: true,
            },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return { success: true, preferences: user };
    }
    async updatePreferences(userId, dto) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                ...(dto.emailNotifyAssignments !== undefined && {
                    emailNotifyAssignments: dto.emailNotifyAssignments,
                }),
                ...(dto.emailNotifyDueReminders !== undefined && {
                    emailNotifyDueReminders: dto.emailNotifyDueReminders,
                }),
                ...(dto.inAppNotifications !== undefined && {
                    inAppNotifications: dto.inAppNotifications,
                }),
            },
            select: {
                emailNotifyAssignments: true,
                emailNotifyDueReminders: true,
                inAppNotifications: true,
            },
        });
        return { success: true, preferences: user };
    }
    async listForUser(userId, limit = 30, unreadOnly = false) {
        const notifications = await this.prisma.notification.findMany({
            where: {
                userId,
                ...(unreadOnly ? { readAt: null } : {}),
            },
            orderBy: { createdAt: 'desc' },
            take: Math.min(limit, 100),
        });
        const unreadCount = await this.prisma.notification.count({
            where: { userId, readAt: null },
        });
        return { success: true, notifications, unreadCount };
    }
    async markRead(userId, notificationId) {
        const row = await this.prisma.notification.findFirst({
            where: { id: notificationId, userId },
        });
        if (!row)
            throw new common_1.NotFoundException('Notification not found');
        await this.prisma.notification.update({
            where: { id: notificationId },
            data: { readAt: new Date() },
        });
        const unreadCount = await this.prisma.notification.count({
            where: { userId, readAt: null },
        });
        return { success: true, unreadCount };
    }
    async markAllRead(userId) {
        await this.prisma.notification.updateMany({
            where: { userId, readAt: null },
            data: { readAt: new Date() },
        });
        return { success: true, unreadCount: 0 };
    }
    async createForUser(userId, payload, options) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { inAppNotifications: true },
        });
        if (!user?.inAppNotifications) {
            return null;
        }
        const notification = await this.prisma.notification.create({
            data: {
                userId,
                type: payload.type,
                title: payload.title,
                body: payload.body,
                link: payload.link,
                metadata: payload.metadata ?? undefined,
            },
        });
        if (options?.pushRealtime !== false) {
            this.realtime.emitToUser(userId, 'notification', notification);
        }
        return notification;
    }
    async notifyClassStudents(classroomId, payload, emailFn) {
        const enrollments = await this.prisma.classEnrollment.findMany({
            where: { classroomId, status: 'active' },
            include: {
                student: { select: { id: true, name: true, email: true, emailNotifyAssignments: true } },
            },
        });
        for (const enrollment of enrollments) {
            await this.createForUser(enrollment.studentId, payload);
            if (emailFn && enrollment.student.emailNotifyAssignments) {
                await emailFn(enrollment.student);
            }
        }
    }
    async notifyNewAssignment(assignment, classroom) {
        const link = `${this.frontendBase()}/dashboard/classes/assignment/${assignment.id}`;
        const dueText = assignment.dueAt
            ? ` Due ${assignment.dueAt.toLocaleString()}.`
            : '';
        await this.notifyClassStudents(classroom.id, {
            type: 'assignment_new',
            title: 'New assignment',
            body: `${assignment.title} was posted in ${classroom.name}.${dueText}`,
            link,
            metadata: {
                assignmentId: assignment.id,
                classroomId: classroom.id,
            },
        }, async (student) => {
            await this.emailService.sendNewAssignmentEmail(student.email, student.name, {
                className: classroom.name,
                assignmentTitle: assignment.title,
                dueAt: assignment.dueAt,
                assignmentMode: assignment.assignmentMode,
                link,
            });
        });
    }
    async notifyMaterialShared(classroom, materialTitle) {
        const link = `${this.frontendBase()}/dashboard/classes/${classroom.id}`;
        await this.notifyClassStudents(classroom.id, {
            type: 'material_shared',
            title: 'New material shared',
            body: `${materialTitle} was shared in ${classroom.name}.`,
            link,
            metadata: { classroomId: classroom.id },
        });
    }
    async processDueReminders() {
        const now = new Date();
        const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const assignments = await this.prisma.classAssignment.findMany({
            where: {
                status: 'active',
                dueAt: { gt: now, lte: in24h },
                OR: [{ publishAt: null }, { publishAt: { lte: now } }],
            },
            include: {
                classroom: { select: { id: true, name: true } },
            },
        });
        let sent = 0;
        for (const assignment of assignments) {
            const enrollments = await this.prisma.classEnrollment.findMany({
                where: { classroomId: assignment.classroomId, status: 'active' },
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            emailNotifyDueReminders: true,
                        },
                    },
                },
            });
            for (const enrollment of enrollments) {
                const submitted = await this.prisma.quizAttempt.findFirst({
                    where: {
                        quizSessionId: assignment.quizSessionId,
                        userId: enrollment.studentId,
                        completedAt: { not: null },
                    },
                });
                if (submitted)
                    continue;
                const already = await this.prisma.assignmentReminder.findUnique({
                    where: {
                        assignmentId_userId_reminderType: {
                            assignmentId: assignment.id,
                            userId: enrollment.studentId,
                            reminderType: 'due_24h',
                        },
                    },
                });
                if (already)
                    continue;
                const link = `${this.frontendBase()}/dashboard/classes/assignment/${assignment.id}`;
                await this.createForUser(enrollment.studentId, {
                    type: 'assignment_due_soon',
                    title: 'Assignment due in 24 hours',
                    body: `${assignment.title} in ${assignment.classroom.name} is due soon.`,
                    link,
                    metadata: { assignmentId: assignment.id, classroomId: assignment.classroomId },
                });
                if (enrollment.student.emailNotifyDueReminders && assignment.dueAt) {
                    await this.emailService.sendAssignmentDueReminderEmail(enrollment.student.email, enrollment.student.name, {
                        className: assignment.classroom.name,
                        assignmentTitle: assignment.title,
                        dueAt: assignment.dueAt,
                        link,
                    });
                }
                await this.prisma.assignmentReminder.create({
                    data: {
                        assignmentId: assignment.id,
                        userId: enrollment.studentId,
                        reminderType: 'due_24h',
                    },
                });
                sent += 1;
            }
        }
        if (sent > 0) {
            console.log(`📬 Sent ${sent} assignment due reminder(s)`);
        }
        return sent;
    }
    async processScheduledPublications() {
        const now = new Date();
        const assignments = await this.prisma.classAssignment.findMany({
            where: {
                status: 'active',
                publishNotifiedAt: null,
                OR: [{ publishAt: null }, { publishAt: { lte: now } }],
            },
            include: {
                classroom: { select: { id: true, name: true } },
            },
        });
        let sent = 0;
        for (const assignment of assignments) {
            if (assignment.publishAt && assignment.publishAt > now) {
                continue;
            }
            await this.notifyNewAssignment(assignment, assignment.classroom);
            await this.prisma.classAssignment.update({
                where: { id: assignment.id },
                data: { publishNotifiedAt: new Date() },
            });
            sent += 1;
        }
        if (sent > 0) {
            console.log(`📬 Published ${sent} scheduled assignment(s)`);
        }
        return sent;
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService,
        realtime_gateway_1.RealtimeGateway,
        config_1.ConfigService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map