import {
  IsString,
  IsOptional,
  IsIn,
  IsObject,
  MaxLength,
} from 'class-validator';

export class CreateQuestionBankItemDto {
  @IsString()
  questionText: string;

  @IsOptional()
  @IsString()
  @IsIn(['mcq', 'short', 'long'])
  questionType?: string;

  @IsOptional()
  @IsObject()
  options?: Record<string, string>;

  @IsString()
  correctOption: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  topicTag?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  concept?: string;

  @IsOptional()
  @IsString()
  @IsIn(['easy', 'medium', 'hard'])
  difficulty?: string;

  @IsOptional()
  @IsString()
  explanation?: string;
}

export class UpdateQuestionBankItemDto {
  @IsOptional()
  @IsString()
  questionText?: string;

  @IsOptional()
  @IsString()
  @IsIn(['mcq', 'short', 'long'])
  questionType?: string;

  @IsOptional()
  @IsObject()
  options?: Record<string, string>;

  @IsOptional()
  @IsString()
  correctOption?: string;

  @IsOptional()
  @IsString()
  topicTag?: string;

  @IsOptional()
  @IsString()
  concept?: string;

  @IsOptional()
  @IsString()
  difficulty?: string;

  @IsOptional()
  @IsString()
  explanation?: string;
}
