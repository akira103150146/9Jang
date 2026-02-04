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
import { EnrollmentsService } from '../services/enrollments.service';
import {
  CreateStudentEnrollmentDto,
  StudentEnrollment,
  CreateStudentEnrollmentSchema,
} from '@9jang/shared';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../account/guards/jwt-auth.guard';

@ApiTags('courses')
@Controller('cramschool/enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得註冊記錄列表', description: '分頁取得學生課程註冊記錄' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'page_size', required: false, type: Number })
  @ApiResponse({ status: 200, description: '成功' })
  async getEnrollments(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true })) pageSize: number = 10,
  ) {
    return this.enrollmentsService.getEnrollments(page, pageSize);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得單一註冊記錄', description: '查詢註冊詳細資料' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 404, description: '註冊記錄不存在' })
  async getEnrollment(@Param('id', ParseIntPipe) id: number): Promise<StudentEnrollment> {
    return this.enrollmentsService.getEnrollment(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '建立註冊記錄', description: '註冊學生到課程' })
  @ApiResponse({ status: 201, description: '註冊成功' })
  @ApiResponse({ status: 400, description: '驗證失敗' })
  async createEnrollment(
    @Body(new ZodValidationPipe(CreateStudentEnrollmentSchema))
    createDto: CreateStudentEnrollmentDto,
  ): Promise<StudentEnrollment> {
    return this.enrollmentsService.createEnrollment(createDto);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '更新註冊記錄', description: '修改註冊資料' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '註冊記錄不存在' })
  async updateEnrollment(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(CreateStudentEnrollmentSchema.partial()))
    updateDto: Partial<CreateStudentEnrollmentDto>,
  ): Promise<StudentEnrollment> {
    return this.enrollmentsService.updateEnrollment(id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '刪除註冊記錄', description: '取消學生註冊' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '刪除成功' })
  @ApiResponse({ status: 404, description: '註冊記錄不存在' })
  async deleteEnrollment(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.enrollmentsService.deleteEnrollment(id);
  }
}
