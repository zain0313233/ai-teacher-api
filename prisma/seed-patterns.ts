import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

type BoardConfigSeed = {
  board: string;
  country: string;
  educationLevel: string;
  minMarks: number;
  maxMarks: number;
  defaultMarks: number;
  defaultDuration: number;
  subjectMarks: Record<string, number> | null;
};

function subjectMarksForPrisma(
  subjectMarks: Record<string, number> | null,
): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  return subjectMarks === null ? Prisma.JsonNull : subjectMarks;
}

// ===== BOARD CONFIGS =====
// Expected marks ranges per board+level for sanity checking AI output
const BOARD_CONFIGS: BoardConfigSeed[] = [
  // Pakistani Boards - SSC (Matric)
  { board: 'BISE Punjab', country: 'Pakistan', educationLevel: 'secondary', minMarks: 50, maxMarks: 75, defaultMarks: 75, defaultDuration: 160, subjectMarks: { Mathematics: 75, Physics: 60, Chemistry: 60, Biology: 60, English: 75, Urdu: 75, Islamiat: 50, 'Pakistan Studies': 50, 'Computer Science': 75 } },
  { board: 'Federal Board', country: 'Pakistan', educationLevel: 'secondary', minMarks: 50, maxMarks: 75, defaultMarks: 75, defaultDuration: 160, subjectMarks: { Mathematics: 75, Physics: 75, Chemistry: 75, Biology: 75, English: 75, Urdu: 75, Islamiat: 50, 'Pakistan Studies': 50 } },
  { board: 'Sindh Board', country: 'Pakistan', educationLevel: 'secondary', minMarks: 50, maxMarks: 75, defaultMarks: 75, defaultDuration: 160, subjectMarks: null },
  { board: 'KPK Board', country: 'Pakistan', educationLevel: 'secondary', minMarks: 50, maxMarks: 75, defaultMarks: 75, defaultDuration: 160, subjectMarks: null },

  // Pakistani Boards - HSSC (Inter/FSc)
  { board: 'BISE Punjab', country: 'Pakistan', educationLevel: 'higher_secondary', minMarks: 50, maxMarks: 100, defaultMarks: 85, defaultDuration: 200, subjectMarks: { Mathematics: 100, English: 100, Urdu: 100, Physics: 85, Chemistry: 85, Biology: 85, 'Computer Science': 85, Islamiat: 50, 'Pakistan Studies': 50 } },
  { board: 'Federal Board', country: 'Pakistan', educationLevel: 'higher_secondary', minMarks: 50, maxMarks: 100, defaultMarks: 85, defaultDuration: 200, subjectMarks: { Mathematics: 100, English: 100, Urdu: 100, Physics: 85, Chemistry: 85, Biology: 85, Islamiat: 50, 'Pakistan Studies': 50 } },
  { board: 'Sindh Board', country: 'Pakistan', educationLevel: 'higher_secondary', minMarks: 50, maxMarks: 100, defaultMarks: 85, defaultDuration: 200, subjectMarks: null },
  { board: 'KPK Board', country: 'Pakistan', educationLevel: 'higher_secondary', minMarks: 50, maxMarks: 100, defaultMarks: 85, defaultDuration: 200, subjectMarks: null },

  // Cambridge
  { board: 'Cambridge O Level', country: 'International', educationLevel: 'secondary', minMarks: 80, maxMarks: 200, defaultMarks: 100, defaultDuration: 180, subjectMarks: null },
  { board: 'Cambridge A Level', country: 'International', educationLevel: 'higher_secondary', minMarks: 80, maxMarks: 300, defaultMarks: 100, defaultDuration: 180, subjectMarks: null },
  { board: 'Cambridge IGCSE', country: 'International', educationLevel: 'secondary', minMarks: 80, maxMarks: 200, defaultMarks: 100, defaultDuration: 180, subjectMarks: null },

  // India
  { board: 'CBSE', country: 'India', educationLevel: 'secondary', minMarks: 80, maxMarks: 100, defaultMarks: 80, defaultDuration: 180, subjectMarks: null },
  { board: 'CBSE', country: 'India', educationLevel: 'higher_secondary', minMarks: 70, maxMarks: 100, defaultMarks: 100, defaultDuration: 180, subjectMarks: null },
];

