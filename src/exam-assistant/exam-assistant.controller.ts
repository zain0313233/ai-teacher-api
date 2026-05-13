import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ExamAssistantService } from './exam-assistant.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('exam-assistant')
@UseGuards(JwtAuthGuard)
export class ExamAssistantController {
  constructor(private readonly examAssistantService: ExamAssistantService) {}

  @Post('chat')
  async chat(@Request() req, @Body() body: { message: string; context?: any }) {
    const result = await this.examAssistantService.chat({
      userId: req.user.id,
      message: body.message,
      context: body.context,
    });

    return result;
  }

  @Get('history')
  async getHistory(@Request() req) {
    const result = await this.examAssistantService.getConversationHistory(
      req.user.id
    );
    return result;
  }

  @Delete('history')
  async clearHistory(@Request() req) {
    const result = await this.examAssistantService.clearConversationHistory(
      req.user.id
    );
    return result;
  }

  @Get('health')
  async health() {
    const result = await this.examAssistantService.healthCheck();
    return result;
  }
}
