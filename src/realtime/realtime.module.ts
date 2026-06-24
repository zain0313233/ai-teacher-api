import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { RealtimeGateway } from './realtime.gateway';
import { ClassChatModule } from '../class-chat/class-chat.module';

@Module({
  imports: [PrismaModule, JwtModule.register({}), forwardRef(() => ClassChatModule)],
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
