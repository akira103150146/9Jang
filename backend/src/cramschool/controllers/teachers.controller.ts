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
import { TeachersService } from '../services/teachers.service';
import {
  CreateTeacherDto,
  UpdateTeacherDto,
  Teacher,
  CreateTeacherSchema,
  UpdateTeacherSchema,
} from '@9jang/shared';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../account/guards/jwt-auth.guard';

@Controller('cramschool/teachers')
@UseGuards(JwtAuthGuard)
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get()
  async getTeachers(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true })) pageSize: number = 10,
  ) {
    return this.teachersService.getTeachers(page, pageSize);
  }

  @Get(':id')
  async getTeacher(@Param('id', ParseIntPipe) id: number): Promise<Teacher> {
    return this.teachersService.getTeacher(id);
  }

  @Post()
  async createTeacher(
    @Body(new ZodValidationPipe(CreateTeacherSchema)) createDto: CreateTeacherDto,
  ): Promise<Teacher> {
    return this.teachersService.createTeacher(createDto);
  }

  @Put(':id')
  async updateTeacher(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateTeacherSchema)) updateDto: UpdateTeacherDto,
  ): Promise<Teacher> {
    return this.teachersService.updateTeacher(id, updateDto);
  }

  @Delete(':id')
  async deleteTeacher(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.teachersService.deleteTeacher(id);
  }
}
