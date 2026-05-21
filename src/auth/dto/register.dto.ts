import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsIn, IsArray, IsInt, Min, Max } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  @IsIn(['USER', 'TEACHER', 'ADMIN'])
  role?: string;

  // ── Student profile fields ─────────────────────────────────────────────────
  @IsOptional()
  @IsString()
  @IsIn(['matric', 'fsc', 'o_level', 'graduation', 'self_learner'])
  educationLevel?: string;

  @IsOptional()
  @IsString()
  classGrade?: string; // '9' | '10' | '11' | '12'

  @IsOptional()
  @IsString()
  group?: string; // pre_medical | pre_engineering | ics | icom | science | arts

  @IsOptional()
  @IsString()
  board?: string; // punjab | federal | sindh | kpk | cambridge

  @IsOptional()
  @IsString()
  degree?: string;

  @IsOptional()
  @IsString()
  semester?: string;

  @IsOptional()
  @IsArray()
  subjects?: string[];

  @IsOptional()
  @IsString()
  targetExam?: string;

  @IsOptional()
  @IsString()
  schoolName?: string;

  @IsOptional()
  @IsString()
  city?: string;

  // ── Teacher profile fields ─────────────────────────────────────────────────
  @IsOptional()
  @IsArray()
  subjectsTaught?: string[];

  @IsOptional()
  @IsArray()
  classesTaught?: string[];

  @IsOptional()
  @IsString()
  institutionType?: string; // school | college | academy | tutor

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  experienceYears?: number;
}
