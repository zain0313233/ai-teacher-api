import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';

class QuizAnswerDto {
  @IsString()
  questionId: string;

  @IsString()
  selectedOption: string;
}

export class SubmitQuizDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizAnswerDto)
  answers: QuizAnswerDto[];

  @IsOptional()
  @IsBoolean()
  autoSubmitted?: boolean;
}
