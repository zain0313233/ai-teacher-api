import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { SupabaseService } from './supabase.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [DocumentsService, SupabaseService],
  controllers: [DocumentsController],
  exports: [DocumentsService],
})
export class DocumentsModule {}
