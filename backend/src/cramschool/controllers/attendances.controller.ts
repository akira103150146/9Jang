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
import { AttendancesService } from '../services/attendances.service';
import {
  CreateAttendanceDto,
  UpdateAttendanceDto,
  Attendance,
  CreateAttendanceSchema,
  UpdateAttendanceSchema,
} from '@9jang/shared';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../account/guards/jwt-auth.guard';

@Controller('cramschool/attendances')
@UseGuards(JwtAuthGuard)
export class AttendancesController {
  constructor(private readonly attendancesService: AttendancesService) {}

  @Get()
  async getAttendances(
    @Query('include_deleted') includeDeleted: string = 'false',
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true })) pageSize: number = 10,
  ) {
    return this.attendancesService.getAttendances(includeDeleted === 'true', page, pageSize);
  }

  @Get(':id')
  async getAttendance(@Param('id', ParseIntPipe) id: number): Promise<Attendance> {
    return this.attendancesService.getAttendance(id);
  }

  @Post()
  async createAttendance(
    @Body(new ZodValidationPipe(CreateAttendanceSchema)) createDto: CreateAttendanceDto,
  ): Promise<Attendance> {
    return this.attendancesService.createAttendance(createDto);
  }

  @Put(':id')
  async updateAttendance(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateAttendanceSchema)) updateDto: UpdateAttendanceDto,
  ): Promise<Attendance> {
    return this.attendancesService.updateAttendance(id, updateDto);
  }

  @Delete(':id')
  async deleteAttendance(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.attendancesService.deleteAttendance(id);
  }

  @Post(':id/restore')
  async restoreAttendance(@Param('id', ParseIntPipe) id: number): Promise<Attendance> {
    return this.attendancesService.restoreAttendance(id);
  }
}
