import { Module } from '@nestjs/common';
import { ExamGenieController } from './exam-genie.controller';
import { ExamGenieService } from './exam-genie.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PastPapersModule } from '../past-papers/past-papers.module';
import { PatternsModule } from '../patterns/patterns.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [PrismaModule, PastPapersModule, PatternsModule, AnalyticsModule],
  controllers: [ExamGenieController],
  providers: [ExamGenieService],
  exports: [ExamGenieService],
})
export class ExamGenieModule {}
