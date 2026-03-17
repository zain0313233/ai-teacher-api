import { IsString, IsNotEmpty, IsNumber, IsArray, Min } from 'class-validator';

export class CreatePatternDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsNumber()
  @Min(1)
  totalMarks: number;

  @IsNumber()
  @Min(1)
  duration: number; // in minutes

  @IsArray()
  sections: any[]; // Array of section configurations
}
