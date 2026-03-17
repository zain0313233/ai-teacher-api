import { IsEnum } from 'class-validator';

export class UpdatePlanDto {
  @IsEnum(['FREE', 'BASIC', 'PRO'])
  plan: 'FREE' | 'BASIC' | 'PRO';
}
