import { Module } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SupabaseService } from '../documents/supabase.service';

@Module({
  imports: [PrismaModule],
  providers: [ExamsService, SupabaseService],
  controllers: [ExamsController],
  exports: [ExamsService],
})
export class ExamsModule {}
