import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateSessionDto } from './dto/create-session.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('sessions')
  async getSessions(@Request() req) {
    const sessions = await this.chatService.getSessions(req.user.id);
    return { success: true, sessions };
  }

  @Post('sessions')
  async createSession(@Request() req, @Body() dto: CreateSessionDto) {
    const session = await this.chatService.createSession(req.user.id, dto);
    return { success: true, session };
  }

  @Get('sessions/:id')
  async getSession(@Request() req, @Param('id') id: string) {
    const session = await this.chatService.getSession(req.user.id, id);
    return { success: true, session };
  }

  @Post('sessions/:id/messages')
  async addMessage(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    const message = await this.chatService.addMessage(req.user.id, id, dto);
    return { success: true, message };
  }

  @Patch('sessions/:id')
  async updateSession(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { title: string },
  ) {
    const session = await this.chatService.updateSessionTitle(req.user.id, id, body.title);
    return { success: true, session };
  }

  @Delete('sessions/:id')
  async deleteSession(@Request() req, @Param('id') id: string) {
    return this.chatService.deleteSession(req.user.id, id);
  }
}
