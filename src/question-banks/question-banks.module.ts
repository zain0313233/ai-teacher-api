import { Module } from '@nestjs/common';
import { QuestionBanksController } from './question-banks.controller';
import { QuestionBanksService } from './question-banks.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [PrismaModule],
  controllers: [QuestionBanksController],
  providers: [QuestionBanksService, RolesGuard],
  exports: [QuestionBanksService],
})
export class QuestionBanksModule {}
