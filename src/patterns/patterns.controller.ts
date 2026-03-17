import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PatternsService } from './patterns.service';
import { CreatePatternDto } from './dto/create-pattern.dto';
import { UpdatePatternDto } from './dto/update-pattern.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('patterns')
@UseGuards(JwtAuthGuard)
export class PatternsController {
  constructor(private readonly patternsService: PatternsService) {}

  @Post()
  async createPattern(@Request() req, @Body() createPatternDto: CreatePatternDto) {
    const pattern = await this.patternsService.createPattern(
      req.user.id,
      createPatternDto,
    );
    return pattern;
  }

  @Get()
  async getUserPatterns(@Request() req) {
    const patterns = await this.patternsService.getUserPatterns(req.user.id);
    return patterns;
  }

  @Get('stats')
  async getPatternStats(@Request() req) {
    const stats = await this.patternsService.getPatternStats(req.user.id);
    return stats;
  }

  @Get(':id')
  async getPattern(@Request() req, @Param('id') id: string) {
    const pattern = await this.patternsService.getPatternById(id, req.user.id);
    return pattern;
  }

  @Put(':id')
  async updatePattern(
    @Request() req,
    @Param('id') id: string,
    @Body() updatePatternDto: UpdatePatternDto,
  ) {
    const pattern = await this.patternsService.updatePattern(
      id,
      req.user.id,
      updatePatternDto,
    );
    return pattern;
  }

  @Delete(':id')
  async deletePattern(@Request() req, @Param('id') id: string) {
    const result = await this.patternsService.deletePattern(id, req.user.id);
    return result;
  }

  @Post(':id/use')
  async markPatternAsUsed(@Request() req, @Param('id') id: string) {
    await this.patternsService.markAsUsed(id, req.user.id);
    return { message: 'Pattern marked as used' };
  }
}
