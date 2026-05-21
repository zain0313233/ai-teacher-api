import { IsString, MinLength, MaxLength, IsOptional, IsArray, IsInt, IsBoolean, Min, Max } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  // ── Student profile fields ─────────────────────────────────────────────────
  @IsOptional() @IsString() educationLevel?: string;
  @IsOptional() @IsString() classGrade?: string;
  @IsOptional() @IsString() group?: string;
  @IsOptional() @IsString() board?: string;
  @IsOptional() @IsString() degree?: string;
  @IsOptional() @IsString() semester?: string;
  @IsOptional() @IsArray()  subjects?: string[];
  @IsOptional() @IsString() targetExam?: string;
  @IsOptional() @IsString() schoolName?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsBoolean() onboardingDone?: boolean;

  // ── Teacher profile fields ─────────────────────────────────────────────────
  @IsOptional() @IsArray()  subjectsTaught?: string[];
  @IsOptional() @IsArray()  classesTaught?: string[];
  @IsOptional() @IsString() institutionType?: string;
  @IsOptional() @IsInt() @Min(0) @Max(50) experienceYears?: number;
}
