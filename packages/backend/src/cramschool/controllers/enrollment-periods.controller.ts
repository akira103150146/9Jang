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
import { EnrollmentPeriodsService } from '../services/enrollment-periods.service';
import {
  CreateEnrollmentPeriodDto,
  EnrollmentPeriod,
  CreateEnrollmentPeriodSchema,
} from '@9jang/shared';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../account/guards/jwt-auth.guard';

@Controller('cramschool/enrollment-periods')
@UseGuards(JwtAuthGuard)
export class EnrollmentPeriodsController {
  constructor(private readonly enrollmentPeriodsService: EnrollmentPeriodsService) {}

  @Get()
  async getPeriods(@Query('enrollment', new ParseIntPipe({ optional: true })) enrollmentId?: number) {
    return this.enrollmentPeriodsService.getPeriods(enrollmentId);
  }

  @Get(':id')
  async getPeriod(@Param('id', ParseIntPipe) id: number): Promise<EnrollmentPeriod> {
    return this.enrollmentPeriodsService.getPeriod(id);
  }

  @Post()
  async createPeriod(
    @Body(new ZodValidationPipe(CreateEnrollmentPeriodSchema)) createDto: CreateEnrollmentPeriodDto,
  ): Promise<EnrollmentPeriod> {
    return this.enrollmentPeriodsService.createPeriod(createDto);
  }

  @Put(':id')
  async updatePeriod(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(CreateEnrollmentPeriodSchema.partial())) updateDto: Partial<CreateEnrollmentPeriodDto>,
  ): Promise<EnrollmentPeriod> {
    return this.enrollmentPeriodsService.updatePeriod(id, updateDto);
  }

  @Delete(':id')
  async deletePeriod(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.enrollmentPeriodsService.deletePeriod(id);
  }
}
