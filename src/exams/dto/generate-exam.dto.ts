import { IsString, IsArray, IsObject } from 'class-validator';

export class GenerateExamDto {
  @IsString()
  subject: string;

  @IsString()
  examType: string;

  @IsArray()
  @IsString({ each: true })
  topics: string[];

  @IsObject()
  structure: {
    mcqs?: number;
    shortQuestions?: number;
    longQuestions?: number;
  };
}
