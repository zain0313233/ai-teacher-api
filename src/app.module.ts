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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
