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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { EnrollmentPeriodsService } from '../services/enrollment-periods.service';
import {
  CreateEnrollmentPeriodDto,
  EnrollmentPeriod,
  CreateEnrollmentPeriodSchema,
} from '@9jang/shared';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../account/guards/jwt-auth.guard';

@ApiTags('courses')
@Controller('cramschool/enrollment-periods')
@UseGuards(JwtAuthGuard)
export class EnrollmentPeriodsController {
  constructor(private readonly enrollmentPeriodsService: EnrollmentPeriodsService) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得註冊期間列表', description: '查詢註冊期間資料' })
  @ApiQuery({ name: 'enrollment', required: false, description: '註冊 ID 篩選', type: Number })
  @ApiResponse({ status: 200, description: '成功' })
  async getPeriods(@Query('enrollment', new ParseIntPipe({ optional: true })) enrollmentId?: number) {
    return this.enrollmentPeriodsService.getPeriods(enrollmentId);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得單一註冊期間', description: '查詢註冊期間詳細資料' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '成功',  })
  @ApiResponse({ status: 404, description: '註冊期間不存在' })
  async getPeriod(@Param('id', ParseIntPipe) id: number): Promise<EnrollmentPeriod> {
    return this.enrollmentPeriodsService.getPeriod(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '建立註冊期間', description: '新增註冊期間記錄' })
  @ApiResponse({ status: 201, description: '建立成功',  })
  @ApiResponse({ status: 400, description: '驗證失敗' })
  async createPeriod(
    @Body(new ZodValidationPipe(CreateEnrollmentPeriodSchema)) createDto: CreateEnrollmentPeriodDto,
  ): Promise<EnrollmentPeriod> {
    return this.enrollmentPeriodsService.createPeriod(createDto);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '更新註冊期間', description: '修改註冊期間資料' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '更新成功',  })
  @ApiResponse({ status: 404, description: '註冊期間不存在' })
  async updatePeriod(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(CreateEnrollmentPeriodSchema.partial())) updateDto: Partial<CreateEnrollmentPeriodDto>,
  ): Promise<EnrollmentPeriod> {
    return this.enrollmentPeriodsService.updatePeriod(id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '刪除註冊期間', description: '刪除註冊期間記錄' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '刪除成功' })
  @ApiResponse({ status: 404, description: '註冊期間不存在' })
  async deletePeriod(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.enrollmentPeriodsService.deletePeriod(id);
  }
}
