import { IsString, IsNumber, IsArray, IsOptional, Min } from 'class-validator';

export class UpdatePatternDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  totalMarks?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  duration?: number;

  @IsArray()
  @IsOptional()
  sections?: any[];
}
