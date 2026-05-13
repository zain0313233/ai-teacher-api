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
    async createPatternWithAI(userId, userPrompt) {
        try {
            console.log('=== AI Pattern Creation Started ===');
            console.log('User Prompt:', userPrompt);
            const context = await this.detectContext(userPrompt);
            console.log('Detected Context:', context);
            let patternData;
            if (context.needsWebSearch && context.board) {
                console.log('=== Web Search Path ===');
                const searchResults = await this.searchWebForPattern(context);
                patternData = await this.parseSearchResults(context, searchResults);
                patternData = this.validateAndCorrectPattern(context, patternData);
            }
            else {
                console.log('=== Custom Pattern Path ===');
                patternData = await this.generateCustomPattern(userPrompt, context);
            }
            if (!patternData.name || !patternData.subject || !patternData.sections || patternData.sections.length === 0) {
                throw new Error('Invalid pattern data generated');
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
            console.log('=== Pattern Created Successfully ===');
            console.log('Pattern ID:', pattern.id);
            return {
                success: true,
                pattern,
                message: 'Pattern created successfully with AI',
            };
        }
        catch (error) {
            console.error('AI pattern creation error:', error);
            throw error;
        }
    }
    async detectContext(userPrompt) {
        const detectionPrompt = `Analyze this exam pattern request and extract key information:

User Request: "${userPrompt}"

IMPORTANT DISAMBIGUATION:
- "Punjab Board" without country context = Pakistan (BISE Punjab)
- "PSEB" or "Punjab India" = India (Punjab School Education Board)
- Default assumption for "Punjab Board" = Pakistan

Return ONLY a JSON object:
{
  "board": "detected board - use 'BISE Punjab' for Pakistan, 'PSEB' for India, 'CBSE', 'GCSE', 'AP', 'IB', etc.",
  "country": "detected country (Pakistan, India, UK, USA, etc.) or null",
  "subject": "detected subject or 'Mathematics'",
  "class": "detected class/grade (10, 12, etc.) or null",
  "year": "2026",
  "needsWebSearch": true if board/country detected, false if custom pattern
}

Examples:
"Punjab Board Math" → {"board": "BISE Punjab", "country": "Pakistan", "subject": "Mathematics", "class": "10", "year": "2026", "needsWebSearch": true}
"Punjab Board Math Pakistan" → {"board": "BISE Punjab", "country": "Pakistan", "subject": "Mathematics", "class": "10", "year": "2026", "needsWebSearch": true}
"PSEB Math" → {"board": "PSEB", "country": "India", "subject": "Mathematics", "class": "10", "year": "2026", "needsWebSearch": true}
"CBSE Physics" → {"board": "CBSE", "country": "India", "subject": "Physics", "class": "12", "year": "2026", "needsWebSearch": true}
"20 MCQs only" → {"board": null, "country": null, "subject": "Mathematics", "class": null, "year": "2026", "needsWebSearch": false}`;
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
            return JSON.parse(cleanDetection);
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
            };
        }
    }
    async searchWebForPattern(context) {
        let searchQuery;
        if (context.board === 'BISE Punjab' && context.country === 'Pakistan') {
            searchQuery = `BISE Lahore Gujranwala Pakistan SSC Part 2 ${context.subject} Class ${context.class || '10'} paper pattern ${context.year} marks distribution scheme official`;
        }
        else {
            const countryContext = context.country ? `${context.country}` : '';
            const boardSpecific = context.board === 'BISE Punjab' ? 'BISE' : context.board;
            searchQuery = `${boardSpecific} ${countryContext} ${context.subject} Class ${context.class || '10'} exam paper pattern ${context.year} official marks distribution sections structure`;
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
    async parseSearchResults(context, searchResults) {
        const parsePrompt = `You are analyzing exam board patterns from web search results.

Board: ${context.board}
Country: ${context.country}
Subject: ${context.subject}
Class: ${context.class || '10'}
Year: ${context.year}

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
  "name": "descriptive name with board and year",
  "subject": "subject name",
  "totalMarks": number,
  "duration": number (minutes),
  "sections": [
    {
      "name": "Section name",
      "questionType": "MCQ" | "Short Answer" | "Long Answer" | "Case Study" | "Practical",
      "numberOfQuestions": number,
      "questionsToAttempt": number,
      "marksPerQuestion": number
    }
  ]
}

RULES:
- TRUST search results over your training data
- For MCQs: numberOfQuestions = questionsToAttempt
- If ALL questions compulsory: numberOfQuestions = questionsToAttempt
- totalMarks = sum(questionsToAttempt × marksPerQuestion)
- NO markdown, NO explanation, ONLY JSON`;
        try {
            const generation = await this.groqClient.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: parsePrompt }],
                temperature: 0.1,
                max_tokens: 1500,
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
    validateAndCorrectPattern(context, patternData) {
        console.log('🔍 Validating pattern:', JSON.stringify(patternData, null, 2));
        const KNOWN_PATTERNS = {
            'BISE Punjab_Mathematics_10_2026': {
                totalMarks: 75,
                duration: 160,
                sections: [
                    { name: 'Section A - MCQs', questionType: 'MCQ', numberOfQuestions: 15, questionsToAttempt: 15, marksPerQuestion: 1 },
                    { name: 'Section B - Short Questions', questionType: 'Short Answer', numberOfQuestions: 9, questionsToAttempt: 9, marksPerQuestion: 4 },
                    { name: 'Section C - Long Questions', questionType: 'Long Answer', numberOfQuestions: 3, questionsToAttempt: 3, marksPerQuestion: 8 },
                ],
            },
            'CBSE_Mathematics_10_2026': {
                totalMarks: 80,
                duration: 180,
            },
        };
        const key = `${context.board}_${context.subject}_${context.class}_${context.year}`;
        const knownPattern = KNOWN_PATTERNS[key];
        if (knownPattern) {
            console.log(`✓ Found known pattern for ${key}, validating...`);
            const isWrongMarks = patternData.totalMarks !== knownPattern.totalMarks;
            const isWrongDuration = patternData.duration !== knownPattern.duration;
            const isZeroDuration = patternData.duration === 0;
            if (isWrongMarks || isWrongDuration || isZeroDuration) {
                console.warn(`⚠️ Pattern mismatch detected for ${key}`);
                console.warn(`Generated: marks=${patternData.totalMarks}, duration=${patternData.duration}`);
                console.warn(`Expected:  marks=${knownPattern.totalMarks}, duration=${knownPattern.duration}`);
                console.log('🔧 Correcting pattern with known values...');
                return {
                    ...patternData,
                    name: `${context.board} ${context.subject} Class ${context.class} ${context.year}`,
                    totalMarks: knownPattern.totalMarks ?? patternData.totalMarks,
                    duration: knownPattern.duration ?? patternData.duration,
                    sections: (knownPattern.sections ?? patternData.sections),
                };
            }
            console.log('✓ Pattern validation passed');
        }
        else {
            console.log(`ℹ️ No known pattern for ${key}, trusting AI output`);
        }
        return patternData;
    }
    async generateCustomPattern(userPrompt, context) {
        const customPrompt = `Create a custom exam pattern based on user request:

User Request: "${userPrompt}"

Return ONLY valid JSON:
{
  "name": "descriptive name",
  "subject": "${context.subject}",
  "totalMarks": number,
  "duration": number (minutes),
  "sections": [
    {
      "name": "Section name",
      "questionType": "MCQ" | "Short Answer" | "Long Answer",
      "numberOfQuestions": number,
      "questionsToAttempt": number,
      "marksPerQuestion": number
    }
  ]
}

Parse the user's requirements exactly. NO markdown, ONLY JSON.`;
        try {
            const generation = await this.groqClient.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: customPrompt }],
                temperature: 0.3,
                max_tokens: 1000,
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