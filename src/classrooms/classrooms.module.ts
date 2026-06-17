import { Module } from '@nestjs/common';
import { ClassroomsController } from './classrooms.controller';
import { ClassroomsService } from './classrooms.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ExamGenieModule } from '../exam-genie/exam-genie.module';
import { PatternsModule } from '../patterns/patterns.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [PrismaModule, ExamGenieModule, PatternsModule, NotificationsModule],
  controllers: [ClassroomsController],
  providers: [ClassroomsService, RolesGuard],
})
export class ClassroomsModule {}
