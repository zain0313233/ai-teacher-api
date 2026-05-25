import { IsOptional, IsString, IsObject } from 'class-validator';

export class CreateSessionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsObject()
  context?: Record<string, any>;
}
