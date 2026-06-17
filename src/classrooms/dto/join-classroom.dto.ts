import { IsString, Length } from 'class-validator';

export class JoinClassroomDto {
  @IsString()
  @Length(4, 12)
  joinCode: string;
}
