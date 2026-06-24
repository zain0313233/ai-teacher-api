import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { QuestionBanksService } from './question-banks.service';
import { CreateQuestionBankDto, UpdateQuestionBankDto } from './dto/create-question-bank.dto';
import {
  CreateQuestionBankItemDto,
  UpdateQuestionBankItemDto,
} from './dto/question-bank-item.dto';
import { ImportFromAssignmentDto } from './dto/import-from-assignment.dto';

@Controller('question-banks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('TEACHER')
export class QuestionBanksController {
  constructor(private readonly questionBanksService: QuestionBanksService) {}

  @Get('classroom/:classroomId')
  listBanks(@Request() req, @Param('classroomId') classroomId: string) {
    return this.questionBanksService.listBanks(req.user.id, classroomId);
  }

  @Post('classroom/:classroomId')
  createBank(
    @Request() req,
    @Param('classroomId') classroomId: string,
    @Body() dto: CreateQuestionBankDto,
  ) {
    return this.questionBanksService.createBank(req.user.id, classroomId, dto);
  }

  @Post('classroom/:classroomId/import-from-assignment')
  importFromAssignment(
    @Request() req,
    @Param('classroomId') classroomId: string,
    @Body() dto: ImportFromAssignmentDto,
  ) {
    return this.questionBanksService.importFromAssignment(
      req.user.id,
      classroomId,
      dto,
    );
  }

  @Get(':bankId')
  getBank(@Request() req, @Param('bankId') bankId: string) {
    return this.questionBanksService.getBank(req.user.id, bankId);
  }

  @Patch(':bankId')
  updateBank(
    @Request() req,
    @Param('bankId') bankId: string,
    @Body() dto: UpdateQuestionBankDto,
  ) {
    return this.questionBanksService.updateBank(req.user.id, bankId, dto);
  }

  @Delete(':bankId')
  deleteBank(@Request() req, @Param('bankId') bankId: string) {
    return this.questionBanksService.deleteBank(req.user.id, bankId);
  }

  @Post(':bankId/items')
  addItem(
    @Request() req,
    @Param('bankId') bankId: string,
    @Body() dto: CreateQuestionBankItemDto,
  ) {
    return this.questionBanksService.addItem(req.user.id, bankId, dto);
  }

  @Patch(':bankId/items/:itemId')
  updateItem(
    @Request() req,
    @Param('bankId') bankId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateQuestionBankItemDto,
  ) {
    return this.questionBanksService.updateItem(req.user.id, bankId, itemId, dto);
  }

  @Delete(':bankId/items/:itemId')
  deleteItem(
    @Request() req,
    @Param('bankId') bankId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.questionBanksService.deleteItem(req.user.id, bankId, itemId);
  }
}
