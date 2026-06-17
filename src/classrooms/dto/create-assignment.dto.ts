import {
  IsString,
  IsInt,
  IsOptional,
  IsIn,
  Min,
  Max,
  IsDateString,
  ValidateIf,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAssignmentDto {
  @IsString()
  title: string;

  @IsString()
  subject: string;

  @IsInt()
  @Min(1)
  @Max(50)
  chapterStart: number;

  @IsInt()
  @Min(1)
  @Max(50)
  chapterEnd: number;

  @IsOptional()
  @IsString()
  patternId?: string;

  @ValidateIf((o) => !o.patternId)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  questionCount?: number;

  @IsOptional()
  @IsString()
  @IsIn(['normal', 'smart', 'prediction'])
  mode?: string;

  @ValidateIf((o) => !o.patternId)
  @IsOptional()
  @IsString()
  @IsIn(['mcq', 'short', 'long', 'mcq_short', 'mcq_long', 'short_long', 'all'])
  quizType?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsString()
  @IsIn(['practice', 'timed'])
  assignmentMode?: string;

  @ValidateIf((o) => o.assignmentMode === 'timed')
  @Type(() => Number)
  @IsInt()
  @Min(5)
  @Max(180)
  durationMinutes?: number;

  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @IsOptional()
  @IsBoolean()
  allowReviewAfterSubmit?: boolean;
}