// ===== HELPER: verify marks sum before inserting =====
function verifyMarks(name: string, totalMarks: number, sections: any[]): void {
  const sum = sections.reduce((acc: number, s: any) => acc + (s.questionsToAttempt * s.marksPerQuestion), 0);
  if (sum !== totalMarks) {
    throw new Error(`❌ MARKS MISMATCH in "${name}": sections sum=${sum}, declared total=${totalMarks}`);
  }
}

// ===== PATTERN TEMPLATES =====
// All verified ground-truth patterns — EVERY entry is marks-verified
const PATTERN_TEMPLATES = [
  // ==================================================================
  // BISE Punjab - SSC (Class 9-10) — PECTA Smart Syllabus Science = 60 marks
  // MCQ:12 + Short Q2/Q3/Q4: 3×(5×2)=30 + Long: 2×9=18 = 60 ✓
  // ==================================================================
  ...['Physics', 'Chemistry', 'Biology'].flatMap(sub =>
    ['9', '10'].map(cls => {
      const pecta = {
        board: 'BISE Punjab', country: 'Pakistan', subject: sub, classLevel: cls,
        educationLevel: 'secondary',
        name: `BISE Punjab ${sub} Class ${cls} — PECTA Smart Syllabus (2025–2026)`,
        totalMarks: 60, duration: 120, isVerified: true, source: 'manual', confidence: 1.0,
        sections: [
          { name: 'Section A - Objective (MCQs)', questionType: 'MCQ', numberOfQuestions: 12, questionsToAttempt: 12, marksPerQuestion: 1, notes: 'PECTA: 12 MCQs × 1 mark. Typical — 2 each from Ch.3,4,6; 1 each from Ch.1,2,5,7,8,9.' },
          { name: 'Q.2 - Short Questions', questionType: 'Short Answer', numberOfQuestions: 8, questionsToAttempt: 5, marksPerQuestion: 2, notes: 'Chapters 1–3: 8 parts (Ch1:3, Ch2:2, Ch3:3). Attempt any 5 × 2 marks.' },
          { name: 'Q.3 - Short Questions', questionType: 'Short Answer', numberOfQuestions: 8, questionsToAttempt: 5, marksPerQuestion: 2, notes: 'Chapters 4–6: 8 parts (Ch4:3, Ch5:3, Ch6:2). Attempt any 5 × 2 marks.' },
          { name: 'Q.4 - Short Questions', questionType: 'Short Answer', numberOfQuestions: 8, questionsToAttempt: 5, marksPerQuestion: 2, notes: 'Chapters 7–9: 8 parts (Ch7:3, Ch8:3, Ch9:2). Attempt any 5 × 2 marks.' },
          { name: 'Section C - Long Questions', questionType: 'Long Answer', numberOfQuestions: 3, questionsToAttempt: 2, marksPerQuestion: 9, notes: 'Q.5 Ch1+2, Q.6 Ch4+6 (or 3+5), Q.7 Ch7+8. Each 9 marks (5+4). Attempt any 2.' },
        ],
      };
      return pecta;
    })
  ),

  // BISE Punjab - SSC Math/CS — legacy 75 marks (pre-PECTA style)
  ...['Mathematics', 'Computer Science'].flatMap(sub =>
    ['9', '10'].map(cls => ({
      board: 'BISE Punjab', country: 'Pakistan', subject: sub, classLevel: cls,
      educationLevel: 'secondary', name: `BISE Punjab ${sub} Class ${cls}`,
      totalMarks: 75, duration: 160, isVerified: true, source: 'manual', confidence: 1.0,
      sections: [
        { name: 'Section A - Objective (MCQs)', questionType: 'MCQ', numberOfQuestions: 15, questionsToAttempt: 15, marksPerQuestion: 1 },
        { name: 'Section B - Short Questions', questionType: 'Short Answer', numberOfQuestions: 15, questionsToAttempt: 9, marksPerQuestion: 4, notes: `Grouped by chapters with choice.${sub === 'Computer Science' ? ' Includes theory, definitions, short code.' : ' Includes proofs and calculations.'}` },
        { name: 'Section C - Long Questions', questionType: 'Long Answer', numberOfQuestions: 5, questionsToAttempt: 3, marksPerQuestion: 8, notes: `Each has part (a) and part (b).${sub === 'Computer Science' ? ' Includes programs, flowcharts, algorithms.' : ' Detailed proofs and multi-step calculations.'}` },
      ],
    }))
  ),

  // ==================================================================
  // BISE Punjab - SSC English (Class 9-10) — 75 marks
  // MCQ:15×1=15 + Prose:5×2=10 + Poetry:3×2=6 + Translation:1×5=5
  // + Essay:1×10=10 + Letter:1×8=8 + Comprehension:1×8=8
  // + Pair:5×1=5 + Idioms:5×1=5 + Grammar:3×1=3 = 75 ✓
  // ==================================================================
  ...['9', '10'].map(cls => ({
    board: 'BISE Punjab', country: 'Pakistan', subject: 'English', classLevel: cls,
    educationLevel: 'secondary', name: `BISE Punjab English Class ${cls}`,
    totalMarks: 75, duration: 160, isVerified: true, source: 'manual', confidence: 1.0,
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
  })),

  // ==================================================================
  // BISE Punjab - HSSC English (Class 11-12) — 100 marks
  // MCQ:20×1=20 + Prose:5×2=10 + Poetry:3×2=6 + TranslU2E:1×8=8
  // + Essay:1×15=15 + Letter:1×8=8 + Comprehension:1×10=10
  // + Pair:5×1=5 + Idioms:5×1=5 + TranslE2U:1×8=8 + Grammar:5×1=5 = 100 ✓
  // ==================================================================
  ...['11', '12'].map(cls => ({
    board: 'BISE Punjab', country: 'Pakistan', subject: 'English', classLevel: cls,
    educationLevel: 'higher_secondary', name: `BISE Punjab English Class ${cls}`,
    totalMarks: 100, duration: 200, isVerified: true, source: 'manual', confidence: 1.0,
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
  })),

  // ==================================================================
  // BISE Punjab - SSC Urdu (Class 9-10) — 75 marks
  // MCQ:15×1=15 + Ghazal:2×5=10 + Tashreeh:1×5=5 + Nazm:3×2=6
  // + Nasr:4×2=8 + Essay:1×10=10 + Letter:1×8=8 + Transl:1×5=5
  // + Comprehension:3×1=3 + Grammar:5×1=5 = 75 ✓
  // ==================================================================
  ...['9', '10'].map(cls => ({
    board: 'BISE Punjab', country: 'Pakistan', subject: 'Urdu', classLevel: cls,
    educationLevel: 'secondary', name: `BISE Punjab Urdu Class ${cls}`,
    totalMarks: 75, duration: 160, isVerified: true, source: 'manual', confidence: 1.0,
    sections: [
      { name: 'Objective - MCQs', questionType: 'MCQ', numberOfQuestions: 15, questionsToAttempt: 15, marksPerQuestion: 1, notes: 'From textbook, grammar (Qawaid), vocabulary' },
      { name: 'Ghazal (Poetry Explanation)', questionType: 'Short Answer', numberOfQuestions: 3, questionsToAttempt: 2, marksPerQuestion: 5, notes: 'Explain couplets with context and reference (حوالہ و سیاق)' },
      { name: 'Tashreeh (تشریح)', questionType: 'Short Answer', numberOfQuestions: 2, questionsToAttempt: 1, marksPerQuestion: 5, notes: 'Explain verse/passage with reference and context (حوالہ و تشریح)' },
      { name: 'Nazm (Poetry Questions)', questionType: 'Short Answer', numberOfQuestions: 4, questionsToAttempt: 3, marksPerQuestion: 2, notes: 'Answer questions from Nazm/poems' },
      { name: 'Nasr (Prose Questions)', questionType: 'Short Answer', numberOfQuestions: 6, questionsToAttempt: 4, marksPerQuestion: 2, notes: 'From prose lessons in textbook' },
      { name: 'Essay (Mazmoon Nigari)', questionType: 'Essay', numberOfQuestions: 3, questionsToAttempt: 1, marksPerQuestion: 10, notes: 'Write essay on one of the given topics' },
      { name: 'Letter (Khat Nigari)', questionType: 'Long Answer', numberOfQuestions: 2, questionsToAttempt: 1, marksPerQuestion: 8, notes: 'Formal or informal letter writing' },
      { name: 'Translation (English to Urdu)', questionType: 'Short Answer', numberOfQuestions: 1, questionsToAttempt: 1, marksPerQuestion: 5, notes: 'Translate an English paragraph into Urdu' },
      { name: 'Comprehension (Unseen Passage)', questionType: 'Short Answer', numberOfQuestions: 3, questionsToAttempt: 3, marksPerQuestion: 1, notes: 'Read unseen passage and answer questions' },
      { name: 'Grammar (Qawaid)', questionType: 'Short Answer', numberOfQuestions: 5, questionsToAttempt: 5, marksPerQuestion: 1, notes: 'Urdu grammar exercises including muhavare and zarb-ul-misal' },
    ],
  })),

  // ==================================================================
  // BISE Punjab - HSSC Urdu (Class 11-12) — 100 marks
  // MCQ:20×1=20 + Ghazal:2×5=10 + Tashreeh:2×4=8 + Nazm:4×2=8
  // + Nasr:5×2=10 + Essay:1×15=15 + Letter:1×8=8 + Transl:1×8=8
  // + Summary:1×5=5 + Comprehension:3×1=3 + Grammar:5×1=5 = 100 ✓
  // ==================================================================
  ...['11', '12'].map(cls => ({
    board: 'BISE Punjab', country: 'Pakistan', subject: 'Urdu', classLevel: cls,
    educationLevel: 'higher_secondary', name: `BISE Punjab Urdu Class ${cls}`,
    totalMarks: 100, duration: 200, isVerified: true, source: 'manual', confidence: 1.0,
    sections: [
      { name: 'Objective - MCQs', questionType: 'MCQ', numberOfQuestions: 20, questionsToAttempt: 20, marksPerQuestion: 1, notes: 'From textbook, grammar (Qawaid), vocabulary' },
      { name: 'Ghazal (Poetry Explanation)', questionType: 'Short Answer', numberOfQuestions: 3, questionsToAttempt: 2, marksPerQuestion: 5, notes: 'Explain couplets/verses with context and reference (حوالہ و سیاق)' },
      { name: 'Tashreeh (حوالہ و تشریح)', questionType: 'Short Answer', numberOfQuestions: 3, questionsToAttempt: 2, marksPerQuestion: 4, notes: 'Explain stanza/passage with full reference, context, and explanation' },
      { name: 'Nazm (Poetry Questions)', questionType: 'Short Answer', numberOfQuestions: 5, questionsToAttempt: 4, marksPerQuestion: 2, notes: 'Answer questions from poems' },
      { name: 'Nasr (Prose Questions)', questionType: 'Short Answer', numberOfQuestions: 6, questionsToAttempt: 5, marksPerQuestion: 2, notes: 'From prose lessons in textbook' },
      { name: 'Essay (Mazmoon Nigari)', questionType: 'Essay', numberOfQuestions: 3, questionsToAttempt: 1, marksPerQuestion: 15, notes: 'Write essay on one of the given topics' },
      { name: 'Letter (Khat Nigari)', questionType: 'Long Answer', numberOfQuestions: 2, questionsToAttempt: 1, marksPerQuestion: 8, notes: 'Formal or informal letter writing' },
      { name: 'Translation (English to Urdu)', questionType: 'Short Answer', numberOfQuestions: 1, questionsToAttempt: 1, marksPerQuestion: 8, notes: 'Translate an English paragraph into Urdu' },
      { name: 'Summary (Khulasa)', questionType: 'Short Answer', numberOfQuestions: 1, questionsToAttempt: 1, marksPerQuestion: 5, notes: 'Write summary of a given passage or story' },
      { name: 'Comprehension (Unseen Passage)', questionType: 'Short Answer', numberOfQuestions: 3, questionsToAttempt: 3, marksPerQuestion: 1, notes: 'Read unseen passage and answer questions' },
      { name: 'Grammar (Qawaid)', questionType: 'Short Answer', numberOfQuestions: 5, questionsToAttempt: 5, marksPerQuestion: 1, notes: 'Urdu grammar including muhavare, zarb-ul-misal, and corrections' },
    ],
  })),

  // ==================================================================
  // BISE Punjab - SSC Islamiat (Class 9-10) — 50 marks
  // MCQ:12×1=12 + ShortQH:4×3=12 + ShortHist:4×3=12 + Long:2×7=14 = 50 ✓
  // ==================================================================
  ...['9', '10'].map(cls => ({
    board: 'BISE Punjab', country: 'Pakistan', subject: 'Islamiat', classLevel: cls,
    educationLevel: 'secondary', name: `BISE Punjab Islamiat Class ${cls}`,
    totalMarks: 50, duration: 120, isVerified: true, source: 'manual', confidence: 1.0,
    sections: [
      { name: 'Objective - MCQs', questionType: 'MCQ', numberOfQuestions: 12, questionsToAttempt: 12, marksPerQuestion: 1, notes: 'From Quran, Hadith, Islamic history, and ethics' },
      { name: 'Short Questions - Quran & Hadith', questionType: 'Short Answer', numberOfQuestions: 6, questionsToAttempt: 4, marksPerQuestion: 3, notes: 'Translation of Ayaat, Hadith explanation, and Islamic teachings' },
      { name: 'Short Questions - Islamic History', questionType: 'Short Answer', numberOfQuestions: 6, questionsToAttempt: 4, marksPerQuestion: 3, notes: 'Questions from Seerat-un-Nabi, Khulafa-e-Rashideen, Islamic civilization' },
      { name: 'Long Questions', questionType: 'Long Answer', numberOfQuestions: 4, questionsToAttempt: 2, marksPerQuestion: 7, notes: 'Detailed answers on Islamic principles, Seerat, or history' },
    ],
  })),

  // ==================================================================
  // BISE Punjab - HSSC Islamiat (Class 11-12) — 50 marks
  // MCQ:10×1=10 + ShortQS:6×3=18 + ShortHE:4×2=8 + Long:2×7=14 = 50 ✓
  // ==================================================================
  ...['11', '12'].map(cls => ({
    board: 'BISE Punjab', country: 'Pakistan', subject: 'Islamiat', classLevel: cls,
    educationLevel: 'higher_secondary', name: `BISE Punjab Islamiat Class ${cls}`,
    totalMarks: 50, duration: 120, isVerified: true, source: 'manual', confidence: 1.0,
    sections: [
      { name: 'Objective - MCQs', questionType: 'MCQ', numberOfQuestions: 10, questionsToAttempt: 10, marksPerQuestion: 1, notes: 'From Quran translation, Hadith, Islamic jurisprudence, history' },
      { name: 'Short Questions - Quran & Sunnah', questionType: 'Short Answer', numberOfQuestions: 8, questionsToAttempt: 6, marksPerQuestion: 3, notes: 'Quranic Ayaat translation, Hadith explanation, Fiqh basics' },
      { name: 'Short Questions - History & Ethics', questionType: 'Short Answer', numberOfQuestions: 6, questionsToAttempt: 4, marksPerQuestion: 2, notes: 'Islamic history, moral values, social system of Islam' },
      { name: 'Long Questions', questionType: 'Long Answer', numberOfQuestions: 4, questionsToAttempt: 2, marksPerQuestion: 7, notes: 'Detailed essays on Islamic governance, economy, or Seerat' },
    ],
  })),

  // ==================================================================
  // BISE Punjab - SSC Pakistan Studies (Class 9-10) — 50 marks
  // MCQ:15×1=15 + Short:7×3=21 + Long:2×7=14 = 50 ✓
  // ==================================================================
  ...['9', '10'].map(cls => ({
    board: 'BISE Punjab', country: 'Pakistan', subject: 'Pakistan Studies', classLevel: cls,
    educationLevel: 'secondary', name: `BISE Punjab Pakistan Studies Class ${cls}`,
    totalMarks: 50, duration: 120, isVerified: true, source: 'manual', confidence: 1.0,
    sections: [
      { name: 'Objective - MCQs', questionType: 'MCQ', numberOfQuestions: 15, questionsToAttempt: 15, marksPerQuestion: 1, notes: 'From history, geography, civics of Pakistan' },
      { name: 'Short Questions', questionType: 'Short Answer', numberOfQuestions: 12, questionsToAttempt: 7, marksPerQuestion: 3, notes: 'Pakistan Movement, geography, economy, political system' },
      { name: 'Long Questions', questionType: 'Long Answer', numberOfQuestions: 4, questionsToAttempt: 2, marksPerQuestion: 7, notes: 'Detailed answers on creation of Pakistan, constitution, foreign policy' },
    ],
  })),

  // ==================================================================
  // BISE Punjab - HSSC Science (Class 11-12) — 85 marks
  // MCQ:17×1=17 + Short:22×2=44 + Long:3×8=24 = 85 ✓
  // ==================================================================
  ...['Physics', 'Chemistry', 'Biology'].flatMap(sub =>
    ['11', '12'].map(cls => ({
      board: 'BISE Punjab', country: 'Pakistan', subject: sub, classLevel: cls,
      educationLevel: 'higher_secondary', name: `BISE Punjab ${sub} Class ${cls}`,
      totalMarks: 85, duration: 200, isVerified: true, source: 'manual', confidence: 1.0,
      sections: [
        { name: 'Section A - Objective (MCQs)', questionType: 'MCQ', numberOfQuestions: 17, questionsToAttempt: 17, marksPerQuestion: 1 },
        { name: 'Section B - Short Questions', questionType: 'Short Answer', numberOfQuestions: 30, questionsToAttempt: 22, marksPerQuestion: 2, notes: `Grouped by chapter sections with choice (attempt specified from each group).${sub === 'Biology' ? ' Includes diagrams.' : ' Includes conceptual and short numerical.'}` },
        { name: 'Section C - Long Questions', questionType: 'Long Answer', numberOfQuestions: 5, questionsToAttempt: 3, marksPerQuestion: 8, notes: `Each has part (a) and part (b).${sub === 'Biology' ? ' Includes diagrams and labeling.' : ' Part (a) theory/derivation, part (b) numerical/calculations.'}` },
      ],
    }))
  ),

  // ==================================================================
  // BISE Punjab - HSSC Computer Science (Class 11-12) — 85 marks
  // MCQ:17×1=17 + Short:22×2=44 + Long:3×8=24 = 85 ✓
  // ==================================================================
  ...['11', '12'].map(cls => ({
    board: 'BISE Punjab', country: 'Pakistan', subject: 'Computer Science', classLevel: cls,
    educationLevel: 'higher_secondary', name: `BISE Punjab Computer Science Class ${cls}`,
    totalMarks: 85, duration: 200, isVerified: true, source: 'manual', confidence: 1.0,
    sections: [
      { name: 'Section A - Objective (MCQs)', questionType: 'MCQ', numberOfQuestions: 17, questionsToAttempt: 17, marksPerQuestion: 1 },
      { name: 'Section B - Short Questions', questionType: 'Short Answer', numberOfQuestions: 30, questionsToAttempt: 22, marksPerQuestion: 2, notes: 'Grouped by chapters. Theory, definitions, short code snippets.' },
      { name: 'Section C - Long Questions', questionType: 'Long Answer', numberOfQuestions: 5, questionsToAttempt: 3, marksPerQuestion: 8, notes: 'Programs, algorithms, detailed explanations with part (a) and (b).' },
    ],
  })),

  // ==================================================================
  // BISE Punjab - HSSC Mathematics (Class 11-12) — 100 marks
  // MCQ:20×1=20 + Short:20×2=40 + Long:5×8=40 = 100 ✓
  // ==================================================================
  ...['11', '12'].map(cls => ({
    board: 'BISE Punjab', country: 'Pakistan', subject: 'Mathematics', classLevel: cls,
    educationLevel: 'higher_secondary', name: `BISE Punjab Mathematics Class ${cls}`,
    totalMarks: 100, duration: 200, isVerified: true, source: 'manual', confidence: 1.0,
    sections: [
      { name: 'Section A - Objective (MCQs)', questionType: 'MCQ', numberOfQuestions: 20, questionsToAttempt: 20, marksPerQuestion: 1 },
      { name: 'Section B - Short Questions', questionType: 'Short Answer', numberOfQuestions: 30, questionsToAttempt: 20, marksPerQuestion: 2, notes: 'Grouped by chapters. Short proofs, calculations, and definitions.' },
      { name: 'Section C - Long Questions', questionType: 'Long Answer', numberOfQuestions: 8, questionsToAttempt: 5, marksPerQuestion: 8, notes: 'Detailed proofs, multi-step problems. Each has part (a) and part (b).' },
    ],
  })),
];

