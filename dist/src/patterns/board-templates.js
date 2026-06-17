"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeTemplateSubject = normalizeTemplateSubject;
exports.buildBoardTemplateFromCode = buildBoardTemplateFromCode;
exports.builtInBoardPatternId = builtInBoardPatternId;
exports.legacyPectaPatternId = legacyPectaPatternId;
exports.patternIdMatchesBuiltIn = patternIdMatchesBuiltIn;
exports.subjectsWithBuiltInTemplates = subjectsWithBuiltInTemplates;
const pecta_templates_1 = require("./pecta-templates");
const SUBJECT_ALIASES = {
    math: 'Mathematics',
    maths: 'Mathematics',
    mathematics: 'Mathematics',
    english: 'English',
    eng: 'English',
    urdu: 'Urdu',
    islamiat: 'Islamiat',
    'islamic studies': 'Islamiat',
    'pakistan studies': 'Pakistan Studies',
    'pak studies': 'Pakistan Studies',
    pakstudies: 'Pakistan Studies',
    'computer science': 'Computer Science',
    cs: 'Computer Science',
    ics: 'Computer Science',
    physics: 'Physics',
    chemistry: 'Chemistry',
    biology: 'Biology',
};
function normalizeTemplateSubject(subject) {
    const key = subject.trim().toLowerCase();
    if (SUBJECT_ALIASES[key])
        return SUBJECT_ALIASES[key];
    for (const [alias, canonical] of Object.entries(SUBJECT_ALIASES)) {
        if (key.includes(alias))
            return canonical;
    }
    return subject.trim();
}
function sscMathCsPattern(subject, classLevel) {
    const isCs = subject === 'Computer Science';
    return {
        name: `BISE Punjab ${subject} Class ${classLevel}`,
        subject,
        totalMarks: 75,
        duration: 160,
        sections: [
            {
                name: 'Section A - Objective (MCQs)',
                questionType: 'MCQ',
                numberOfQuestions: 15,
                questionsToAttempt: 15,
                marksPerQuestion: 1,
            },
            {
                name: 'Section B - Short Questions',
                questionType: 'Short Answer',
                numberOfQuestions: 15,
                questionsToAttempt: 9,
                marksPerQuestion: 4,
                notes: `Grouped by chapters with choice.${isCs ? ' Includes theory, definitions, short code.' : ' Includes proofs and calculations.'}`,
            },
            {
                name: 'Section C - Long Questions',
                questionType: 'Long Answer',
                numberOfQuestions: 5,
                questionsToAttempt: 3,
                marksPerQuestion: 8,
                notes: `Each has part (a) and part (b).${isCs ? ' Includes programs, flowcharts, algorithms.' : ' Detailed proofs and multi-step calculations.'}`,
            },
        ],
    };
}
function sscEnglishPattern(classLevel) {
    return {
        name: `BISE Punjab English Class ${classLevel}`,
        subject: 'English',
        totalMarks: 75,
        duration: 160,
        sections: [
            { name: 'Objective - MCQs', questionType: 'MCQ', numberOfQuestions: 15, questionsToAttempt: 15, marksPerQuestion: 1, notes: 'From textbook, grammar, vocabulary, idioms' },
            { name: 'Short Answers - Prose', questionType: 'Short Answer', numberOfQuestions: 8, questionsToAttempt: 5, marksPerQuestion: 2, notes: 'From textbook prose lessons' },
            { name: 'Short Answers - Poetry', questionType: 'Short Answer', numberOfQuestions: 5, questionsToAttempt: 3, marksPerQuestion: 2, notes: 'From poems in textbook' },
            { name: 'Translation (Urdu to English)', questionType: 'Short Answer', numberOfQuestions: 1, questionsToAttempt: 1, marksPerQuestion: 5, notes: 'Translate a given Urdu paragraph into English' },
            { name: 'Essay Writing', questionType: 'Essay', numberOfQuestions: 3, questionsToAttempt: 1, marksPerQuestion: 10, notes: 'Choose one topic from given options' },
            { name: 'Letter/Application Writing', questionType: 'Long Answer', numberOfQuestions: 2, questionsToAttempt: 1, marksPerQuestion: 8, notes: 'Formal letter or application writing' },
            { name: 'Comprehension Passage', questionType: 'Short Answer', numberOfQuestions: 1, questionsToAttempt: 1, marksPerQuestion: 8, notes: 'Read passage and answer questions' },
            { name: 'Pair of Words', questionType: 'Short Answer', numberOfQuestions: 5, questionsToAttempt: 5, marksPerQuestion: 1, notes: 'Use pair of words in sentences' },
            { name: 'Use of Idioms', questionType: 'Short Answer', numberOfQuestions: 5, questionsToAttempt: 5, marksPerQuestion: 1, notes: 'Use given idioms/phrases in sentences' },
            { name: 'Grammar/Correction', questionType: 'Short Answer', numberOfQuestions: 5, questionsToAttempt: 3, marksPerQuestion: 1, notes: 'Correct grammatical errors in given sentences' },
        ],
    };
}
function sscUrduPattern(classLevel) {
    return {
        name: `BISE Punjab Urdu Class ${classLevel}`,
        subject: 'Urdu',
        totalMarks: 75,
        duration: 160,
        sections: [
            { name: 'Objective - MCQs', questionType: 'MCQ', numberOfQuestions: 15, questionsToAttempt: 15, marksPerQuestion: 1, notes: 'From textbook, grammar (Qawaid), vocabulary' },
            { name: 'Ghazal (Poetry Explanation)', questionType: 'Short Answer', numberOfQuestions: 3, questionsToAttempt: 2, marksPerQuestion: 5, notes: 'Explain couplets with context and reference' },
            { name: 'Tashreeh', questionType: 'Short Answer', numberOfQuestions: 2, questionsToAttempt: 1, marksPerQuestion: 5, notes: 'Explain verse/passage with reference and context' },
            { name: 'Nazm (Poetry Questions)', questionType: 'Short Answer', numberOfQuestions: 4, questionsToAttempt: 3, marksPerQuestion: 2, notes: 'Answer questions from Nazm/poems' },
            { name: 'Nasr (Prose Questions)', questionType: 'Short Answer', numberOfQuestions: 6, questionsToAttempt: 4, marksPerQuestion: 2, notes: 'From prose lessons in textbook' },
            { name: 'Essay (Mazmoon Nigari)', questionType: 'Essay', numberOfQuestions: 3, questionsToAttempt: 1, marksPerQuestion: 10, notes: 'Write essay on one of the given topics' },
            { name: 'Letter (Khat Nigari)', questionType: 'Long Answer', numberOfQuestions: 2, questionsToAttempt: 1, marksPerQuestion: 8, notes: 'Formal or informal letter writing' },
            { name: 'Translation (English to Urdu)', questionType: 'Short Answer', numberOfQuestions: 1, questionsToAttempt: 1, marksPerQuestion: 5, notes: 'Translate an English paragraph into Urdu' },
            { name: 'Comprehension (Unseen Passage)', questionType: 'Short Answer', numberOfQuestions: 3, questionsToAttempt: 3, marksPerQuestion: 1, notes: 'Read unseen passage and answer questions' },
            { name: 'Grammar (Qawaid)', questionType: 'Short Answer', numberOfQuestions: 5, questionsToAttempt: 5, marksPerQuestion: 1, notes: 'Urdu grammar exercises' },
        ],
    };
}
function sscIslamiatPattern(classLevel) {
    return {
        name: `BISE Punjab Islamiat Class ${classLevel}`,
        subject: 'Islamiat',
        totalMarks: 50,
        duration: 120,
        sections: [
            { name: 'Objective - MCQs', questionType: 'MCQ', numberOfQuestions: 12, questionsToAttempt: 12, marksPerQuestion: 1, notes: 'From Quran, Hadith, Islamic history, and ethics' },
            { name: 'Short Questions - Quran & Hadith', questionType: 'Short Answer', numberOfQuestions: 6, questionsToAttempt: 4, marksPerQuestion: 3, notes: 'Translation of Ayaat, Hadith explanation, and Islamic teachings' },
            { name: 'Short Questions - Islamic History', questionType: 'Short Answer', numberOfQuestions: 6, questionsToAttempt: 4, marksPerQuestion: 3, notes: 'Seerat-un-Nabi, Khulafa-e-Rashideen, Islamic civilization' },
            { name: 'Long Questions', questionType: 'Long Answer', numberOfQuestions: 4, questionsToAttempt: 2, marksPerQuestion: 7, notes: 'Detailed answers on Islamic principles, Seerat, or history' },
        ],
    };
}
function sscPakStudiesPattern(classLevel) {
    return {
        name: `BISE Punjab Pakistan Studies Class ${classLevel}`,
        subject: 'Pakistan Studies',
        totalMarks: 50,
        duration: 120,
        sections: [
            { name: 'Objective - MCQs', questionType: 'MCQ', numberOfQuestions: 15, questionsToAttempt: 15, marksPerQuestion: 1, notes: 'From history, geography, civics of Pakistan' },
            { name: 'Short Questions', questionType: 'Short Answer', numberOfQuestions: 12, questionsToAttempt: 7, marksPerQuestion: 3, notes: 'Pakistan Movement, geography, economy, political system' },
            { name: 'Long Questions', questionType: 'Long Answer', numberOfQuestions: 4, questionsToAttempt: 2, marksPerQuestion: 7, notes: 'Creation of Pakistan, constitution, foreign policy' },
        ],
    };
}
function hsscSciencePattern(subject, classLevel) {
    const isBio = subject === 'Biology';
    return {
        name: `BISE Punjab ${subject} Class ${classLevel}`,
        subject,
        totalMarks: 85,
        duration: 200,
        sections: [
            { name: 'Section A - Objective (MCQs)', questionType: 'MCQ', numberOfQuestions: 17, questionsToAttempt: 17, marksPerQuestion: 1 },
            {
                name: 'Section B - Short Questions',
                questionType: 'Short Answer',
                numberOfQuestions: 30,
                questionsToAttempt: 22,
                marksPerQuestion: 2,
                notes: `Grouped by chapter sections with choice.${isBio ? ' Includes diagrams.' : ' Includes conceptual and short numerical.'}`,
            },
            {
                name: 'Section C - Long Questions',
                questionType: 'Long Answer',
                numberOfQuestions: 5,
                questionsToAttempt: 3,
                marksPerQuestion: 8,
                notes: `Each has part (a) and part (b).${isBio ? ' Includes diagrams and labeling.' : ' Part (a) theory/derivation, part (b) numerical/calculations.'}`,
            },
        ],
    };
}
function hsscMathPattern(classLevel) {
    return {
        name: `BISE Punjab Mathematics Class ${classLevel}`,
        subject: 'Mathematics',
        totalMarks: 100,
        duration: 200,
        sections: [
            { name: 'Section A - Objective (MCQs)', questionType: 'MCQ', numberOfQuestions: 20, questionsToAttempt: 20, marksPerQuestion: 1 },
            { name: 'Section B - Short Questions', questionType: 'Short Answer', numberOfQuestions: 30, questionsToAttempt: 20, marksPerQuestion: 2, notes: 'Grouped by chapters. Short proofs, calculations, and definitions.' },
            { name: 'Section C - Long Questions', questionType: 'Long Answer', numberOfQuestions: 8, questionsToAttempt: 5, marksPerQuestion: 8, notes: 'Detailed proofs, multi-step problems. Each has part (a) and part (b).' },
        ],
    };
}
function hsscCsPattern(classLevel) {
    return {
        name: `BISE Punjab Computer Science Class ${classLevel}`,
        subject: 'Computer Science',
        totalMarks: 85,
        duration: 200,
        sections: [
            { name: 'Section A - Objective (MCQs)', questionType: 'MCQ', numberOfQuestions: 17, questionsToAttempt: 17, marksPerQuestion: 1 },
            { name: 'Section B - Short Questions', questionType: 'Short Answer', numberOfQuestions: 30, questionsToAttempt: 22, marksPerQuestion: 2, notes: 'Grouped by chapters. Theory, definitions, short code snippets.' },
            { name: 'Section C - Long Questions', questionType: 'Long Answer', numberOfQuestions: 5, questionsToAttempt: 3, marksPerQuestion: 8, notes: 'Programs, algorithms, detailed explanations with part (a) and (b).' },
        ],
    };
}
function buildBoardTemplateFromCode(board, country, subject, classLevel, syllabusVariant = 'legacy') {
    if (!board || country !== 'Pakistan' || !classLevel)
        return null;
    const normSubject = normalizeTemplateSubject(subject);
    const cls = classLevel.replace(/\D/g, '') || classLevel;
    if (board === 'BISE Punjab' && syllabusVariant === 'pecta' && ['9', '10'].includes(cls)) {
        if ((0, pecta_templates_1.isPectaScienceSubject)(normSubject)) {
            return (0, pecta_templates_1.buildPectaSciencePattern)(normSubject, cls);
        }
    }
    if (board !== 'BISE Punjab') {
        return null;
    }
    if (['9', '10'].includes(cls)) {
        if (normSubject === 'Mathematics' || normSubject === 'Computer Science') {
            return sscMathCsPattern(normSubject, cls);
        }
        if (normSubject === 'English')
            return sscEnglishPattern(cls);
        if (normSubject === 'Urdu')
            return sscUrduPattern(cls);
        if (normSubject === 'Islamiat')
            return sscIslamiatPattern(cls);
        if (normSubject === 'Pakistan Studies')
            return sscPakStudiesPattern(cls);
        if ((0, pecta_templates_1.isPectaScienceSubject)(normSubject)) {
            return (0, pecta_templates_1.buildPectaSciencePattern)(normSubject, cls);
        }
    }
    if (['11', '12'].includes(cls)) {
        if (['Physics', 'Chemistry', 'Biology'].includes(normSubject)) {
            return hsscSciencePattern(normSubject, cls);
        }
        if (normSubject === 'Mathematics')
            return hsscMathPattern(cls);
        if (normSubject === 'Computer Science')
            return hsscCsPattern(cls);
        if (normSubject === 'English') {
            return {
                ...sscEnglishPattern(cls),
                name: `BISE Punjab English Class ${cls}`,
                totalMarks: 100,
                duration: 200,
                sections: [
                    { name: 'Objective - MCQs', questionType: 'MCQ', numberOfQuestions: 20, questionsToAttempt: 20, marksPerQuestion: 1, notes: 'From textbook, grammar, vocabulary, idioms, pair of words' },
                    { name: 'Short Answers - Prose', questionType: 'Short Answer', numberOfQuestions: 8, questionsToAttempt: 5, marksPerQuestion: 2, notes: 'From textbook prose lessons (Book II)' },
                    { name: 'Short Answers - Poetry', questionType: 'Short Answer', numberOfQuestions: 5, questionsToAttempt: 3, marksPerQuestion: 2, notes: 'From poems and plays' },
                    { name: 'Translation (Urdu to English)', questionType: 'Short Answer', numberOfQuestions: 1, questionsToAttempt: 1, marksPerQuestion: 8, notes: 'Translate a given Urdu paragraph into English' },
                    { name: 'Essay Writing', questionType: 'Essay', numberOfQuestions: 3, questionsToAttempt: 1, marksPerQuestion: 15, notes: 'Choose one essay topic from given options' },
                    { name: 'Letter/Application Writing', questionType: 'Long Answer', numberOfQuestions: 2, questionsToAttempt: 1, marksPerQuestion: 8, notes: 'Formal letter, application, or report writing' },
                    { name: 'Comprehension Passage', questionType: 'Short Answer', numberOfQuestions: 1, questionsToAttempt: 1, marksPerQuestion: 10, notes: 'Read passage and answer questions' },
                    { name: 'Pair of Words', questionType: 'Short Answer', numberOfQuestions: 5, questionsToAttempt: 5, marksPerQuestion: 1, notes: 'Use pair of words in sentences to show meaning difference' },
                    { name: 'Use of Idioms', questionType: 'Short Answer', numberOfQuestions: 5, questionsToAttempt: 5, marksPerQuestion: 1, notes: 'Use given idioms/phrases in sentences' },
                    { name: 'Translate into Urdu', questionType: 'Short Answer', numberOfQuestions: 1, questionsToAttempt: 1, marksPerQuestion: 8, notes: 'Translate an English paragraph into Urdu' },
                    { name: 'Grammar/Correction', questionType: 'Short Answer', numberOfQuestions: 5, questionsToAttempt: 5, marksPerQuestion: 1, notes: 'Correct grammatical errors in given sentences' },
                ],
            };
        }
        if (normSubject === 'Urdu') {
            return {
                name: `BISE Punjab Urdu Class ${cls}`,
                subject: 'Urdu',
                totalMarks: 100,
                duration: 200,
                sections: [
                    { name: 'Objective - MCQs', questionType: 'MCQ', numberOfQuestions: 20, questionsToAttempt: 20, marksPerQuestion: 1, notes: 'From textbook, grammar (Qawaid), vocabulary' },
                    { name: 'Ghazal (Poetry Explanation)', questionType: 'Short Answer', numberOfQuestions: 3, questionsToAttempt: 2, marksPerQuestion: 5, notes: 'Explain couplets/verses with context and reference' },
                    { name: 'Tashreeh', questionType: 'Short Answer', numberOfQuestions: 3, questionsToAttempt: 2, marksPerQuestion: 4, notes: 'Explain stanza/passage with full reference and explanation' },
                    { name: 'Nazm (Poetry Questions)', questionType: 'Short Answer', numberOfQuestions: 5, questionsToAttempt: 4, marksPerQuestion: 2, notes: 'Answer questions from poems' },
                    { name: 'Nasr (Prose Questions)', questionType: 'Short Answer', numberOfQuestions: 6, questionsToAttempt: 5, marksPerQuestion: 2, notes: 'From prose lessons in textbook' },
                    { name: 'Essay (Mazmoon Nigari)', questionType: 'Essay', numberOfQuestions: 3, questionsToAttempt: 1, marksPerQuestion: 15, notes: 'Write essay on one of the given topics' },
                    { name: 'Letter (Khat Nigari)', questionType: 'Long Answer', numberOfQuestions: 2, questionsToAttempt: 1, marksPerQuestion: 8, notes: 'Formal or informal letter writing' },
                    { name: 'Translation (English to Urdu)', questionType: 'Short Answer', numberOfQuestions: 1, questionsToAttempt: 1, marksPerQuestion: 8, notes: 'Translate an English paragraph into Urdu' },
                    { name: 'Summary (Khulasa)', questionType: 'Short Answer', numberOfQuestions: 1, questionsToAttempt: 1, marksPerQuestion: 5, notes: 'Write summary of a given passage or story' },
                    { name: 'Comprehension (Unseen Passage)', questionType: 'Short Answer', numberOfQuestions: 3, questionsToAttempt: 3, marksPerQuestion: 1, notes: 'Read unseen passage and answer questions' },
                    { name: 'Grammar (Qawaid)', questionType: 'Short Answer', numberOfQuestions: 5, questionsToAttempt: 5, marksPerQuestion: 1, notes: 'Urdu grammar including muhavare and corrections' },
                ],
            };
        }
        if (normSubject === 'Islamiat') {
            return {
                name: `BISE Punjab Islamiat Class ${cls}`,
                subject: 'Islamiat',
                totalMarks: 50,
                duration: 120,
                sections: [
                    { name: 'Objective - MCQs', questionType: 'MCQ', numberOfQuestions: 10, questionsToAttempt: 10, marksPerQuestion: 1, notes: 'From Quran translation, Hadith, Islamic jurisprudence, history' },
                    { name: 'Short Questions - Quran & Sunnah', questionType: 'Short Answer', numberOfQuestions: 8, questionsToAttempt: 6, marksPerQuestion: 3, notes: 'Quranic Ayaat translation, Hadith explanation, Fiqh basics' },
                    { name: 'Short Questions - History & Ethics', questionType: 'Short Answer', numberOfQuestions: 6, questionsToAttempt: 4, marksPerQuestion: 2, notes: 'Islamic history, moral values, social system of Islam' },
                    { name: 'Long Questions', questionType: 'Long Answer', numberOfQuestions: 4, questionsToAttempt: 2, marksPerQuestion: 7, notes: 'Detailed essays on Islamic governance, economy, or Seerat' },
                ],
            };
        }
    }
    return null;
}
function builtInBoardPatternId(board, subject, classLevel) {
    const normBoard = board.toLowerCase().replace(/\s+/g, '_');
    const normSubject = normalizeTemplateSubject(subject).toLowerCase().replace(/\s+/g, '_');
    return `builtin:board:${normBoard}:${normSubject}:${classLevel}`;
}
function legacyPectaPatternId(subject, classLevel) {
    const normSubject = normalizeTemplateSubject(subject).toLowerCase().replace(/\s+/g, '_');
    return `builtin:pecta:${normSubject}:${classLevel}`;
}
function patternIdMatchesBuiltIn(patternId, board, subject, classLevel) {
    const normSubject = normalizeTemplateSubject(subject);
    const cls = classLevel.replace(/\D/g, '') || classLevel;
    return (patternId === builtInBoardPatternId(board, normSubject, cls) ||
        patternId === legacyPectaPatternId(normSubject, cls));
}
function subjectsWithBuiltInTemplates(board, classLevel) {
    const cls = classLevel.replace(/\D/g, '') || classLevel;
    if (board !== 'BISE Punjab')
        return [];
    if (['9', '10'].includes(cls)) {
        return [
            'Physics',
            'Chemistry',
            'Biology',
            'Mathematics',
            'Computer Science',
            'English',
            'Urdu',
            'Islamiat',
            'Pakistan Studies',
        ];
    }
    if (['11', '12'].includes(cls)) {
        return [
            'Physics',
            'Chemistry',
            'Biology',
            'Mathematics',
            'Computer Science',
            'English',
            'Urdu',
            'Islamiat',
        ];
    }
    return [];
}
//# sourceMappingURL=board-templates.js.map