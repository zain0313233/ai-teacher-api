import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class ImportFromAssignmentDto {
  @IsString()
  assignmentId: string;

  @IsOptional()
  @IsUUID()
  bankId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  bankName?: string;
}
