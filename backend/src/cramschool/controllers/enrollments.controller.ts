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
import { EnrollmentsService } from '../services/enrollments.service';
import {
  CreateStudentEnrollmentDto,
  StudentEnrollment,
  CreateStudentEnrollmentSchema,
} from '@9jang/shared';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../account/guards/jwt-auth.guard';

@Controller('cramschool/enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get()
  async getEnrollments(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true })) pageSize: number = 10,
  ) {
    return this.enrollmentsService.getEnrollments(page, pageSize);
  }

  @Get(':id')
  async getEnrollment(@Param('id', ParseIntPipe) id: number): Promise<StudentEnrollment> {
    return this.enrollmentsService.getEnrollment(id);
  }

  @Post()
  async createEnrollment(
    @Body(new ZodValidationPipe(CreateStudentEnrollmentSchema))
    createDto: CreateStudentEnrollmentDto,
  ): Promise<StudentEnrollment> {
    return this.enrollmentsService.createEnrollment(createDto);
  }

  @Put(':id')
  async updateEnrollment(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(CreateStudentEnrollmentSchema.partial()))
    updateDto: Partial<CreateStudentEnrollmentDto>,
  ): Promise<StudentEnrollment> {
    return this.enrollmentsService.updateEnrollment(id, updateDto);
  }

  @Delete(':id')
  async deleteEnrollment(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.enrollmentsService.deleteEnrollment(id);
  }
}
