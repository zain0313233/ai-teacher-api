import { Module, forwardRef } from '@nestjs/common';
import { ClassChatController } from './class-chat.controller';
import { ClassChatService } from './class-chat.service';
import { PrismaModule } from '../prisma/prisma.module';
import { DocumentsModule } from '../documents/documents.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [PrismaModule, DocumentsModule, forwardRef(() => RealtimeModule)],
  controllers: [ClassChatController],
  providers: [ClassChatService],
  exports: [ClassChatService],
})
export class ClassChatModule {}
