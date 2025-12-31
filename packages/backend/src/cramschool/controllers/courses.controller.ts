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
import { CoursesService } from '../services/courses.service';
import {
  CreateCourseDto,
  UpdateCourseDto,
  Course,
  CreateCourseSchema,
  UpdateCourseSchema,
} from '@9jang/shared';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../account/guards/jwt-auth.guard';

@Controller('cramschool/courses')
@UseGuards(JwtAuthGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async getCourses(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true })) pageSize: number = 10,
  ) {
    return this.coursesService.getCourses(page, pageSize);
  }

  @Get(':id')
  async getCourse(@Param('id', ParseIntPipe) id: number): Promise<Course> {
    return this.coursesService.getCourse(id);
  }

  @Post()
  async createCourse(
    @Body(new ZodValidationPipe(CreateCourseSchema)) createDto: CreateCourseDto,
  ): Promise<Course> {
    return this.coursesService.createCourse(createDto);
  }

  @Put(':id')
  async updateCourse(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateCourseSchema)) updateDto: UpdateCourseDto,
  ): Promise<Course> {
    return this.coursesService.updateCourse(id, updateDto);
  }

  @Delete(':id')
  async deleteCourse(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.coursesService.deleteCourse(id);
  }
}
