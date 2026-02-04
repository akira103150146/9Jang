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

@ApiTags('questions')
@Controller('cramschool/student-answers')
@UseGuards(JwtAuthGuard)
export class StudentAnswersController {
  constructor(private readonly studentAnswersService: StudentAnswersService) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得學生答題記錄列表', description: '分頁取得學生的答題記錄' })
  @ApiQuery({ name: 'include_deleted', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'page_size', required: false, type: Number })
  @ApiResponse({ status: 200, description: '成功' })
  async getStudentAnswers(
    @Query('include_deleted') includeDeleted: string = 'false',
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true })) pageSize: number = 10,
  ) {
    return this.studentAnswersService.getStudentAnswers(includeDeleted === 'true', page, pageSize);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得單一答題記錄', description: '查詢答題記錄詳細資料' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 404, description: '記錄不存在' })
  async getStudentAnswer(@Param('id', ParseIntPipe) id: number): Promise<StudentAnswer> {
    return this.studentAnswersService.getStudentAnswer(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '建立答題記錄', description: '記錄學生的答題結果' })
  @ApiResponse({ status: 201, description: '建立成功' })
  @ApiResponse({ status: 400, description: '驗證失敗' })
  async createStudentAnswer(
    @Body(new ZodValidationPipe(CreateStudentAnswerSchema)) createDto: CreateStudentAnswerDto,
  ): Promise<StudentAnswer> {
    return this.studentAnswersService.createStudentAnswer(createDto);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '更新答題記錄', description: '修改答題記錄' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '記錄不存在' })
  async updateStudentAnswer(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateStudentAnswerSchema)) updateDto: UpdateStudentAnswerDto,
  ): Promise<StudentAnswer> {
    return this.studentAnswersService.updateStudentAnswer(id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '刪除答題記錄', description: '軟刪除答題記錄' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '刪除成功' })
  @ApiResponse({ status: 404, description: '記錄不存在' })
  async deleteStudentAnswer(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.studentAnswersService.deleteStudentAnswer(id);
  }

  @Post(':id/restore')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '恢復答題記錄', description: '恢復已刪除的答題記錄' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '恢復成功' })
  @ApiResponse({ status: 404, description: '記錄不存在' })
  async restoreStudentAnswer(@Param('id', ParseIntPipe) id: number): Promise<StudentAnswer> {
    return this.studentAnswersService.restoreStudentAnswer(id);
  }
}
