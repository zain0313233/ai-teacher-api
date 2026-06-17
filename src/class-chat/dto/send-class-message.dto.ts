import { IsIn, IsInt, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class SendClassMessageDto {
  @IsUUID()
  classroomId: string;

  @IsOptional()
  @IsString()
  @IsIn(['text', 'image', 'document', 'voice'])
  messageType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  content?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsInt()
  fileSize?: number;

  @IsOptional()
  @IsInt()
  durationSec?: number;

  @IsOptional()
  @IsUUID()
  replyToId?: string;
}
