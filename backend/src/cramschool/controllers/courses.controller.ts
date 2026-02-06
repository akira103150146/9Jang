import { AuthRequest } from '@/types/request.types';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
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
import { CoursesService } from '../services/courses.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateCourseDto,
  UpdateCourseDto,
  Course,
  CreateCourseSchema,
  UpdateCourseSchema,
} from '@9jang/shared';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../account/guards/jwt-auth.guard';

@ApiTags('courses')
@Controller('cramschool/courses')
@UseGuards(JwtAuthGuard)
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '取得課程列表', 
    description: '分頁取得所有課程資料，包含課程名稱、教師、時間等資訊'
  })
  @ApiQuery({ name: 'page', required: false, description: '頁碼', example: 1, type: Number })
  @ApiQuery({ name: 'page_size', required: false, description: '每頁筆數', example: 10, type: Number })
  @ApiResponse({ 
    status: 200, 
    description: '成功取得課程列表',
    schema: {
      example: {
        data: [
          {
            course_id: 1,
            name: '國三數學A班',
            subject: '數學',
            teacher_name: '李老師',
            schedule: '週一 18:00-20:00'
          }
        ],
        total: 30,
        page: 1,
        page_size: 10
      }
    }
  })
  @ApiResponse({ status: 401, description: '未授權' })
  async getCourses(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true })) pageSize: number = 10,
    @Request() req: AuthRequest,
  ) {
    return this.coursesService.getCourses(page, pageSize, req.user?.id, req.user?.role);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '取得單一課程', 
    description: '根據課程 ID 取得詳細資料，包含學生名單、課堂記錄等'
  })
  @ApiParam({ name: 'id', description: '課程 ID', example: 1, type: Number })
  @ApiResponse({ 
    status: 200, 
    description: '成功取得課程資料',
    
  })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 404, description: '課程不存在' })
  async getCourse(@Param('id', ParseIntPipe) id: number): Promise<Course> {
    return this.coursesService.getCourse(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '建立課程', 
    description: '新增課程到系統，設定課程名稱、教師、上課時間等'
  })
  @ApiResponse({ 
    status: 201, 
    description: '建立成功',
    
  })
  @ApiResponse({ status: 400, description: '資料驗證失敗' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '無權限建立課程' })
  async createCourse(
    @Body(new ZodValidationPipe(CreateCourseSchema)) createDto: CreateCourseDto,
  ): Promise<Course> {
    return this.coursesService.createCourse(createDto);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '更新課程資料', 
    description: '修改課程的名稱、教師、時間等資訊'
  })
  @ApiParam({ name: 'id', description: '課程 ID', example: 1, type: Number })
  @ApiResponse({ 
    status: 200, 
    description: '更新成功',
    
  })
  @ApiResponse({ status: 400, description: '資料驗證失敗' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 404, description: '課程不存在' })
  async updateCourse(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateCourseSchema)) updateDto: UpdateCourseDto,
  ): Promise<Course> {
    return this.coursesService.updateCourse(id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '刪除課程', 
    description: '軟刪除課程（設為 is_deleted = true）'
  })
  @ApiParam({ name: 'id', description: '課程 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '刪除成功' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '無權限刪除課程' })
  @ApiResponse({ status: 404, description: '課程不存在' })
  async deleteCourse(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.coursesService.deleteCourse(id);
  }

  @Get(':id/student-status')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '取得課程學生狀態', 
    description: '查詢課程中所有學生的註冊狀態、出席率等統計資訊'
  })
  @ApiParam({ name: 'id', description: '課程 ID', example: 1, type: Number })
  @ApiResponse({ 
    status: 200, 
    description: '成功取得學生狀態'
  })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 404, description: '課程不存在' })
  async getStudentStatus(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.coursesService.getStudentStatus(id);
  }

  @Get(':id/resources')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '取得課程資源', 
    description: '查詢課程相關的教材、講義等資源列表'
  })
  @ApiParam({ name: 'id', description: '課程 ID', example: 1, type: Number })
  @ApiResponse({ 
    status: 200, 
    description: '成功取得課程資源列表'
  })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 404, description: '課程不存在' })
  async getResources(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthRequest,
  ): Promise<any> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    return this.coursesService.getResources(id, user.id, userRecord?.role || 'STUDENT');
  }
}
