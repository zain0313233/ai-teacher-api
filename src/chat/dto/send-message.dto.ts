import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
