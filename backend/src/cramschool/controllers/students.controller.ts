import { AuthRequest } from '@/types/request.types';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
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
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { StudentsService } from '../services/students/students.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateStudentDto,
  UpdateStudentDto,
  StudentQuery,
  Student,
  StudentQuerySchema,
  CreateStudentSchema,
  UpdateStudentSchema,
} from '@9jang/shared';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../account/guards/jwt-auth.guard';
import type { 
  TuitionStatus, 
  AccountStatus, 
  TuitionGenerationResult,
  BatchTuitionResult,
  PasswordResetResult,
  AttendanceAndLeaves
} from '../types/student.types';

@ApiTags('students')
@Controller('cramschool/students')
@UseGuards(JwtAuthGuard)
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '取得學生列表', 
    description: '根據查詢條件分頁取得學生資料，支援篩選、排序、搜尋功能'
  })
  @ApiQuery({ name: 'page', required: false, description: '頁碼', example: 1, type: Number })
  @ApiQuery({ name: 'page_size', required: false, description: '每頁筆數', example: 10, type: Number })
  @ApiQuery({ name: 'search', required: false, description: '搜尋關鍵字（姓名、學校）', type: String })
  @ApiQuery({ name: 'grade', required: false, description: '年級篩選', type: String })
  @ApiQuery({ name: 'is_deleted', required: false, description: '是否包含已刪除', type: Boolean })
  @ApiResponse({ 
    status: 200, 
    description: '成功取得學生列表',
    schema: {
      example: {
        data: [
          {
            student_id: 1,
            name: '王小明',
            school: '台北市立中山國中',
            grade: '國三',
            phone: '0912345678',
            emergency_contact_name: '王爸爸',
            emergency_contact_phone: '0987654321'
          }
        ],
        total: 100,
        page: 1,
        page_size: 10
      }
    }
  })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '無權限查看學生資料' })
  async getStudents(
    @Query(new ZodValidationPipe(StudentQuerySchema)) query: StudentQuery,
    @Request() req: AuthRequest,
  ) {
    const user = req.user;
    // 從 JWT payload 獲取用戶角色（需要在 JWT payload 中包含 role）
    // 暫時從資料庫查詢
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    return this.studentsService.getStudents(query, user.id, userRecord?.role || 'STUDENT');
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '取得單一學生', 
    description: '根據學生 ID 取得詳細資料，包含註冊課程、出缺席記錄等'
  })
  @ApiParam({ name: 'id', description: '學生 ID', example: 1, type: Number })
  @ApiResponse({ 
    status: 200, 
    description: '成功取得學生資料',
    
  })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 404, description: '學生不存在' })
  async getStudent(@Param('id', ParseIntPipe) id: number): Promise<Student> {
    return this.studentsService.getStudent(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '建立學生', 
    description: '新增學生資料到系統，可同時建立關聯的使用者帳號'
  })
  @ApiResponse({ 
    status: 201, 
    description: '建立成功',
    
  })
  @ApiResponse({ status: 400, description: '資料驗證失敗或學生已存在' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '無權限建立學生' })
  async createStudent(
    @Body(new ZodValidationPipe(CreateStudentSchema)) createDto: CreateStudentDto,
    @Request() req: AuthRequest,
  ): Promise<Student> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    return this.studentsService.createStudent(createDto, user.id, userRecord?.role || 'STUDENT');
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '更新學生資料', 
    description: '修改指定學生的基本資料、聯絡資訊等'
  })
  @ApiParam({ name: 'id', description: '學生 ID', example: 1, type: Number })
  @ApiResponse({ 
    status: 200, 
    description: '更新成功',
    
  })
  @ApiResponse({ status: 400, description: '資料驗證失敗' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 404, description: '學生不存在' })
  async updateStudent(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateStudentSchema)) updateDto: UpdateStudentDto,
  ): Promise<Student> {
    return this.studentsService.updateStudent(id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '刪除學生', 
    description: '軟刪除學生資料（設為 is_deleted = true），不會實際刪除資料'
  })
  @ApiParam({ name: 'id', description: '學生 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '刪除成功' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 404, description: '學生不存在' })
  async deleteStudent(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.studentsService.deleteStudent(id);
  }

  @Post(':id/restore')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '恢復已刪除的學生', 
    description: '將已軟刪除的學生資料恢復（設為 is_deleted = false）'
  })
  @ApiParam({ name: 'id', description: '學生 ID', example: 1, type: Number })
  @ApiResponse({ 
    status: 200, 
    description: '恢復成功',
    
  })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 404, description: '學生不存在' })
  async restoreStudent(@Param('id', ParseIntPipe) id: number): Promise<Student> {
    return this.studentsService.restoreStudent(id);
  }

  @Get(':id/tuition_status')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '取得學生繳費狀態', 
    description: '查詢學生的學費繳納狀態、欠費記錄等'
  })
  @ApiParam({ name: 'id', description: '學生 ID', example: 1, type: Number })
  @ApiResponse({ 
    status: 200, 
    description: '成功取得繳費狀態'
  })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 404, description: '學生不存在' })
  async getTuitionStatus(@Param('id', ParseIntPipe) id: number): Promise<TuitionStatus> {
    return this.studentsService.getTuitionStatus(id);
  }

  @Post(':id/generate_tuition')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '生成學費帳單', 
    description: '為指定學生生成特定月份的學費帳單'
  })
  @ApiParam({ name: 'id', description: '學生 ID', example: 1, type: Number })
  @ApiBody({
    schema: {
      example: {
        year: 2026,
        month: 2,
        enrollment_id: 1,
        weeks: 4
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: '學費帳單生成成功'
  })
  @ApiResponse({ status: 400, description: '參數錯誤或帳單已存在' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 404, description: '學生或註冊記錄不存在' })
  async generateTuition(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { year: number; month: number; enrollment_id: number; weeks: number },
  ): Promise<TuitionGenerationResult> {
    return this.studentsService.generateTuition(id, data);
  }

  @Post('batch-generate-tuitions')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '批次生成學費帳單', 
    description: '為多個學生批次生成學費帳單，可指定週數'
  })
  @ApiBody({
    schema: {
      example: {
        student_ids: [1, 2, 3],
        weeks: 4
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: '批次生成成功，返回成功和失敗的統計'
  })
  @ApiResponse({ status: 400, description: '參數錯誤' })
  @ApiResponse({ status: 401, description: '未授權' })
  async batchGenerateTuitions(
    @Body() data: { student_ids?: number[]; weeks?: number },
  ): Promise<BatchTuitionResult> {
    const studentIds = data.student_ids || [];
    const weeks = data.weeks || 4;
    return this.studentsService.batchGenerateTuitions(studentIds, weeks);
  }

  @Post(':id/reset-password')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '重置學生密碼', 
    description: '重置學生帳號的登入密碼（需管理員權限）'
  })
  @ApiParam({ name: 'id', description: '學生 ID', example: 1, type: Number })
  @ApiBody({
    schema: {
      example: {
        password: 'newPassword123'
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: '密碼重置成功'
  })
  @ApiResponse({ status: 400, description: '密碼格式不符合規則' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '無權限重置密碼' })
  @ApiResponse({ status: 404, description: '學生不存在或無關聯帳號' })
  async resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { password: string },
  ): Promise<PasswordResetResult> {
    return this.studentsService.resetPassword(id, data.password);
  }

  @Post(':id/toggle-account-status')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '切換學生帳號狀態', 
    description: '啟用或停用學生的登入帳號（is_active 切換）'
  })
  @ApiParam({ name: 'id', description: '學生 ID', example: 1, type: Number })
  @ApiResponse({ 
    status: 200, 
    description: '帳號狀態切換成功'
  })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '無權限修改帳號狀態' })
  @ApiResponse({ status: 404, description: '學生不存在或無關聯帳號' })
  async toggleAccountStatus(@Param('id', ParseIntPipe) id: number): Promise<AccountStatus> {
    return this.studentsService.toggleAccountStatus(id);
  }

  @Get(':id/attendance_and_leaves')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '取得出缺席記錄', 
    description: '查詢學生的出席、缺席、請假記錄統計'
  })
  @ApiParam({ name: 'id', description: '學生 ID', example: 1, type: Number })
  @ApiResponse({ 
    status: 200, 
    description: '成功取得出缺席記錄'
  })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 404, description: '學生不存在' })
  async getAttendanceAndLeaves(@Param('id', ParseIntPipe) id: number): Promise<AttendanceAndLeaves> {
    return this.studentsService.getAttendanceAndLeaves(id);
  }
}
