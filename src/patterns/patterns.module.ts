import { Module } from '@nestjs/common';
import { PatternsController } from './patterns.controller';
import { PatternsInternalController } from './patterns-internal.controller';
import { PatternsService } from './patterns.service';
import { PrismaModule } from '../prisma/prisma.module';
import { InternalApiGuard } from '../common/guards/internal-api.guard';

@Module({
  imports: [PrismaModule],
  controllers: [PatternsController, PatternsInternalController],
  providers: [PatternsService, InternalApiGuard],
  exports: [PatternsService],
})
export class PatternsModule {}
