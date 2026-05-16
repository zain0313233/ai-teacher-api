import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SupabaseService } from '../documents/supabase.service';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController],
  providers: [AdminService, SupabaseService],
})
export class AdminModule {}
