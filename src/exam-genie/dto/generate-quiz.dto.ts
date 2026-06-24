import { IsString, IsInt, IsOptional, IsIn, Min, Max, IsArray } from 'class-validator';

export class GenerateQuizDto {
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
  @IsIn(['mcq', 'short', 'long', 'mcq_short', 'mcq_long', 'short_long', 'all'])
  quizType?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  questionCount?: number;

  @IsOptional()
  @IsString()
  @IsIn(['normal', 'smart', 'prediction'])
  mode?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sourceDocumentIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sourcePastPaperIds?: string[];

  @IsOptional()
  @IsString()
  patternId?: string;
}
