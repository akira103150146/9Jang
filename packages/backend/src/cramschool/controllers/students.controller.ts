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
import { StudentsService } from '../services/students.service';
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
    @Request() req,
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
    @Request() req,
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
}
