import { Module } from '@nestjs/common';
import { ExamAssistantController } from './exam-assistant.controller';
import { ExamAssistantService } from './exam-assistant.service';

@Module({
  controllers: [ExamAssistantController],
  providers: [ExamAssistantService],
  exports: [ExamAssistantService],
})
export class ExamAssistantModule {}
