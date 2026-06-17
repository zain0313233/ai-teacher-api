import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ClassroomsService } from './classrooms.service';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { JoinClassroomDto } from './dto/join-classroom.dto';
import { ShareMaterialDto } from './dto/share-material.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { DuplicateAssignmentDto } from './dto/duplicate-assignment.dto';
import { SubmitQuizDto } from '../exam-genie/dto/submit-quiz.dto';

@Controller('classrooms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassroomsController {
  constructor(private readonly classroomsService: ClassroomsService) {}

  // ── Teacher ─────────────────────────────────────────────────────────────

  @Post()
  @Roles('TEACHER')
  createClassroom(@Request() req, @Body() dto: CreateClassroomDto) {
    return this.classroomsService.createClassroom(req.user.id, dto);
  }

  @Get('teacher')
  @Roles('TEACHER')
  listTeacherClassrooms(@Request() req) {
    return this.classroomsService.listTeacherClassrooms(req.user.id);
  }

  @Get('teacher/:id')
  @Roles('TEACHER')
  getTeacherClassroom(@Request() req, @Param('id') id: string) {
    return this.classroomsService.getTeacherClassroom(req.user.id, id);
  }

  @Get('teacher/:id/reports')
  @Roles('TEACHER')
  getClassroomReport(@Request() req, @Param('id') id: string) {
    return this.classroomsService.getClassroomReport(req.user.id, id);
  }

  @Post('teacher/:id/materials')
  @Roles('TEACHER')
  shareMaterial(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: ShareMaterialDto,
  ) {
    return this.classroomsService.shareMaterial(req.user.id, id, dto);
  }

  @Get('teacher/:id/reports/export')
  @Roles('TEACHER')
  async exportClassroomReport(
    @Request() req,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const csv = await this.classroomsService.exportClassroomReportCsv(req.user.id, id);
    const filename = `class-report-${id.slice(0, 8)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }

  @Post('teacher/:id/assignments')
  @Roles('TEACHER')
  createAssignment(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: CreateAssignmentDto,
  ) {
    return this.classroomsService.createAssignment(req.user.id, id, dto);
  }

  @Post('teacher/:classroomId/assignments/:assignmentId/duplicate')
  @Roles('TEACHER')
  duplicateAssignment(
    @Request() req,
    @Param('classroomId') classroomId: string,
    @Param('assignmentId') assignmentId: string,
    @Body() dto: DuplicateAssignmentDto,
  ) {
    return this.classroomsService.duplicateAssignment(
      req.user.id,
      classroomId,
      assignmentId,
      dto,
    );
  }

  // ── Student ─────────────────────────────────────────────────────────────

  @Post('join')
  @Roles('USER')
  joinClassroom(@Request() req, @Body() dto: JoinClassroomDto) {
    return this.classroomsService.joinClassroom(req.user.id, dto);
  }

  @Get('my')
  @Roles('USER')
  listStudentClassrooms(@Request() req) {
    return this.classroomsService.listStudentClassrooms(req.user.id);
  }

  @Get('my/assignments')
  @Roles('USER')
  listStudentAssignments(@Request() req) {
    return this.classroomsService.listStudentAssignments(req.user.id);
  }

  @Get('my/:id')
  @Roles('USER')
  getStudentClassroom(@Request() req, @Param('id') id: string) {
    return this.classroomsService.getStudentClassroom(req.user.id, id);
  }

  @Get('assignments/:assignmentId/quiz')
  @Roles('USER')
  getAssignmentQuiz(@Request() req, @Param('assignmentId') assignmentId: string) {
    return this.classroomsService.getAssignmentQuiz(req.user.id, assignmentId);
  }

  @Post('assignments/:assignmentId/submit')
  @Roles('USER')
  submitAssignment(
    @Request() req,
    @Param('assignmentId') assignmentId: string,
    @Body() dto: SubmitQuizDto,
  ) {
    return this.classroomsService.submitAssignment(
      req.user.id,
      assignmentId,
      dto,
    );
  }
}
