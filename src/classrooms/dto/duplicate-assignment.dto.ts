import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, IsString, Max, Min, ValidateIf } from 'class-validator';

export class DuplicateAssignmentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @IsOptional()
  @IsString()
  @IsIn(['practice', 'timed'])
  assignmentMode?: string;

  @ValidateIf((o) => o.assignmentMode === 'timed')
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(5)
  @Max(180)
  durationMinutes?: number;
}
