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
export declare function isPectaScienceSubject(subject: string): boolean;
export declare function detectSyllabusVariant(userPrompt: string): 'pecta' | 'legacy';
export declare function buildPectaSciencePattern(subject: string, classLevel: string): PatternDataDef;
export declare function buildPectaTemplateIfApplicable(board: string | null, country: string | null, subject: string, classLevel: string | null, syllabusVariant: 'pecta' | 'legacy'): PatternDataDef | null;
