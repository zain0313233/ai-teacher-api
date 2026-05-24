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
const groq_sdk_1 = require("groq-sdk");
const core_1 = require("@tavily/core");
const pecta_templates_1 = require("./pecta-templates");
let PatternsService = class PatternsService {
    prisma;
    groqClient;
    tavilyClient = null;
    constructor(prisma) {
        this.prisma = prisma;
        this.groqClient = new groq_sdk_1.Groq({
            apiKey: process.env.GROQ_API_KEY,
        });
        if (process.env.TAVILY_API_KEY) {
            this.tavilyClient = (0, core_1.tavily)({ apiKey: process.env.TAVILY_API_KEY });
        }
        else {
            console.warn('⚠️  TAVILY_API_KEY not found. Web search will be disabled.');
        }
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
    async resolvePatternForGeneration(userId, subject, patternId) {
        if (patternId) {
            const pattern = await this.getPatternById(patternId, userId);
            return this.toGenerationPayload(pattern);
        }
        const patterns = await this.prisma.pattern.findMany({
            where: { userId },
            orderBy: [{ lastUsed: 'desc' }, { updatedAt: 'desc' }],
        });
        if (!patterns.length) {
            return null;
        }
        const norm = subject.trim().toLowerCase();
        const match = patterns.find((p) => p.subject.trim().toLowerCase() === norm) ||
            patterns.find((p) => p.subject.trim().toLowerCase().includes(norm)) ||
            patterns.find((p) => norm.includes(p.subject.trim().toLowerCase())) ||
            patterns[0];
        return match ? this.toGenerationPayload(match) : null;
    }
    toGenerationPayload(pattern) {
        return {
            name: pattern.name,
            subject: pattern.subject,
            totalMarks: pattern.totalMarks,
            duration: pattern.duration,
            sections: pattern.sections,
            instructions: 'Read all questions carefully. Answer all questions.',
        };
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
    async previewPatternWithAI(userId, userPrompt) {
        return this.createPatternWithAI(userId, userPrompt, false);
    }
    async createPatternWithAI(userId, userPrompt, save = true) {
        try {
            console.log('=== AI Pattern Creation Started (3-Layer Resolver) ===');
            console.log('User Prompt:', userPrompt);
            const { patternData, source } = await this.generatePatternData(userPrompt);
            if (!save) {
                return {
                    success: true,
                    pattern: patternData,
                    source,
                    preview: true,
                    message: 'Pattern preview ready — review sections before saving',
                };
            }
            const pattern = await this.prisma.pattern.create({
                data: {
                    userId,
                    name: patternData.name,
                    subject: patternData.subject,
                    totalMarks: patternData.totalMarks,
                    duration: patternData.duration,
                    sections: patternData.sections,
                },
            });
            console.log(`=== Pattern Created [source=${source}] ===`);
            console.log('Pattern ID:', pattern.id);
            return {
                success: true,
                pattern,
                source,
                message: `Pattern created successfully (source: ${source})`,
            };
        }
        catch (error) {
            console.error('AI pattern creation error:', error);
            throw error;
        }
    }
    async generatePatternData(userPrompt) {
        const syllabusVariant = (0, pecta_templates_1.detectSyllabusVariant)(userPrompt);
        const context = await this.detectContext(userPrompt);
        context.syllabusVariant = syllabusVariant;
        console.log('Detected Context:', context);
        let patternData = null;
        let source = 'llm_draft';
        const builtInPecta = (0, pecta_templates_1.buildPectaTemplateIfApplicable)(context.board, context.country, context.subject, context.class, syllabusVariant);
        if (builtInPecta) {
            console.log('✅ PECTA built-in template applied');
            patternData = builtInPecta;
            source = 'verified_db';
        }
        if (!patternData) {
            const dbTemplate = await this.lookupVerifiedTemplate(context, userPrompt);
            if (dbTemplate) {
                console.log('✅ LAYER 1 HIT: Using verified DB template');
                patternData = {
                    name: dbTemplate.name,
                    subject: dbTemplate.subject,
                    totalMarks: dbTemplate.totalMarks,
                    duration: dbTemplate.duration,
                    sections: dbTemplate.sections,
                };
                source = 'verified_db';
                this.prisma.patternTemplate
                    .update({
                    where: { id: dbTemplate.id },
                    data: { usageCount: { increment: 1 }, lastUsed: new Date() },
                })
                    .catch(() => { });
            }
        }
        if (!patternData) {
            console.log('⚠️ LAYER 1 MISS: No verified template found');
            if (context.board) {
                console.log('🔍 LAYER 2: Web search + constrained AI parse');
                try {
                    const searchResults = await this.searchWebForPattern(context, userPrompt);
                    patternData = await this.parseSearchResults(context, searchResults, userPrompt);
                    source = 'web_search';
                }
                catch (searchError) {
                    console.warn('⚠️ LAYER 2 FAILED:', searchError);
                    patternData = null;
                }
            }
            if (!patternData) {
                console.log('🤖 LAYER 3: Constrained LLM generation (full user prompt)');
                patternData = await this.generateCustomPattern(userPrompt, context);
                source = 'llm_draft';
            }
            patternData = await this.hardValidatePattern(context, patternData);
        }
        if (!patternData ||
            !patternData.name ||
            !patternData.subject ||
            !patternData.sections ||
            patternData.sections.length === 0) {
            throw new Error('Invalid pattern data generated');
        }
        patternData = this.recalculateMarks(patternData);
        if (!patternData.duration || patternData.duration <= 0) {
            if (context.syllabusVariant === 'pecta' && (0, pecta_templates_1.isPectaScienceSubject)(context.subject)) {
                patternData.duration = 120;
            }
            else {
                const classNum = parseInt(context.class || '10');
                patternData.duration = classNum >= 11 ? 200 : 160;
            }
            console.log(`🔧 Auto-set duration to ${patternData.duration} minutes`);
        }
        if (source !== 'verified_db' && context.board && context.subject && context.class) {
            this.saveDraftTemplate(context, patternData, source).catch((err) => console.warn('⚠️ Failed to save draft template:', err.message));
        }
        return { patternData, source };
    }
    async lookupVerifiedTemplate(context, userPrompt) {
        if (!context.board || !context.subject || !context.class)
            return null;
        const variant = context.syllabusVariant ||
            (userPrompt ? (0, pecta_templates_1.detectSyllabusVariant)(userPrompt) : 'legacy');
        if (variant === 'pecta' && (0, pecta_templates_1.isPectaScienceSubject)(context.subject)) {
            const pectaTemplate = await this.prisma.patternTemplate.findFirst({
                where: {
                    board: context.board,
                    subject: context.subject,
                    classLevel: context.class,
                    isVerified: true,
                    OR: [
                        { totalMarks: 60 },
                        { name: { contains: 'PECTA', mode: 'insensitive' } },
                    ],
                },
                orderBy: { confidence: 'desc' },
            });
            if (pectaTemplate) {
                console.log(`📋 Found PECTA verified template: "${pectaTemplate.name}"`);
                return pectaTemplate;
            }
            console.log('⚠️ No PECTA DB template — skipping legacy 75-mark lookup');
            return null;
        }
        const template = await this.prisma.patternTemplate.findFirst({
            where: {
                board: context.board,
                subject: context.subject,
                classLevel: context.class,
                isVerified: true,
            },
            orderBy: { confidence: 'desc' },
        });
        if (template) {
            console.log(`📋 Found verified template: "${template.name}" (confidence: ${template.confidence})`);
            return template;
        }
        const fuzzyTemplate = await this.prisma.patternTemplate.findFirst({
            where: {
                board: context.board,
                classLevel: context.class,
                isVerified: true,
                subject: { contains: context.subject.substring(0, 4), mode: 'insensitive' },
            },
            orderBy: { confidence: 'desc' },
        });
        if (fuzzyTemplate) {
            console.log(`📋 Found fuzzy template: "${fuzzyTemplate.name}" for subject "${context.subject}"`);
            return fuzzyTemplate;
        }
        return null;
    }
    async hardValidatePattern(context, patternData) {
        if (!context.board)
            return patternData;
        const classNum = parseInt(context.class || '10');
        const educationLevel = classNum >= 11 ? 'higher_secondary' : 'secondary';
        const boardConfig = await this.prisma.boardConfig.findFirst({
            where: {
                board: context.board,
                educationLevel,
            },
        });
        if (!boardConfig) {
            console.log('⚠️ No board config found — skipping hard validation');
            return patternData;
        }
        const errors = [];
        let expectedMarks = boardConfig.defaultMarks;
        if (boardConfig.subjectMarks && typeof boardConfig.subjectMarks === 'object') {
            const subjectMap = boardConfig.subjectMarks;
            if (subjectMap[context.subject]) {
                expectedMarks = subjectMap[context.subject];
            }
        }
        const sectionSum = patternData.sections.reduce((sum, s) => sum + (s.questionsToAttempt * s.marksPerQuestion), 0);
        if (sectionSum < boardConfig.minMarks) {
            errors.push(`Sections sum ${sectionSum} < board minimum ${boardConfig.minMarks}`);
            console.warn(`❌ VALIDATOR: ${errors[errors.length - 1]}`);
        }
        if (sectionSum > boardConfig.maxMarks) {
            errors.push(`Sections sum ${sectionSum} > board maximum ${boardConfig.maxMarks}`);
            console.warn(`❌ VALIDATOR: ${errors[errors.length - 1]}`);
        }
        if (patternData.totalMarks !== sectionSum) {
            console.log(`🔧 VALIDATOR: Correcting totalMarks from ${patternData.totalMarks} to ${sectionSum}`);
            patternData.totalMarks = sectionSum;
        }
        if (Math.abs(sectionSum - expectedMarks) > 15) {
            console.warn(`⚠️ VALIDATOR: Pattern marks (${sectionSum}) differ significantly from expected (${expectedMarks}) for ${context.board} ${context.subject} Class ${context.class}`);
        }
        if (!patternData.duration || patternData.duration <= 0) {
            patternData.duration = boardConfig.defaultDuration;
        }
        if (errors.length > 0) {
            console.warn(`⚠️ HARD VALIDATOR found ${errors.length} issue(s) — pattern may need admin review`);
        }
        return patternData;
    }
    async saveDraftTemplate(context, patternData, source) {
        if (!context.board || !context.class)
            return;
        const classNum = parseInt(context.class || '10');
        const educationLevel = classNum >= 11 ? 'higher_secondary' : 'secondary';
        await this.prisma.patternTemplate.upsert({
            where: {
                board_subject_classLevel_country: {
                    board: context.board,
                    subject: context.subject,
                    classLevel: context.class,
                    country: context.country || 'Pakistan',
                },
            },
            update: {},
            create: {
                board: context.board,
                country: context.country || 'Pakistan',
                subject: context.subject,
                classLevel: context.class,
                educationLevel,
                name: patternData.name,
                totalMarks: patternData.totalMarks,
                duration: patternData.duration,
                sections: patternData.sections,
                isVerified: false,
                source: source === 'web_search' ? 'web_search' : 'ai',
                confidence: source === 'web_search' ? 0.6 : 0.4,
            },
        });
        console.log(`💾 Saved draft template for ${context.board} ${context.subject} Class ${context.class}`);
    }
    async correctPattern(templateId, correctedData, correctedBy, reason) {
        const existing = await this.prisma.patternTemplate.findUnique({
            where: { id: templateId },
        });
        if (!existing)
            throw new common_1.NotFoundException('Template not found');
        await this.prisma.correctionLog.create({
            data: {
                templateId,
                oldData: {
                    name: existing.name,
                    totalMarks: existing.totalMarks,
                    duration: existing.duration,
                    sections: existing.sections,
                },
                newData: {
                    name: correctedData.name,
                    totalMarks: correctedData.totalMarks,
                    duration: correctedData.duration,
                    sections: correctedData.sections,
                },
                correctedBy,
                reason,
            },
        });
        const updated = await this.prisma.patternTemplate.update({
            where: { id: templateId },
            data: {
                name: correctedData.name,
                totalMarks: correctedData.totalMarks,
                duration: correctedData.duration,
                sections: correctedData.sections,
                isVerified: true,
                source: 'admin_corrected',
                confidence: 1.0,
                verifiedBy: correctedBy,
            },
        });
        console.log(`✅ Pattern corrected and verified: ${updated.name}`);
        return { success: true, template: updated, message: 'Pattern corrected — will be used for all future requests' };
    }
    async listTemplates(filters) {
        return this.prisma.patternTemplate.findMany({
            where: {
                ...(filters?.board && { board: filters.board }),
                ...(filters?.subject && { subject: { contains: filters.subject, mode: 'insensitive' } }),
                ...(filters?.isVerified !== undefined && { isVerified: filters.isVerified }),
            },
            orderBy: [{ isVerified: 'desc' }, { confidence: 'desc' }, { board: 'asc' }, { subject: 'asc' }],
        });
    }
    async getTemplate(id) {
        const template = await this.prisma.patternTemplate.findUnique({ where: { id } });
        if (!template)
            throw new common_1.NotFoundException('Template not found');
        return template;
    }
    async detectContext(userPrompt) {
        const detectionPrompt = `Analyze this exam pattern request and extract key information:

User Request: "${userPrompt}"

BOARD DETECTION RULES:
PAKISTAN BOARDS:
- "Punjab Board" / "lahore board" / "gujranwala board" / "rawalpindi board" = "BISE Punjab" (Pakistan)
- "Federal Board" / "FBISE" / "federal" = "Federal Board" (Pakistan)
- "Sindh Board" / "BISE Sindh" / "karachi board" = "Sindh Board" (Pakistan)
- "KPK Board" / "BISE KPK" / "peshawar board" = "KPK Board" (Pakistan)
- "Balochistan Board" = "Balochistan Board" (Pakistan)
- "AKU-EB" / "Aga Khan" = "AKU-EB" (Pakistan)

INTERNATIONAL BOARDS:
- "O Level" / "O-Level" / "Cambridge O Level" / "CIE" = "Cambridge O Level" (International)
- "A Level" / "A-Level" / "Cambridge A Level" = "Cambridge A Level" (International)
- "IGCSE" = "Cambridge IGCSE" (International)
- "PSEB" or "Punjab India" = "PSEB" (India)
- "CBSE" = "CBSE" (India)
- "GCSE" = "GCSE" (UK)
- "AP" / "Advanced Placement" = "AP" (USA)
- "IB" / "International Baccalaureate" = "IB" (International)

SUBJECT NORMALIZATION:
- "chem" / "chemistry" = "Chemistry"
- "phy" / "physics" = "Physics"
- "bio" / "biology" = "Biology"
- "math" / "maths" / "mathematics" = "Mathematics"
- "eng" / "english" = "English"
- "urdu" = "Urdu"
- "comp" / "computer" / "CS" / "ICS" = "Computer Science"
- "pak studies" / "pakistan studies" = "Pakistan Studies"
- "islamiat" / "islamic studies" = "Islamiat"

Return ONLY a JSON object:
{
  "board": "detected board name from above list, or null",
  "country": "detected country or null",
  "subject": "normalized subject name",
  "class": "detected class/grade as string (9, 10, 11, 12, O1, O2, AS, A2) or null",
  "year": "2026",
  "needsWebSearch": true if any board detected, false if custom/generic pattern
}

Examples:
"Punjab Board Math class 10" → {"board": "BISE Punjab", "country": "Pakistan", "subject": "Mathematics", "class": "10", "year": "2026", "needsWebSearch": true}
"Federal board physics 12" → {"board": "Federal Board", "country": "Pakistan", "subject": "Physics", "class": "12", "year": "2026", "needsWebSearch": true}
"O level chemistry" → {"board": "Cambridge O Level", "country": "International", "subject": "Chemistry", "class": "O2", "year": "2026", "needsWebSearch": true}
"A level physics" → {"board": "Cambridge A Level", "country": "International", "subject": "Physics", "class": "A2", "year": "2026", "needsWebSearch": true}
"CBSE Physics" → {"board": "CBSE", "country": "India", "subject": "Physics", "class": "12", "year": "2026", "needsWebSearch": true}
"Sindh board english 10" → {"board": "Sindh Board", "country": "Pakistan", "subject": "English", "class": "10", "year": "2026", "needsWebSearch": true}
"12 class chem paper punjab board" → {"board": "BISE Punjab", "country": "Pakistan", "subject": "Chemistry", "class": "12", "year": "2026", "needsWebSearch": true}
"20 MCQs only" → {"board": null, "country": null, "subject": "General", "class": null, "year": "2026", "needsWebSearch": false}`;
        try {
            const detection = await this.groqClient.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: detectionPrompt }],
                temperature: 0.2,
                max_tokens: 300,
            });
            const detectionResponse = detection.choices[0]?.message?.content;
            if (!detectionResponse) {
                throw new Error('No response from AI during context detection');
            }
            const cleanDetection = detectionResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const parsed = JSON.parse(cleanDetection);
            return {
                ...parsed,
                syllabusVariant: (0, pecta_templates_1.detectSyllabusVariant)(userPrompt),
            };
        }
        catch (error) {
            console.error('Context detection failed:', error);
            return {
                board: null,
                country: null,
                subject: 'Mathematics',
                class: null,
                year: '2026',
                needsWebSearch: false,
                syllabusVariant: (0, pecta_templates_1.detectSyllabusVariant)(userPrompt),
            };
        }
    }
    async searchWebForPattern(context, userPrompt) {
        let searchQuery;
        const classNum = parseInt(context.class || '10');
        const pectaHint = context.syllabusVariant === 'pecta' || (userPrompt && (0, pecta_templates_1.detectSyllabusVariant)(userPrompt) === 'pecta')
            ? ' PECTA smart syllabus 60 marks 12 MCQs Q2 Q3 Q4 short questions attempt 5 long questions 9 marks 2025 2026'
            : '';
        if (context.board === 'BISE Punjab' && context.country === 'Pakistan') {
            const level = classNum >= 11 ? 'HSSC FSc Inter' : 'SSC Matric';
            const part = (classNum === 9 || classNum === 11) ? 'Part 1' : 'Part 2';
            searchQuery = `BISE Lahore Pakistan ${level} ${part} ${context.subject} Class ${context.class || '10'} paper pattern ${context.year} marks distribution scheme sections structure${pectaHint}`;
        }
        else if (context.board === 'Federal Board' && context.country === 'Pakistan') {
            const level = classNum >= 11 ? 'HSSC' : 'SSC';
            const part = (classNum === 9 || classNum === 11) ? 'Part 1' : 'Part 2';
            searchQuery = `FBISE Federal Board Pakistan ${level} ${part} ${context.subject} Class ${context.class || '10'} paper pattern ${context.year} marks distribution sections structure`;
        }
        else if (context.board === 'Sindh Board' && context.country === 'Pakistan') {
            const level = classNum >= 11 ? 'HSSC Inter' : 'SSC Matric';
            searchQuery = `BISE Sindh Board Karachi Pakistan ${level} ${context.subject} Class ${context.class || '10'} paper pattern ${context.year} marks distribution`;
        }
        else if (context.board === 'KPK Board' && context.country === 'Pakistan') {
            const level = classNum >= 11 ? 'HSSC' : 'SSC';
            searchQuery = `BISE KPK Peshawar Pakistan ${level} ${context.subject} Class ${context.class || '10'} paper pattern ${context.year} marks distribution`;
        }
        else if (context.board?.includes('Cambridge O Level')) {
            searchQuery = `Cambridge O Level ${context.subject} paper pattern ${context.year} marks scheme sections structure CIE`;
        }
        else if (context.board?.includes('Cambridge A Level')) {
            searchQuery = `Cambridge A Level ${context.subject} paper pattern ${context.year} marks scheme sections structure CIE`;
        }
        else if (context.board?.includes('IGCSE')) {
            searchQuery = `Cambridge IGCSE ${context.subject} paper pattern ${context.year} marks scheme sections structure`;
        }
        else {
            const countryContext = context.country ? `${context.country}` : '';
            searchQuery = `${context.board} ${countryContext} ${context.subject} Class ${context.class || '10'} exam paper pattern ${context.year} official marks distribution sections structure`;
        }
        console.log('🔍 Tavily Search Query:', searchQuery);
        try {
            if (!this.tavilyClient) {
                console.warn('⚠️  Tavily not configured, falling back to AI knowledge. Accuracy may be lower.');
                return '';
            }
            const response = await this.tavilyClient.search(searchQuery, {
                maxResults: 5,
                searchDepth: 'advanced',
                includeAnswer: true,
            });
            console.log('✓ Tavily Search Results:', response.results?.length || 0, 'results');
            console.log('📄 Tavily Answer:', response.answer || 'No answer');
            console.log('📄 First Result:', response.results?.[0]?.content?.substring(0, 300));
            const searchContext = response.results
                ?.map((r) => `Source: ${r.title}\nURL: ${r.url}\n${r.content}`)
                .join('\n\n---\n\n') || '';
            console.log('📄 Search Results Content:', searchContext.substring(0, 500));
            return searchContext;
        }
        catch (error) {
            console.error('❌ Tavily search failed:', error.message);
            console.warn('⚠️  Web search failed, using AI knowledge as fallback. Accuracy may be lower.');
            return '';
        }
    }
    async parseSearchResults(context, searchResults, userPrompt) {
        const classNum = parseInt(context.class || '10');
        const isPakistani = context.country === 'Pakistan';
        const isCambridge = context.board?.includes('Cambridge') || false;
        const subjectLower = context.subject.toLowerCase();
        const isScience = ['physics', 'chemistry', 'biology'].some(s => subjectLower.includes(s));
        const isMath = ['mathematics', 'math'].some(s => subjectLower.includes(s));
        const isEnglish = subjectLower.includes('english');
        const isUrdu = subjectLower.includes('urdu');
        const isLanguage = isEnglish || isUrdu;
        let boardKnowledge = '';
        if (isCambridge) {
            boardKnowledge = `\nCAMBRIDGE ${context.board} PAPER STRUCTURE:\n- Papers have multiple components (Paper 1, Paper 2, etc.)\n- Paper 1: Usually MCQ (40 marks, 1 hour)\n- Paper 2: Usually structured/short answer questions\n- Paper 3: Usually practical/coursework\n- Total marks vary by subject (typically 100-200 across papers)\n- Each paper has its own time allocation\n\nCRITICAL: Cambridge papers are VERY different from Pakistani board papers.\nCreate separate sections for each paper component.`;
        }
        else if (isPakistani) {
            const isPectaScience = context.syllabusVariant === 'pecta' &&
                classNum <= 10 &&
                (0, pecta_templates_1.isPectaScienceSubject)(context.subject);
            const levelInfo = isPectaScience
                ? 'SSC/Matric PECTA Smart Syllabus (2025–2026): 60 marks total, ~2 hours (120 min). Objective ~15 min on separate sheet.'
                : classNum >= 11
                    ? 'HSSC/FSc (Class 11-12): 100 marks for English/Urdu/Math, 85 marks for Science subjects. Time: ~3h 20min total.'
                    : 'SSC/Matric (Class 9-10) LEGACY (pre-PECTA): 75 marks total. Time: ~2h 40min total.';
            const boardName = context.board || 'Pakistani Board';
            boardKnowledge = `\n${boardName} PAKISTAN ${levelInfo}\nNOTE: Pakistani boards follow similar structures with minor variations.\n`;
            if (isPectaScience) {
                boardKnowledge += `
SUBJECT-SPECIFIC: PECTA SMART SYLLABUS SCIENCE (${context.subject}) — 60 MARKS
Use EXACTLY these sections (5 sections, total 60 marks):
1. Section A - MCQs: 12 questions, attempt ALL 12, 1 mark each = 12 marks
2. Q.2 Short Questions: 8 parts from Chapters 1-3, attempt ANY 5 parts, 2 marks each = 10 marks
3. Q.3 Short Questions: 8 parts from Chapters 4-6, attempt ANY 5 parts, 2 marks each = 10 marks
4. Q.4 Short Questions: 8 parts from Chapters 7-9, attempt ANY 5 parts, 2 marks each = 10 marks
5. Section C Long Questions: 3 long questions (Q.5, Q.6, Q.7), attempt ANY 2, 9 marks each = 18 marks

CRITICAL: Create SEPARATE sections for Q.2, Q.3, and Q.4 — do NOT merge into one "Short Questions" section.
CRITICAL: totalMarks MUST be 60, duration ~120 minutes. NOT 75 marks.`;
            }
            else if (isEnglish) {
                boardKnowledge += `
SUBJECT-SPECIFIC: ENGLISH PAPER STRUCTURE
⚠️ English papers are COMPLETELY DIFFERENT from Science/Math papers.
⚠️ English has NO numerical problems, NO calculations, NO formulas.

English papers have MANY small specific sections, NOT generic "short/long" questions:
- Objective (MCQs): From textbook, grammar, vocabulary, idioms, pair of words
- Short Answers from Prose: Questions from textbook prose chapters, 2 marks each
- Short Answers from Poetry: Questions from poems, 2 marks each
- Translation (Urdu to English): Translate a paragraph, ~8 marks
- Translation (English to Urdu): Translate a passage, ~8 marks
- Essay Writing: Choose 1 topic from given options, ~15 marks
- Letter/Application Writing: Formal letter or application, ~8 marks
- Comprehension Passage: Read and answer questions, ~10 marks
- Pair of Words: Use pairs in sentences to show meaning difference, ~5 marks
- Idioms/Phrases: Use in sentences, ~5 marks
- Grammar/Correction: Correct grammatical errors, ~5 marks

CRITICAL: Each section type listed above should be a SEPARATE section in the JSON output.
Do NOT combine them into generic "Short Answer" and "Long Answer" sections.`;
            }
            else if (isUrdu) {
                boardKnowledge += `
SUBJECT-SPECIFIC: URDU PAPER STRUCTURE
⚠️ Urdu papers are COMPLETELY DIFFERENT from Science/Math papers.
⚠️ Urdu has NO numerical problems, NO calculations, NO formulas.

Urdu papers have specific literary and language sections:
- Objective (MCQs): From textbook, grammar (Qawaid), vocabulary
- Ghazal: Explain verses/couplets with context and reference, ~10 marks
- Nazm (Poetry): Answer questions from poems, ~8 marks
- Nasr (Prose): Questions from prose lessons, ~10 marks
- Essay (Mazmoon Nigari): Write essay on given topic, ~15 marks
- Letter (Khat Nigari): Formal/informal letter writing, ~8 marks
- Translation (English to Urdu): Translate passage, ~8 marks
- Summary (Khulasa): Write summary of given passage, ~8 marks
- Grammar (Qawaid): Urdu grammar exercises, ~8 marks
- Comprehension: Read passage and answer questions, ~5 marks

CRITICAL: Each section type should be a SEPARATE section in the JSON output.`;
            }
            else if (isScience) {
                boardKnowledge += `
SUBJECT-SPECIFIC: SCIENCE PAPER STRUCTURE (Physics/Chemistry/Biology)
- Objective Part: MCQs (all compulsory)
- Short Questions: Grouped by chapters, 2 marks each, with choice (attempt X from Y)
- Long Questions: Each has part (a) and part (b)
  * Part (a): Usually theory/explanation (3-4 marks)
  * Part (b): Usually numerical/calculation problem (4-5 marks)
- Physics: Long questions often include derivations and numerical problems
- Chemistry: Long questions include chemical equations, numerical, mechanisms
- Biology: Long questions may include diagrams with labeling
- Sections organized by chapter groups with "Attempt any X" format`;
            }
            else if (isMath) {
                boardKnowledge += `
SUBJECT-SPECIFIC: MATHEMATICS PAPER STRUCTURE
- Objective Part: MCQs (all compulsory)
- Short Questions: Grouped by chapters, 2 marks each, with choice
- Long Questions: Each has part (a) and part (b)
  * Detailed proofs, derivations, multi-step calculations
  * Include theorems, integration, differentiation, algebra problems
- All questions involve mathematical computation and proof`;
            }
        }
        const parsePrompt = `You are an expert on ${context.country || 'international'} education board exam patterns.

Board: ${context.board}
Country: ${context.country}
Subject: ${context.subject}
Class: ${context.class || '10'}
Year: ${context.year}
Syllabus: ${context.syllabusVariant === 'pecta' ? 'PECTA Smart Syllabus (60 marks for Class 9-10 Science)' : 'Standard/Legacy'}
${boardKnowledge}

USER REQUEST (follow this when it specifies structure or marks):
"""
${userPrompt || 'Not provided'}
"""

IMPORTANT CONTEXT:
- If board is "BISE Punjab" → this is PAKISTAN Punjab Board, NOT Indian PSEB
- If board is "PSEB" → this is INDIA Punjab Board
- Always prioritize web search results over your training knowledge
- Web search results are more up-to-date than your training data

Web Search Results:
${searchResults
            ? searchResults
            : `No search results available. Use your most recent knowledge for ${context.board} ${context.country}.`}

Extract the EXACT current exam pattern from the search results above.

Return ONLY valid JSON:
{
  "name": "descriptive name with board, class and year",
  "subject": "subject name",
  "totalMarks": number,
  "duration": number (minutes, include both objective + subjective time),
  "sections": [
    {
      "name": "Section name (e.g. Section A - Objective / MCQs)",
      "questionType": "MCQ" | "Short Answer" | "Long Answer" | "Numerical" | "Practical",
      "numberOfQuestions": total questions given in this section,
      "questionsToAttempt": how many student must answer,
      "marksPerQuestion": marks for each question,
      "notes": "optional: describe sub-parts, e.g. 'Each question has part (a) and part (b)' or 'Includes numerical problems'"
    }
  ]
}

RULES:
- TRUST search results over your training data
- For MCQs: numberOfQuestions = questionsToAttempt (all compulsory)
- If ALL questions compulsory: numberOfQuestions = questionsToAttempt
- totalMarks = sum(questionsToAttempt × marksPerQuestion)
- If long questions have sub-parts (a) and (b), add notes describing them
- If a section includes numerical/calculation problems, mention in notes (ONLY for Science/Math)
- NEVER mention "numerical problems", "calculations", or "formulas" for English or Urdu papers
- For English/Urdu: create SEPARATE sections for each distinct type (prose, poetry, essay, letter, translation, idioms, pair of words, comprehension, grammar)
- For Science: create sections for MCQs, Short Questions, Long Questions, and optionally Numericals
- Create SEPARATE sections for different question types (don't merge short and long)
- NO markdown, NO explanation, ONLY JSON`;
        try {
            const generation = await this.groqClient.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: parsePrompt }],
                temperature: 0.1,
                max_tokens: 2500,
            });
            const response = generation.choices[0]?.message?.content;
            if (!response) {
                throw new Error('No response from AI during pattern parsing');
            }
            const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            console.log('🤖 AI Generated Pattern:', cleanResponse.substring(0, 500));
            return JSON.parse(cleanResponse);
        }
        catch (error) {
            console.error('Pattern parsing failed:', error);
            throw new Error('Failed to parse pattern from search results');
        }
    }
    recalculateMarks(patternData) {
        if (!patternData.sections || patternData.sections.length === 0) {
            return patternData;
        }
        const calculatedTotal = patternData.sections.reduce((sum, sec) => sum + (sec.questionsToAttempt * sec.marksPerQuestion), 0);
        if (calculatedTotal !== patternData.totalMarks) {
            console.warn(`⚠️ Marks mismatch: declared=${patternData.totalMarks}, calculated=${calculatedTotal}`);
            console.log(`🔧 Auto-correcting totalMarks from ${patternData.totalMarks} to ${calculatedTotal}`);
            return {
                ...patternData,
                totalMarks: calculatedTotal,
            };
        }
        console.log(`✓ Marks validation passed: ${calculatedTotal} marks`);
        return patternData;
    }
    async generateCustomPattern(userPrompt, context) {
        const subjectLower = context.subject.toLowerCase();
        const isScience = ['physics', 'chemistry', 'biology'].some(s => subjectLower.includes(s));
        const isEnglish = subjectLower.includes('english');
        const isUrdu = subjectLower.includes('urdu');
        let subjectGuide = '';
        if (isEnglish) {
            subjectGuide = `
SUBJECT: ENGLISH — Use ENGLISH-SPECIFIC sections:
⚠️ NO numerical problems, NO calculations, NO formulas in English!
Sections should include: MCQs, Short Answers from Prose, Short Answers from Poetry,
Translation (Urdu↔English), Essay Writing, Letter/Application, Comprehension Passage,
Pair of Words, Idioms/Phrases, Grammar/Correction.
Each of these should be a SEPARATE section.`;
        }
        else if (isUrdu) {
            subjectGuide = `
SUBJECT: URDU — Use URDU-SPECIFIC sections:
⚠️ NO numerical problems, NO calculations, NO formulas in Urdu!
Sections should include: MCQs, Ghazal (Poetry Explanation), Nazm (Poetry Questions),
Nasr (Prose Questions), Essay (Mazmoon Nigari), Letter (Khat Nigari),
Translation (English to Urdu), Summary (Khulasa), Grammar (Qawaid).
Each of these should be a SEPARATE section.`;
        }
        else if (isScience) {
            subjectGuide = `
SUBJECT: SCIENCE — Long questions have part (a) theory and part (b) numerical/calculation.
Physics/Chemistry may have separate Numerical section.
Numerical/calculation problems are common.`;
        }
        else {
            subjectGuide = `
Use subject-appropriate section types. Do NOT add numerical/calculation sections for non-science subjects.`;
        }
        const customPrompt = `Create a custom exam pattern based on user request.

User Request: "${userPrompt}"
${subjectGuide}

BOARD-SPECIFIC KNOWLEDGE:

PAKISTANI BOARDS (BISE Punjab, Federal Board, Sindh Board, KPK Board):
- PECTA Smart Syllabus (2025–2026) Class 9–10 SCIENCE (Physics/Chemistry/Biology): 60 marks, 120 min
  * Section A: 12 MCQs × 1 = 12 marks (all compulsory)
  * Q.2, Q.3, Q.4: EACH is a separate section — 8 parts, attempt ANY 5, 2 marks each = 10 marks per question
  * Section C Long: 3 questions, attempt ANY 2, 9 marks each = 18 marks
  * Total: 12+10+10+10+18 = 60 marks — NOT 75 marks
- SSC LEGACY (pre-PECTA) Math/CS: 75 marks, 160 min
- HSSC/FSc (Class 11-12): 85–100 marks, 200 min

CAMBRIDGE (O Level / A Level / IGCSE):
- Multiple paper components (Paper 1, Paper 2, Paper 3)
- Paper 1 usually MCQ, Paper 2 structured, Paper 3 practical
- Very different from Pakistani board structure

CBSE (India): 80 marks theory + 20 marks practical for science

CRITICAL: Match the EXACT board's structure. Do NOT mix board styles.

Return ONLY valid JSON:
{
  "name": "descriptive name including board, class, subject",
  "subject": "${context.subject}",
  "totalMarks": number,
  "duration": number (minutes),
  "sections": [
    {
      "name": "Section name",
      "questionType": "MCQ" | "Short Answer" | "Long Answer" | "Essay" | "Numerical",
      "numberOfQuestions": total questions given,
      "questionsToAttempt": how many to answer,
      "marksPerQuestion": marks each,
      "notes": "describe what this section contains"
    }
  ]
}

RULES:
- Parse the user's requirements exactly — if they pasted a full pattern, follow it section-by-section
- For PECTA Punjab science: use 5 sections (MCQ + Q.2 + Q.3 + Q.4 + Long), totalMarks=60, duration=120
- totalMarks = sum(questionsToAttempt × marksPerQuestion)
- NEVER use 75 marks or 15 MCQs for PECTA science unless user explicitly asks for legacy pattern
- NEVER add 'numerical problems' or 'calculations' to English/Urdu papers
- Create SEPARATE sections for each distinct question type (Q.2, Q.3, Q.4 must be separate)
- NO markdown, ONLY JSON.`;
        try {
            const generation = await this.groqClient.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: customPrompt }],
                temperature: 0.3,
                max_tokens: 2000,
            });
            const response = generation.choices[0]?.message?.content;
            if (!response) {
                throw new Error('No response from AI during custom pattern generation');
            }
            const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            return JSON.parse(cleanResponse);
        }
        catch (error) {
            console.error('Custom pattern generation failed:', error);
            throw new Error('Failed to generate custom pattern');
        }
    }
};
exports.PatternsService = PatternsService;
exports.PatternsService = PatternsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PatternsService);
//# sourceMappingURL=patterns.service.js.map