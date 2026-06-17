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
exports.ExamGenieService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const prisma_service_1 = require("../prisma/prisma.service");
const past_papers_service_1 = require("../past-papers/past-papers.service");
const patterns_service_1 = require("../patterns/patterns.service");
let ExamGenieService = class ExamGenieService {
    prisma;
    pastPapersService;
    patternsService;
    fastApiUrl = process.env.FASTAPI_URL || 'http://localhost:8000';
    constructor(prisma, pastPapersService, patternsService) {
        this.prisma = prisma;
        this.pastPapersService = pastPapersService;
        this.patternsService = patternsService;
    }
    async getStudentContext(userId) {
        const profile = await this.prisma.studentProfile.findUnique({
            where: { userId },
        });
        return profile;
    }
    mapBoard(board) {
        if (!board)
            return 'Punjab Board';
        const map = {
            punjab: 'Punjab Board',
            federal: 'Federal Board',
            sindh: 'Sindh Board',
            kpk: 'KPK Board',
            cambridge: 'Cambridge',
        };
        return map[board.toLowerCase()] || board;
    }
    async getMaterials(userId, subject) {
        const subjectFilter = subject
            ? { equals: subject, mode: 'insensitive' }
            : undefined;
        const [documents, pastPapers] = await Promise.all([
            this.prisma.document.findMany({
                where: {
                    userId,
                    ...(subjectFilter ? { subject: subjectFilter } : {}),
                },
                orderBy: { uploadDate: 'desc' },
                select: {
                    id: true,
                    fileName: true,
                    documentType: true,
                    subject: true,
                    processed: true,
                    chapterNumber: true,
                    chapterName: true,
                    uploadDate: true,
                },
            }),
            this.prisma.pastPaper.findMany({
                where: {
                    userId,
                    ...(subjectFilter ? { subject: subjectFilter } : {}),
                },
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    fileName: true,
                    subject: true,
                    year: true,
                    processed: true,
                    board: true,
                    class: true,
                    createdAt: true,
                    extractionStatus: true,
                    questionCount: true,
                    extractionMethod: true,
                },
            }),
        ]);
        const readyForQuiz = documents.some((d) => d.processed) || pastPapers.some((p) => p.processed);
        return {
            success: true,
            documents,
            pastPapers,
            readyForQuiz,
        };
    }
    async getPredictions(userId, subject, chapters, mode = 'prediction') {
        const coverage = await this.pastPapersService.getPatternCoverage(userId, subject, chapters, mode === 'prediction' ? 'prediction' : mode);
        const patterns = await this.pastPapersService.getPatterns(userId, subject, chapters, mode);
        const rawPatterns = patterns.patterns || [];
        const highChanceTopics = rawPatterns.slice(0, 12).map((p) => ({
            concept: p.concept,
            method: p.method,
            chapter: p.chapter ?? null,
            priorityScore: p.priority_score ?? p.priorityScore ?? 0,
            frequency: p.frequency ?? 0,
            trend: p.trend ?? 'STABLE',
            sampleQuestions: (p.sample_questions || p.sampleQuestions || []).filter((q) => q),
        }));
        const guidance = coverage.guidance;
        let message = highChanceTopics.length > 0
            ? 'Based on your uploaded past papers and pattern analysis'
            : guidance?.message ||
                'No pattern data yet — upload and approve past papers to unlock predictions';
        if (highChanceTopics.length === 0 && coverage.patternCount === 0) {
            message = guidance?.title
                ? `${guidance.title}. ${guidance.message}`
                : message;
        }
        return {
            success: true,
            mode: patterns.mode || mode,
            highChanceTopics,
            totalPatterns: patterns.total_patterns ?? highChanceTopics.length,
            coverage,
            marksPatternHint: {
                mcq: 12,
                short: 36,
                long: 32,
                source: 'default_punjab_secondary',
            },
            message,
        };
    }
    async generateQuiz(userId, dto) {
        if (dto.chapterEnd < dto.chapterStart) {
            throw new common_1.BadRequestException('chapterEnd must be >= chapterStart');
        }
        const profile = await this.getStudentContext(userId);
        let generateDto = { ...dto };
        let patternSections;
        let patternName;
        let patternId;
        let patternTotalMarks;
        let patternDuration;
        if (dto.patternId) {
            const resolved = await this.patternsService.resolvePatternForStudentQuiz(userId, dto.patternId, dto.subject);
            patternSections = resolved.sections || [];
            patternName = resolved.name;
            patternId = resolved.patternId;
            patternTotalMarks = resolved.totalMarks;
            patternDuration = resolved.duration;
            const fromPattern = this.patternsService.questionCountFromSections(patternSections);
            if (fromPattern < 1) {
                throw new common_1.BadRequestException('Selected paper pattern has no questions defined');
            }
            generateDto = {
                ...dto,
                questionCount: fromPattern,
                quizType: 'all',
            };
        }
        const session = await this.createQuizSessionFromAi({
            ownerId: userId,
            dto: generateDto,
            classGrade: profile?.classGrade || '9',
            board: this.mapBoard(profile?.board),
            isClassTemplate: false,
            patternSections,
            patternName,
            patternId,
            patternTotalMarks,
            patternDuration,
        });
        return {
            success: true,
            quiz: await this.sanitizeQuizForTakingWithPattern(session, userId),
        };
    }
    async getAvailablePatterns(userId, subject) {
        if (!subject?.trim()) {
            throw new common_1.BadRequestException('subject query parameter is required');
        }
        return this.patternsService.getAvailablePatternsForStudent(userId, subject);
    }
    async getWeakTopicRecommendations(userId, subject) {
        const subjectFilter = subject
            ? { equals: subject, mode: 'insensitive' }
            : undefined;
        const wrongAnswers = await this.prisma.attemptAnswer.findMany({
            where: {
                isCorrect: false,
                attempt: {
                    userId,
                    completedAt: { not: null },
                    quizSession: subjectFilter ? { subject: subjectFilter } : undefined,
                },
            },
            include: {
                attempt: {
                    include: {
                        quizSession: {
                            select: {
                                subject: true,
                                chapterStart: true,
                                chapterEnd: true,
                            },
                        },
                    },
                },
            },
            orderBy: { attempt: { completedAt: 'desc' } },
            take: 200,
        });
        const questionIds = [...new Set(wrongAnswers.map((a) => a.questionId))];
        const questions = questionIds.length
            ? await this.prisma.quizQuestion.findMany({
                where: { id: { in: questionIds } },
                select: {
                    id: true,
                    topicTag: true,
                    concept: true,
                    difficulty: true,
                    questionType: true,
                },
            })
            : [];
        const questionMap = new Map(questions.map((q) => [q.id, q]));
        const topicStats = new Map();
        for (const ans of wrongAnswers) {
            const q = questionMap.get(ans.questionId);
            const session = ans.attempt.quizSession;
            const topic = q?.topicTag?.trim() ||
                q?.concept?.trim() ||
                (session.chapterStart
                    ? `Chapter ${session.chapterStart}${session.chapterEnd && session.chapterEnd !== session.chapterStart ? `–${session.chapterEnd}` : ''}`
                    : 'General');
            const key = `${session.subject}::${topic}`;
            const existing = topicStats.get(key) || {
                topic,
                subject: session.subject,
                chapterLabel: session.chapterStart && session.chapterEnd
                    ? session.chapterStart === session.chapterEnd
                        ? `Ch ${session.chapterStart}`
                        : `Ch ${session.chapterStart}–${session.chapterEnd}`
                    : '',
                wrong: 0,
                total: 0,
                concepts: new Set(),
            };
            existing.wrong += 1;
            if (q?.concept)
                existing.concepts.add(q.concept);
            topicStats.set(key, existing);
        }
        const allAnswers = await this.prisma.attemptAnswer.findMany({
            where: {
                attempt: {
                    userId,
                    completedAt: { not: null },
                    quizSession: subjectFilter ? { subject: subjectFilter } : undefined,
                },
            },
            select: { questionId: true, isCorrect: true },
        });
        const totalByQuestion = new Map();
        for (const a of allAnswers) {
            totalByQuestion.set(a.questionId, (totalByQuestion.get(a.questionId) || 0) + 1);
        }
        for (const ans of wrongAnswers) {
            const q = questionMap.get(ans.questionId);
            const session = ans.attempt.quizSession;
            const topic = q?.topicTag?.trim() ||
                q?.concept?.trim() ||
                (session.chapterStart ? `Chapter ${session.chapterStart}` : 'General');
            const key = `${session.subject}::${topic}`;
            const row = topicStats.get(key);
            if (row) {
                row.total = Math.max(row.total, totalByQuestion.get(ans.questionId) || row.wrong);
            }
        }
        const weakTopics = [...topicStats.values()]
            .map((row) => {
            const accuracy = row.total > 0 ? Math.round(((row.total - row.wrong) / row.total) * 1000) / 10 : 0;
            return {
                topic: row.topic,
                subject: row.subject,
                chapterLabel: row.chapterLabel,
                wrongCount: row.wrong,
                accuracy,
                concepts: [...row.concepts].slice(0, 3),
                recommendation: row.wrong >= 3
                    ? `Practice ${row.topic} — missed ${row.wrong} question(s). Ask Ustaad AI or generate a focused quiz.`
                    : `Review ${row.topic} once more to strengthen this area.`,
            };
        })
            .sort((a, b) => b.wrongCount - a.wrongCount)
            .slice(0, 8);
        const completedAttempts = await this.prisma.quizAttempt.count({
            where: {
                userId,
                completedAt: { not: null },
                quizSession: subjectFilter ? { subject: subjectFilter } : undefined,
            },
        });
        return {
            success: true,
            completedAttempts,
            weakTopics,
            summary: weakTopics.length === 0
                ? completedAttempts === 0
                    ? 'Take a few quizzes to unlock personalized weak-topic recommendations.'
                    : 'Great work — no recurring weak topics detected from recent attempts.'
                : `Focus on ${weakTopics.slice(0, 2).map((t) => t.topic).join(' and ')} next.`,
        };
    }
    async ensureDbReady() {
        try {
            await this.prisma.$connect();
        }
        catch {
        }
    }
    isMcqQuestion(questionType) {
        return (questionType || 'mcq').toLowerCase() === 'mcq';
    }
    async gradeSubjectiveAnswers(subject, questions, answerMap) {
        const payload = questions
            .filter((q) => !this.isMcqQuestion(q.questionType))
            .map((q) => ({
            question_id: q.id,
            question_text: q.questionText,
            question_type: q.questionType,
            answer_guideline: q.explanation || '',
            student_answer: answerMap.get(q.id) || '',
        }))
            .filter((item) => item.student_answer.length > 0);
        if (payload.length === 0) {
            return new Map();
        }
        const response = await axios_1.default.post(`${this.fastApiUrl}/exam-genie/grade-answers`, { subject, answers: payload }, { timeout: 120000 });
        const gradeMap = new Map();
        for (const row of response.data?.results || []) {
            gradeMap.set(row.question_id, {
                isCorrect: Boolean(row.is_correct),
                score: row.score ?? (row.is_correct ? 1 : 0),
                feedback: row.feedback || '',
            });
        }
        return gradeMap;
    }
    buildPaperPatternSectionGroups(questions, sections) {
        const sorted = [...questions].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
        let cursor = 0;
        return (sections || []).map((section) => {
            const count = Number(section.numberOfQuestions || 0);
            const sectionQuestions = sorted.slice(cursor, cursor + count);
            cursor += count;
            const toAttempt = Number(section.questionsToAttempt) || Number(section.numberOfQuestions) || count;
            const marksPerQuestion = Number(section.marksPerQuestion) || 1;
            const qType = String(section.questionType || '');
            const isMcq = qType.toLowerCase().includes('mcq') || qType.toLowerCase().includes('objective');
            const attemptAny = !isMcq &&
                section.questionsToAttempt &&
                section.questionsToAttempt < section.numberOfQuestions;
            return {
                name: section.name,
                questionType: section.questionType,
                numberOfQuestions: count,
                questionsToAttempt: toAttempt,
                marksPerQuestion,
                notes: section.notes || null,
                sectionMarks: toAttempt * marksPerQuestion,
                attemptLabel: attemptAny ? `Attempt any ${section.questionsToAttempt} questions` : null,
                questions: sectionQuestions,
            };
        });
    }
    async resolvePaperPatternForQuiz(sourceSummary, subject, userId) {
        if (!sourceSummary?.patternId && !sourceSummary?.patternSections?.length) {
            return null;
        }
        let sections = sourceSummary.patternSections || [];
        let name = sourceSummary.patternName;
        let totalMarks = sourceSummary.patternTotalMarks;
        let duration = sourceSummary.patternDuration;
        if ((!sections || sections.length === 0) && sourceSummary.patternId && userId) {
            try {
                const resolved = await this.patternsService.resolvePatternForStudentQuiz(userId, sourceSummary.patternId, subject);
                sections = resolved.sections || [];
                name = name || resolved.name;
                totalMarks = totalMarks ?? resolved.totalMarks;
                duration = duration ?? resolved.duration;
            }
            catch {
                return null;
            }
        }
        if (!sections.length)
            return null;
        return {
            name: name || 'Paper Pattern',
            subject,
            totalMarks: totalMarks ?? null,
            duration: duration ?? null,
            sections,
        };
    }
    async createQuizSessionFromAi(params) {
        const { ownerId, dto, classGrade, board, isClassTemplate = false, patternSections, patternName, patternId, patternTotalMarks, patternDuration, } = params;
        const questionCount = dto.questionCount ?? 15;
        const mode = dto.mode ?? 'smart';
        const quizType = dto.quizType ?? 'mcq';
        let aiResult;
        try {
            const response = await axios_1.default.post(`${this.fastApiUrl}/exam-genie/generate-quiz`, {
                user_id: ownerId,
                subject: dto.subject,
                class_name: classGrade,
                board,
                chapter_start: dto.chapterStart,
                chapter_end: dto.chapterEnd,
                question_count: questionCount,
                mode,
                quiz_type: quizType,
                source_document_ids: dto.sourceDocumentIds ?? [],
                source_past_paper_ids: dto.sourcePastPaperIds ?? [],
                pattern_sections: patternSections ?? [],
                pattern_name: patternName ?? '',
            }, { timeout: 180000 });
            aiResult = response.data;
        }
        catch (error) {
            const status = error.response?.status;
            const detail = error.response?.data?.detail ||
                error.message ||
                'Quiz generation failed';
            if (status === 429) {
                throw new common_1.HttpException(detail, common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
            throw new common_1.InternalServerErrorException(detail);
        }
        const questions = aiResult.questions || [];
        await this.ensureDbReady();
        return this.prisma.quizSession.create({
            data: {
                userId: ownerId,
                subject: dto.subject,
                board,
                class: classGrade,
                chapterStart: dto.chapterStart,
                chapterEnd: dto.chapterEnd,
                quizType,
                mode,
                questionCount: questions.length,
                status: 'ready',
                isClassTemplate,
                sourceSummary: {
                    ...(aiResult.sourceSummary ?? {}),
                    ...(patternId
                        ? {
                            patternId,
                            patternName,
                            patternSections: patternSections ?? [],
                            patternTotalMarks: patternTotalMarks ?? null,
                            patternDuration: patternDuration ?? null,
                        }
                        : {}),
                },
                questions: {
                    create: questions.map((q, index) => ({
                        orderIndex: index + 1,
                        questionText: q.questionText,
                        questionType: (q.questionType || 'mcq').toLowerCase(),
                        options: q.options || {},
                        correctOption: q.correctOption || '-',
                        topicTag: q.topicTag,
                        concept: q.concept,
                        difficulty: q.difficulty,
                        explanation: q.explanation || q.answerGuideline || null,
                    })),
                },
            },
            include: {
                questions: { orderBy: { orderIndex: 'asc' } },
            },
        });
    }
    async cloneClassQuizSession(sourceQuizId, ownerId) {
        const source = await this.prisma.quizSession.findFirst({
            where: { id: sourceQuizId, isClassTemplate: true },
            include: {
                questions: { orderBy: { orderIndex: 'asc' } },
            },
        });
        if (!source || source.questions.length === 0) {
            throw new common_1.NotFoundException('Quiz template not found');
        }
        return this.prisma.quizSession.create({
            data: {
                userId: ownerId,
                subject: source.subject,
                board: source.board,
                class: source.class,
                chapterStart: source.chapterStart,
                chapterEnd: source.chapterEnd,
                quizType: source.quizType,
                mode: source.mode,
                questionCount: source.questions.length,
                status: 'ready',
                isClassTemplate: true,
                sourceSummary: source.sourceSummary ?? {},
                questions: {
                    create: source.questions.map((q) => ({
                        orderIndex: q.orderIndex,
                        questionText: q.questionText,
                        questionType: q.questionType,
                        options: (q.options ?? {}),
                        correctOption: q.correctOption,
                        topicTag: q.topicTag,
                        concept: q.concept,
                        difficulty: q.difficulty,
                        explanation: q.explanation,
                    })),
                },
            },
            include: {
                questions: { orderBy: { orderIndex: 'asc' } },
            },
        });
    }
    async listQuizzes(userId) {
        const sessions = await this.prisma.quizSession.findMany({
            where: { userId, isClassTemplate: false },
            orderBy: { createdAt: 'desc' },
            include: {
                attempts: {
                    where: { userId },
                    orderBy: { completedAt: 'desc' },
                    take: 1,
                },
                _count: { select: { questions: true } },
            },
        });
        return {
            success: true,
            quizzes: sessions.map((s) => ({
                id: s.id,
                subject: s.subject,
                chapterStart: s.chapterStart,
                chapterEnd: s.chapterEnd,
                questionCount: s._count.questions,
                status: s.status,
                mode: s.mode,
                quizType: s.quizType,
                createdAt: s.createdAt,
                latestAttempt: s.attempts[0]
                    ? {
                        score: s.attempts[0].score,
                        total: s.attempts[0].total,
                        percentage: s.attempts[0].percentage,
                        completedAt: s.attempts[0].completedAt,
                    }
                    : null,
            })),
        };
    }
    async getQuiz(userId, quizId) {
        const session = await this.prisma.quizSession.findFirst({
            where: { id: quizId, userId, isClassTemplate: false },
            include: {
                questions: { orderBy: { orderIndex: 'asc' } },
                attempts: {
                    where: { userId, completedAt: { not: null } },
                    orderBy: { completedAt: 'desc' },
                    take: 1,
                    include: { answers: true },
                },
            },
        });
        if (!session) {
            throw new common_1.NotFoundException('Quiz not found');
        }
        const latestAttempt = session.attempts[0];
        if (latestAttempt) {
            return {
                success: true,
                quiz: await this.sanitizeQuizForReviewWithPattern(session, latestAttempt, true, userId),
            };
        }
        return {
            success: true,
            quiz: await this.sanitizeQuizForTakingWithPattern(session, userId),
        };
    }
    async startOrGetClassQuizAttempt(quizSessionId, userId) {
        const session = await this.prisma.quizSession.findFirst({
            where: { id: quizSessionId, isClassTemplate: true },
            include: { _count: { select: { questions: true } } },
        });
        if (!session) {
            throw new common_1.NotFoundException('Assignment quiz not found');
        }
        const completed = await this.prisma.quizAttempt.findFirst({
            where: { quizSessionId, userId, completedAt: { not: null } },
        });
        if (completed) {
            throw new common_1.BadRequestException('You have already submitted this assignment');
        }
        const inProgress = await this.prisma.quizAttempt.findFirst({
            where: { quizSessionId, userId, completedAt: null },
        });
        if (inProgress)
            return inProgress;
        return this.prisma.quizAttempt.create({
            data: {
                quizSessionId,
                userId,
                total: session._count.questions,
            },
        });
    }
    async submitQuizAnswers(userId, quizId, dto, options) {
        const session = await this.prisma.quizSession.findFirst({
            where: {
                id: quizId,
                ...(options?.allowClassTemplate
                    ? { isClassTemplate: true }
                    : { userId, isClassTemplate: false }),
            },
            include: { questions: { orderBy: { orderIndex: 'asc' } } },
        });
        if (!session) {
            throw new common_1.NotFoundException('Quiz not found');
        }
        const existingAttempt = await this.prisma.quizAttempt.findFirst({
            where: { quizSessionId: quizId, userId, completedAt: { not: null } },
        });
        if (existingAttempt) {
            throw new common_1.BadRequestException('You have already submitted this assignment');
        }
        if (options?.timedEndsAt) {
            const graceMs = (options.graceSeconds ?? 30) * 1000;
            const deadline = options.timedEndsAt.getTime() + graceMs;
            if (Date.now() > deadline) {
                throw new common_1.BadRequestException('Time has expired for this assignment');
            }
        }
        const inProgressAttempt = await this.prisma.quizAttempt.findFirst({
            where: { quizSessionId: quizId, userId, completedAt: null },
        });
        const answerMap = new Map(dto.answers.map((a) => [a.questionId, (a.selectedOption || '').trim()]));
        const subjectiveQuestions = session.questions.filter((q) => !this.isMcqQuestion(q.questionType));
        let subjectiveGrades = new Map();
        if (subjectiveQuestions.length > 0) {
            try {
                subjectiveGrades = await this.gradeSubjectiveAnswers(session.subject, session.questions, answerMap);
            }
            catch (error) {
                const detail = error.response?.data?.detail ||
                    error.message ||
                    'Subjective answer grading failed';
                throw new common_1.InternalServerErrorException(detail);
            }
        }
        await this.ensureDbReady();
        const allowReview = options?.allowReview !== false;
        let score = 0;
        let gradableTotal = 0;
        const results = session.questions.map((q) => {
            const selectedRaw = answerMap.get(q.id) || '';
            const selected = selectedRaw.length ? selectedRaw : null;
            const isMcq = this.isMcqQuestion(q.questionType);
            let isCorrect = null;
            let feedback;
            if (isMcq) {
                gradableTotal += 1;
                isCorrect =
                    selected !== null && selected.toUpperCase() === q.correctOption.toUpperCase();
                if (isCorrect)
                    score += 1;
            }
            else {
                gradableTotal += 1;
                const grade = subjectiveGrades.get(q.id);
                if (selected) {
                    isCorrect = grade?.isCorrect ?? false;
                    feedback = grade?.feedback;
                    if (isCorrect)
                        score += 1;
                }
                else {
                    isCorrect = false;
                }
            }
            return {
                questionId: q.id,
                questionText: q.questionText,
                questionType: q.questionType || 'mcq',
                options: allowReview ? q.options : undefined,
                selectedOption: selected,
                correctOption: allowReview ? q.correctOption : undefined,
                isCorrect: allowReview ? isCorrect : null,
                explanation: allowReview ? feedback || q.explanation : undefined,
            };
        });
        const total = gradableTotal;
        const percentage = total > 0 ? Math.round((score / total) * 1000) / 10 : 0;
        const answerRows = session.questions.map((q) => {
            const selectedRaw = answerMap.get(q.id) || '';
            const selected = selectedRaw.length ? selectedRaw : null;
            const isMcq = this.isMcqQuestion(q.questionType);
            let isCorrect = null;
            if (isMcq) {
                isCorrect =
                    selected !== null && selected.toUpperCase() === q.correctOption.toUpperCase();
            }
            else {
                isCorrect = selected ? (subjectiveGrades.get(q.id)?.isCorrect ?? false) : false;
            }
            return {
                questionId: q.id,
                selectedOption: selected,
                isCorrect,
            };
        });
        let attempt;
        if (inProgressAttempt) {
            await this.prisma.attemptAnswer.deleteMany({
                where: { attemptId: inProgressAttempt.id },
            });
            attempt = await this.prisma.quizAttempt.update({
                where: { id: inProgressAttempt.id },
                data: {
                    score,
                    total,
                    percentage,
                    completedAt: new Date(),
                    answers: { create: answerRows },
                },
            });
        }
        else {
            attempt = await this.prisma.quizAttempt.create({
                data: {
                    quizSessionId: session.id,
                    userId,
                    score,
                    total,
                    percentage,
                    completedAt: new Date(),
                    answers: { create: answerRows },
                },
            });
        }
        if (!options?.allowClassTemplate) {
            await this.prisma.quizSession.update({
                where: { id: session.id },
                data: { status: 'completed' },
            });
        }
        return {
            success: true,
            attempt: {
                id: attempt.id,
                score,
                total,
                percentage,
                allowReview,
                reviewDisabled: !allowReview,
                results: allowReview ? results : [],
            },
        };
    }
    async submitQuiz(userId, quizId, dto) {
        return this.submitQuizAnswers(userId, quizId, dto);
    }
    async getQuizSessionForTaking(quizId, studentUserId, allowReview = true) {
        const session = await this.prisma.quizSession.findFirst({
            where: { id: quizId, isClassTemplate: true },
            include: {
                questions: { orderBy: { orderIndex: 'asc' } },
                attempts: {
                    where: { userId: studentUserId, completedAt: { not: null } },
                    orderBy: { completedAt: 'desc' },
                    take: 1,
                    include: { answers: true },
                },
            },
        });
        if (!session)
            throw new common_1.NotFoundException('Assignment quiz not found');
        const latestAttempt = session.attempts[0];
        if (latestAttempt) {
            return {
                success: true,
                quiz: await this.sanitizeQuizForReviewWithPattern(session, latestAttempt, allowReview, studentUserId),
                alreadySubmitted: true,
            };
        }
        return {
            success: true,
            quiz: await this.sanitizeQuizForTakingWithPattern(session, studentUserId),
            alreadySubmitted: false,
        };
    }
    async sanitizeQuizForTakingWithPattern(session, userId) {
        const base = this.sanitizeQuizForTaking(session);
        const pattern = await this.resolvePaperPatternForQuiz(session.sourceSummary, session.subject, userId);
        if (!pattern)
            return base;
        const totalQuestions = pattern.sections.reduce((sum, s) => sum + Number(s.numberOfQuestions || 0), 0);
        return {
            ...base,
            paperPattern: {
                name: pattern.name,
                subject: pattern.subject,
                totalMarks: pattern.totalMarks,
                duration: pattern.duration,
                totalSections: pattern.sections.length,
                totalQuestions,
                sections: this.buildPaperPatternSectionGroups(base.questions, pattern.sections),
            },
        };
    }
    async sanitizeQuizForReviewWithPattern(session, attempt, allowReview = true, userId) {
        const base = this.sanitizeQuizForReview(session, attempt, allowReview);
        const pattern = await this.resolvePaperPatternForQuiz(session.sourceSummary, session.subject, userId);
        if (!pattern)
            return base;
        const totalQuestions = pattern.sections.reduce((sum, s) => sum + Number(s.numberOfQuestions || 0), 0);
        return {
            ...base,
            paperPattern: {
                name: pattern.name,
                subject: pattern.subject,
                totalMarks: pattern.totalMarks,
                duration: pattern.duration,
                totalSections: pattern.sections.length,
                totalQuestions,
                sections: this.buildPaperPatternSectionGroups(base.questions, pattern.sections),
            },
        };
    }
    sanitizeQuizForTaking(session) {
        return {
            id: session.id,
            subject: session.subject,
            board: session.board,
            class: session.class,
            chapterStart: session.chapterStart,
            chapterEnd: session.chapterEnd,
            questionCount: session.questions.length,
            status: session.status,
            mode: session.mode,
            quizType: session.quizType,
            sourceSummary: session.sourceSummary,
            questions: session.questions.map((q) => ({
                id: q.id,
                orderIndex: q.orderIndex,
                questionText: q.questionText,
                questionType: q.questionType,
                options: q.options,
                topicTag: q.topicTag,
                difficulty: q.difficulty,
                answerGuideline: q.questionType === 'mcq' ? null : q.explanation,
            })),
        };
    }
    sanitizeQuizForReview(session, attempt, allowReview = true) {
        const answerByQuestion = new Map(attempt.answers.map((a) => [a.questionId, a]));
        if (!allowReview) {
            return {
                id: session.id,
                subject: session.subject,
                chapterStart: session.chapterStart,
                chapterEnd: session.chapterEnd,
                status: session.status,
                allowReview: false,
                reviewDisabled: true,
                attempt: {
                    score: attempt.score,
                    total: attempt.total,
                    percentage: attempt.percentage,
                },
                questions: [],
            };
        }
        return {
            id: session.id,
            subject: session.subject,
            chapterStart: session.chapterStart,
            chapterEnd: session.chapterEnd,
            status: session.status,
            allowReview: true,
            reviewDisabled: false,
            attempt: {
                score: attempt.score,
                total: attempt.total,
                percentage: attempt.percentage,
            },
            questions: session.questions.map((q) => {
                const ans = answerByQuestion.get(q.id);
                return {
                    id: q.id,
                    orderIndex: q.orderIndex,
                    questionText: q.questionText,
                    questionType: q.questionType,
                    options: q.options,
                    topicTag: q.topicTag,
                    difficulty: q.difficulty,
                    selectedOption: ans?.selectedOption ?? null,
                    correctOption: q.correctOption,
                    isCorrect: ans?.isCorrect ?? false,
                    explanation: q.explanation,
                };
            }),
        };
    }
};
exports.ExamGenieService = ExamGenieService;
exports.ExamGenieService = ExamGenieService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        past_papers_service_1.PastPapersService,
        patterns_service_1.PatternsService])
], ExamGenieService);
//# sourceMappingURL=exam-genie.service.js.map