import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DocumentsModule } from './documents/documents.module';
import { ExamsModule } from './exams/exams.module';
import { PatternsModule } from './patterns/patterns.module';
import { PastPapersModule } from './past-papers/past-papers.module';
import { ExamAssistantModule } from './exam-assistant/exam-assistant.module';
import { AdminModule } from './admin/admin.module';
import { ChatModule } from './chat/chat.module';
import { ExamGenieModule } from './exam-genie/exam-genie.module';
import { ClassroomsModule } from './classrooms/classrooms.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RealtimeModule } from './realtime/realtime.module';
import { ClassChatModule } from './class-chat/class-chat.module';
import { QuestionBanksModule } from './question-banks/question-banks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    DocumentsModule,
    ExamsModule,
    PatternsModule,
    PastPapersModule,
    ExamAssistantModule,
    AdminModule,
    ChatModule,
    ExamGenieModule,
    ClassroomsModule,
    NotificationsModule,
    RealtimeModule,
    ClassChatModule,
    QuestionBanksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
