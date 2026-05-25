/**
 * PECTA Smart Syllabus (2025–2026) — Punjab Board SSC Science paper structure.
 * 60 marks, ~2 hours. Used by seed data and AI Pattern Assistant Layer 1.
 */

export type PatternSectionDef = {
  name: string;
  questionType: 'MCQ' | 'Short Answer' | 'Long Answer' | 'Case Study' | 'Practical' | 'Essay' | 'Numerical';
  numberOfQuestions: number;
  questionsToAttempt: number;
  marksPerQuestion: number;
  notes?: string;
};

export type PatternDataDef = {
  name: string;
  subject: string;
  totalMarks: number;
  duration: number;
  sections: PatternSectionDef[];
};

const PECTA_SCIENCE_SUBJECTS = ['Physics', 'Chemistry', 'Biology'] as const;

export function isPectaScienceSubject(subject: string): boolean {
  const s = subject.trim().toLowerCase();
  return PECTA_SCIENCE_SUBJECTS.some((p) => s.includes(p.toLowerCase()));
}

/** Detect PECTA / Smart Syllabus / 60-mark intent from user text. */
export function detectSyllabusVariant(userPrompt: string): 'pecta' | 'legacy' {
  const p = userPrompt.toLowerCase();
  const pectaSignals = [
    'pecta',
    'smart syllabus',
    'smart-syllabus',
    '60 marks',
    '60 mark',
    'total marks 60',
    'total mark 60',
    '2025-2026',
    '2025–2026',
    '2025/2026',
    'q.2',
    'q.3',
    'q.4',
    '12 mcq',
    '12 mcqs',
    'attempt any 5',
    'attempt 5 from',
    '8 parts',
  ];
  const legacySignals = [
    '75 marks',
    '75 mark',
    '15 mcq',
    '15 mcqs',
    'legacy',
    'old pattern',
    'pre-pecta',
  ];
  const pectaScore = pectaSignals.filter((s) => p.includes(s)).length;
  const legacyScore = legacySignals.filter((s) => p.includes(s)).length;
  if (legacyScore > pectaScore) return 'legacy';
  if (pectaScore > 0) return 'pecta';
  // Default Punjab Class 9–10 science to current PECTA era
  if (
    (p.includes('punjab') || p.includes('bise') || p.includes('lahore')) &&
    (p.includes('physics') || p.includes('chemistry') || p.includes('biology')) &&
    (p.includes('class 9') || p.includes('class 10') || p.includes('9th') || p.includes('10th') || /\bclass[\s-]*9\b/.test(p) || /\bclass[\s-]*10\b/.test(p))
  ) {
    return 'pecta';
  }
  return 'legacy';
}

export function buildPectaSciencePattern(subject: string, classLevel: string): PatternDataDef {
  const sub = subject.trim();
  const cls = classLevel.trim();
  const subjectNotes: Record<string, string> = {
    Physics: 'Includes derivations, diagram-based questions, and numerical problems.',
    Chemistry: 'Includes chemical equations, mechanisms, and numerical problems.',
    Biology: 'Includes diagrams, labeling, and short conceptual answers.',
  };
  const extra = subjectNotes[sub] || 'Science subject — theory and numerical as per textbook.';

  const sections: PatternSectionDef[] = [
    {
      name: 'Section A - Objective (MCQs)',
      questionType: 'MCQ',
      numberOfQuestions: 12,
      questionsToAttempt: 12,
      marksPerQuestion: 1,
      notes:
        'PECTA Smart Syllabus: 12 MCQs × 1 mark. Typical split — 2 MCQs each from Ch.3, 4, 6; 1 MCQ each from Ch.1, 2, 5, 7, 8, 9. Separate objective sheet (~15 min).',
    },
    {
      name: 'Q.2 - Short Questions',
      questionType: 'Short Answer',
      numberOfQuestions: 8,
      questionsToAttempt: 5,
      marksPerQuestion: 2,
      notes: `Chapters 1, 2, 3 — 8 parts (Ch1: 3, Ch2: 2, Ch3: 3). Attempt any 5 parts × 2 marks = 10 marks. ${extra}`,
    },
    {
      name: 'Q.3 - Short Questions',
      questionType: 'Short Answer',
      numberOfQuestions: 8,
      questionsToAttempt: 5,
      marksPerQuestion: 2,
      notes: 'Chapters 4, 5, 6 — 8 parts (Ch4: 3, Ch5: 3, Ch6: 2). Attempt any 5 parts × 2 marks = 10 marks.',
    },
    {
      name: 'Q.4 - Short Questions',
      questionType: 'Short Answer',
      numberOfQuestions: 8,
      questionsToAttempt: 5,
      marksPerQuestion: 2,
      notes:
        'Chapters 7, 8, 9 — 8 parts (Ch7: 3, Ch8: 3, Ch9: 2). Attempt any 5 parts × 2 marks = 10 marks. Ch.9 often MCQ/short only.',
    },
    {
      name: 'Section C - Long Questions',
      questionType: 'Long Answer',
      numberOfQuestions: 3,
      questionsToAttempt: 2,
      marksPerQuestion: 9,
      notes:
        'Q.5: Ch1+2 (Physical quantities & Kinematics). Q.6: Ch4+6 or Ch3+5 (board pairing). Q.7: Ch7+8. Each long Q = 9 marks (often 5+4 theory+numerical). Attempt any 2.',
    },
  ];

  return {
    name: `BISE Punjab ${sub} Class ${cls} — PECTA Smart Syllabus (2025–2026)`,
    subject: sub,
    totalMarks: 60,
    duration: 120,
    sections,
  };
}

export function buildPectaTemplateIfApplicable(
  board: string | null,
  country: string | null,
  subject: string,
  classLevel: string | null,
  syllabusVariant: 'pecta' | 'legacy',
): PatternDataDef | null {
  if (syllabusVariant !== 'pecta') return null;
  if (board !== 'BISE Punjab' || country !== 'Pakistan') return null;
  if (!classLevel || !['9', '10'].includes(classLevel)) return null;
  if (!isPectaScienceSubject(subject)) return null;
  return buildPectaSciencePattern(subject, classLevel);
}
