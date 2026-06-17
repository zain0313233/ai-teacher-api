import { PatternDataDef, PatternSectionDef } from './pecta-templates';
export type { PatternDataDef, PatternSectionDef };
export declare function normalizeTemplateSubject(subject: string): string;
export declare function buildBoardTemplateFromCode(board: string | null, country: string | null, subject: string, classLevel: string | null, syllabusVariant?: 'pecta' | 'legacy'): PatternDataDef | null;
export declare function builtInBoardPatternId(board: string, subject: string, classLevel: string): string;
export declare function legacyPectaPatternId(subject: string, classLevel: string): string;
export declare function patternIdMatchesBuiltIn(patternId: string, board: string, subject: string, classLevel: string): boolean;
export declare function subjectsWithBuiltInTemplates(board: string, classLevel: string): string[];
