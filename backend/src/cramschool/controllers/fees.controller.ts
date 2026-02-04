import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { FeesService } from '../services/fees.service';
import {
  CreateFeeDto,
  UpdateFeeDto,
  BatchUpdateFeeStatusDto,
  CreateFeeSchema,
  UpdateFeeSchema,
  BatchUpdateFeeStatusSchema,
} from '@9jang/shared';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../account/guards/jwt-auth.guard';

@Controller('cramschool/fees')
@UseGuards(JwtAuthGuard)
export class FeesController {
  constructor(private readonly feesService: FeesService) {}

  @Get()
  async getFees(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true })) pageSize: number = 10,
    @Query('student', new ParseIntPipe({ optional: true })) studentId?: number,
    @Query('include_deleted') includeDeleted?: string,
  ) {
    return this.feesService.getFees(
      page,
      pageSize,
      studentId,
      includeDeleted === 'true',
    );
  }

  @Get(':id')
  async getFee(@Param('id', ParseIntPipe) id: number) {
    return this.feesService.getFee(id);
  }

  @Post()
  async createFee(
    @Body(new ZodValidationPipe(CreateFeeSchema)) createDto: CreateFeeDto,
  ) {
    return this.feesService.createFee(createDto);
  }

  @Put(':id')
  async updateFee(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateFeeSchema)) updateDto: UpdateFeeDto,
  ) {
    return this.feesService.updateFee(id, updateDto);
  }

  @Delete(':id')
  async deleteFee(@Param('id', ParseIntPipe) id: number) {
    await this.feesService.deleteFee(id);
    return { message: '費用記錄已刪除' };
  }

  @Post('batch-update')
  async batchUpdateStatus(
    @Body(new ZodValidationPipe(BatchUpdateFeeStatusSchema))
    batchUpdateDto: BatchUpdateFeeStatusDto,
  ) {
    return this.feesService.batchUpdateStatus(batchUpdateDto);
  }
}
