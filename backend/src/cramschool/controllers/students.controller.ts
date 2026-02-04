import { AuthRequest } from '@/types/request.types';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { StudentsService } from '../services/students/students.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateStudentDto,
  UpdateStudentDto,
  StudentQuery,
  Student,
  StudentQuerySchema,
  CreateStudentSchema,
  UpdateStudentSchema,
} from '@9jang/shared';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../account/guards/jwt-auth.guard';
import type { 
  TuitionStatus, 
  AccountStatus, 
  TuitionGenerationResult,
  BatchTuitionResult,
  PasswordResetResult,
  AttendanceAndLeaves
} from '../types/student.types';

@Controller('cramschool/students')
@UseGuards(JwtAuthGuard)
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async getStudents(
    @Query(new ZodValidationPipe(StudentQuerySchema)) query: StudentQuery,
    @Request() req: AuthRequest,
  ) {
    const user = req.user;
    // 從 JWT payload 獲取用戶角色（需要在 JWT payload 中包含 role）
    // 暫時從資料庫查詢
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    return this.studentsService.getStudents(query, user.id, userRecord?.role || 'STUDENT');
  }

  @Get(':id')
  async getStudent(@Param('id', ParseIntPipe) id: number): Promise<Student> {
    return this.studentsService.getStudent(id);
  }

  @Post()
  async createStudent(
    @Body(new ZodValidationPipe(CreateStudentSchema)) createDto: CreateStudentDto,
    @Request() req: AuthRequest,
  ): Promise<Student> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    return this.studentsService.createStudent(createDto, user.id, userRecord?.role || 'STUDENT');
  }

  @Put(':id')
  async updateStudent(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateStudentSchema)) updateDto: UpdateStudentDto,
  ): Promise<Student> {
    return this.studentsService.updateStudent(id, updateDto);
  }

  @Delete(':id')
  async deleteStudent(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.studentsService.deleteStudent(id);
  }

  @Post(':id/restore')
  async restoreStudent(@Param('id', ParseIntPipe) id: number): Promise<Student> {
    return this.studentsService.restoreStudent(id);
  }

  @Get(':id/tuition_status')
  async getTuitionStatus(@Param('id', ParseIntPipe) id: number): Promise<TuitionStatus> {
    return this.studentsService.getTuitionStatus(id);
  }

  @Post(':id/generate_tuition')
  async generateTuition(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { year: number; month: number; enrollment_id: number; weeks: number },
  ): Promise<TuitionGenerationResult> {
    return this.studentsService.generateTuition(id, data);
  }

  @Post('batch-generate-tuitions')
  async batchGenerateTuitions(
    @Body() data: { student_ids?: number[]; weeks?: number },
  ): Promise<BatchTuitionResult> {
    const studentIds = data.student_ids || [];
    const weeks = data.weeks || 4;
    return this.studentsService.batchGenerateTuitions(studentIds, weeks);
  }

  @Post(':id/reset-password')
  async resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { password: string },
  ): Promise<PasswordResetResult> {
    return this.studentsService.resetPassword(id, data.password);
  }

  @Post(':id/toggle-account-status')
  async toggleAccountStatus(@Param('id', ParseIntPipe) id: number): Promise<AccountStatus> {
    return this.studentsService.toggleAccountStatus(id);
  }

  @Get(':id/attendance_and_leaves')
  async getAttendanceAndLeaves(@Param('id', ParseIntPipe) id: number): Promise<AttendanceAndLeaves> {
    return this.studentsService.getAttendanceAndLeaves(id);
  }
}
