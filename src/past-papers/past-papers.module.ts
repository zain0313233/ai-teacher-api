import { Module } from '@nestjs/common';
import { PastPapersService } from './past-papers.service';
import { PastPapersController } from './past-papers.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PastPapersService],
  controllers: [PastPapersController],
})
export class PastPapersModule {}
