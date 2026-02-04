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
  ParseIntPipe,
} from '@nestjs/common';
import { StudentAnswersService } from '../services/student-answers.service';
import {
  CreateStudentAnswerDto,
  UpdateStudentAnswerDto,
  StudentAnswer,
  CreateStudentAnswerSchema,
  UpdateStudentAnswerSchema,
} from '@9jang/shared';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../account/guards/jwt-auth.guard';

@Controller('cramschool/student-answers')
@UseGuards(JwtAuthGuard)
export class StudentAnswersController {
  constructor(private readonly studentAnswersService: StudentAnswersService) {}

  @Get()
  async getStudentAnswers(
    @Query('include_deleted') includeDeleted: string = 'false',
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true })) pageSize: number = 10,
  ) {
    return this.studentAnswersService.getStudentAnswers(includeDeleted === 'true', page, pageSize);
  }

  @Get(':id')
  async getStudentAnswer(@Param('id', ParseIntPipe) id: number): Promise<StudentAnswer> {
    return this.studentAnswersService.getStudentAnswer(id);
  }

  @Post()
  async createStudentAnswer(
    @Body(new ZodValidationPipe(CreateStudentAnswerSchema)) createDto: CreateStudentAnswerDto,
  ): Promise<StudentAnswer> {
    return this.studentAnswersService.createStudentAnswer(createDto);
  }

  @Put(':id')
  async updateStudentAnswer(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateStudentAnswerSchema)) updateDto: UpdateStudentAnswerDto,
  ): Promise<StudentAnswer> {
    return this.studentAnswersService.updateStudentAnswer(id, updateDto);
  }

  @Delete(':id')
  async deleteStudentAnswer(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.studentAnswersService.deleteStudentAnswer(id);
  }

  @Post(':id/restore')
  async restoreStudentAnswer(@Param('id', ParseIntPipe) id: number): Promise<StudentAnswer> {
    return this.studentAnswersService.restoreStudentAnswer(id);
  }
}
