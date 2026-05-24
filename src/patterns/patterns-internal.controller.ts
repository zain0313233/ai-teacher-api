import {
  Controller,
  Get,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { PatternsService } from './patterns.service';
import { InternalApiGuard } from '../common/guards/internal-api.guard';

/** Service-to-service pattern resolution for AI engine (chat exam generation). */
@Controller('patterns/internal')
@UseGuards(InternalApiGuard)
export class PatternsInternalController {
  constructor(private readonly patternsService: PatternsService) {}

  @Get('resolve')
  async resolveForGeneration(
    @Query('userId') userId: string,
    @Query('subject') subject: string,
    @Query('patternId') patternId?: string,
  ) {
    if (!userId || !subject) {
      throw new NotFoundException('userId and subject are required');
    }
    const pattern = await this.patternsService.resolvePatternForGeneration(
      userId,
      subject,
      patternId,
    );
    if (!pattern) {
      throw new NotFoundException('No pattern found for user/subject');
    }
    return pattern;
  }
}
