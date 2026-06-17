import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ClassChatService } from './class-chat.service';
import { SendClassMessageDto } from './dto/send-class-message.dto';

@Controller('classrooms/chat')
@UseGuards(JwtAuthGuard)
export class ClassChatController {
  constructor(private readonly classChatService: ClassChatService) {}

  @Get(':classroomId/messages')
  getMessages(
    @Request() req,
    @Param('classroomId') classroomId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.classChatService.getMessages(
      req.user.id,
      classroomId,
      cursor,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Post(':classroomId/messages')
  async sendMessage(@Request() req, @Param('classroomId') classroomId: string, @Body() body: Omit<SendClassMessageDto, 'classroomId'>) {
    const message = await this.classChatService.sendMessage(req.user.id, {
      classroomId,
      ...body,
    });
    return { success: true, message };
  }

  @Post(':classroomId/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 15 * 1024 * 1024 },
    }),
  )
  async uploadFile(
    @Request() req,
    @Param('classroomId') classroomId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('messageType') messageType?: string,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    const type =
      messageType === 'voice' ? 'voice' : messageType === 'document' ? 'document' : 'image';
    return this.classChatService.uploadAttachment(req.user.id, classroomId, file, type);
  }
}
