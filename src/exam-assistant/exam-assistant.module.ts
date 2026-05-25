import { Module } from '@nestjs/common';
import { ExamAssistantController } from './exam-assistant.controller';
import { ExamAssistantService } from './exam-assistant.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ExamsModule } from '../exams/exams.module';

@Module({
  imports: [PrismaModule, ExamsModule],
  controllers: [ExamAssistantController],
  providers: [ExamAssistantService],
  exports: [ExamAssistantService],
})
export class ExamAssistantModule {}