async function main() {
  console.log('🌱 Seeding pattern templates and board configs...');

  // Seed Board Configs
  for (const config of BOARD_CONFIGS) {
    const subjectMarks = subjectMarksForPrisma(config.subjectMarks);
    await prisma.boardConfig.upsert({
      where: {
        board_country_educationLevel: {
          board: config.board,
          country: config.country,
          educationLevel: config.educationLevel,
        },
      },
      update: {
        minMarks: config.minMarks,
        maxMarks: config.maxMarks,
        defaultMarks: config.defaultMarks,
        defaultDuration: config.defaultDuration,
        subjectMarks,
      },
      create: {
        board: config.board,
        country: config.country,
        educationLevel: config.educationLevel,
        minMarks: config.minMarks,
        maxMarks: config.maxMarks,
        defaultMarks: config.defaultMarks,
        defaultDuration: config.defaultDuration,
        subjectMarks,
      },
    });
  }
  console.log(`✅ Seeded ${BOARD_CONFIGS.length} board configs`);

  // Verify ALL marks before touching DB
  console.log('🔍 Verifying marks for all templates...');
  for (const template of PATTERN_TEMPLATES) {
    verifyMarks(template.name, template.totalMarks, template.sections);
  }
  console.log(`✅ All ${PATTERN_TEMPLATES.length} templates pass marks verification`);

  // Seed Pattern Templates
  let created = 0;
  let updated = 0;
  for (const template of PATTERN_TEMPLATES) {
    const result = await prisma.patternTemplate.upsert({
      where: {
        board_subject_classLevel_country: {
          board: template.board,
          subject: template.subject,
          classLevel: template.classLevel,
          country: template.country,
        },
      },
      update: {
        name: template.name,
        totalMarks: template.totalMarks,
        duration: template.duration,
        sections: template.sections,
        isVerified: template.isVerified,
        source: template.source,
        confidence: template.confidence,
      },
      create: template,
    });
    if (result.createdAt.getTime() === result.updatedAt.getTime()) {
      created++;
    } else {
      updated++;
    }
  }
  console.log(`✅ Seeded ${PATTERN_TEMPLATES.length} pattern templates (${created} created, ${updated} updated)`);
  console.log('🎉 Seeding complete!');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
