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
import { TeachersService } from '../services/teachers.service';
import {
  CreateTeacherDto,
  UpdateTeacherDto,
  Teacher,
  CreateTeacherSchema,
  UpdateTeacherSchema,
} from '@9jang/shared';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../account/guards/jwt-auth.guard';

@ApiTags('teachers')
@Controller('cramschool/teachers')
@UseGuards(JwtAuthGuard)
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '取得教師列表', 
    description: '分頁取得所有教師資料，包含基本資訊和授課科目'
  })
  @ApiQuery({ name: 'page', required: false, description: '頁碼', example: 1, type: Number })
  @ApiQuery({ name: 'page_size', required: false, description: '每頁筆數', example: 10, type: Number })
  @ApiResponse({ 
    status: 200, 
    description: '成功取得教師列表',
    schema: {
      example: {
        data: [
          {
            teacher_id: 1,
            name: '李老師',
            subject: '數學',
            phone: '0912345678',
            email: 'teacher@example.com'
          }
        ],
        total: 20,
        page: 1,
        page_size: 10
      }
    }
  })
  @ApiResponse({ status: 401, description: '未授權' })
  async getTeachers(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true })) pageSize: number = 10,
  ) {
    return this.teachersService.getTeachers(page, pageSize);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '取得單一教師', 
    description: '根據教師 ID 取得詳細資料，包含授課課程列表'
  })
  @ApiParam({ name: 'id', description: '教師 ID', example: 1, type: Number })
  @ApiResponse({ 
    status: 200, 
    description: '成功取得教師資料',
    
  })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 404, description: '教師不存在' })
  async getTeacher(@Param('id', ParseIntPipe) id: number): Promise<Teacher> {
    return this.teachersService.getTeacher(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '建立教師', 
    description: '新增教師資料到系統，可同時建立關聯的使用者帳號'
  })
  @ApiResponse({ 
    status: 201, 
    description: '建立成功',
    
  })
  @ApiResponse({ status: 400, description: '資料驗證失敗或教師已存在' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '無權限建立教師' })
  async createTeacher(
    @Body(new ZodValidationPipe(CreateTeacherSchema)) createDto: CreateTeacherDto,
  ): Promise<Teacher> {
    return this.teachersService.createTeacher(createDto);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '更新教師資料', 
    description: '修改教師的基本資料、授課科目、聯絡資訊等'
  })
  @ApiParam({ name: 'id', description: '教師 ID', example: 1, type: Number })
  @ApiResponse({ 
    status: 200, 
    description: '更新成功',
    
  })
  @ApiResponse({ status: 400, description: '資料驗證失敗' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 404, description: '教師不存在' })
  async updateTeacher(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateTeacherSchema)) updateDto: UpdateTeacherDto,
  ): Promise<Teacher> {
    return this.teachersService.updateTeacher(id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '刪除教師', 
    description: '軟刪除教師資料（設為 is_deleted = true）'
  })
  @ApiParam({ name: 'id', description: '教師 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '刪除成功' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '無權限刪除教師' })
  @ApiResponse({ status: 404, description: '教師不存在' })
  async deleteTeacher(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.teachersService.deleteTeacher(id);
  }
}
