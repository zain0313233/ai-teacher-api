import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @IsOptional()
  @IsBoolean()
  emailNotifyAssignments?: boolean;

  @IsOptional()
  @IsBoolean()
  emailNotifyDueReminders?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppNotifications?: boolean;
}
