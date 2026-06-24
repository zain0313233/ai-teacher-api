import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateClassroomDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @IsString()
  subject: string;

  @IsOptional()
  @IsString()
  classGrade?: string;

  @IsOptional()
  @IsString()
  board?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
