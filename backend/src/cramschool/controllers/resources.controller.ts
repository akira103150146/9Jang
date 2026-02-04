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
import { ResourcesService } from '../services/resources.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateLearningResourceDto,
  UpdateLearningResourceDto,
  LearningResource,
  CreateLearningResourceSchema,
  UpdateLearningResourceSchema,
} from '@9jang/shared';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../account/guards/jwt-auth.guard';

@ApiTags('resources')
@Controller('cramschool/resources')
@UseGuards(JwtAuthGuard)
export class ResourcesController {
  constructor(
    private readonly resourcesService: ResourcesService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '取得資源列表', 
    description: '分頁取得教材、講義等學習資源，可按課程篩選、支援不同檢視模式'
  })
  @ApiQuery({ name: 'page', required: false, description: '頁碼', example: 1, type: Number })
  @ApiQuery({ name: 'page_size', required: false, description: '每頁筆數', example: 10, type: Number })
  @ApiQuery({ name: 'course', required: false, description: '課程 ID 篩選', type: Number })
  @ApiQuery({ name: 'mode', required: false, description: '檢視模式', type: String })
  @ApiResponse({ 
    status: 200, 
    description: '成功取得資源列表'
  })
  @ApiResponse({ status: 401, description: '未授權' })
  async getResources(
    @Request() req: AuthRequest,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true })) pageSize: number = 10,
    @Query('course', new ParseIntPipe({ optional: true })) courseId?: number,
    @Query('mode') mode?: string,
  ) {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    return this.resourcesService.getResources(
      user.id,
      userRecord?.role || 'STUDENT',
      page,
      pageSize,
      courseId,
      mode,
    );
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '取得單一資源', 
    description: '根據資源 ID 取得詳細資料，包含檔案路徑、關聯課程等'
  })
  @ApiParam({ name: 'id', description: '資源 ID', example: 1, type: Number })
  @ApiResponse({ 
    status: 200, 
    description: '成功取得資源資料',
    
  })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 404, description: '資源不存在' })
  async getResource(@Param('id', ParseIntPipe) id: number): Promise<LearningResource> {
    return this.resourcesService.getResource(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '建立學習資源', 
    description: '新增教材、講義等學習資源到系統'
  })
  @ApiResponse({ 
    status: 201, 
    description: '建立成功',
    
  })
  @ApiResponse({ status: 400, description: '資料驗證失敗' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '無權限建立資源' })
  async createResource(
    @Body(new ZodValidationPipe(CreateLearningResourceSchema))
    createDto: CreateLearningResourceDto,
    @Request() req: AuthRequest,
  ): Promise<LearningResource> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    return this.resourcesService.createResource(createDto, user.id, userRecord?.role || 'STUDENT');
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '更新學習資源', 
    description: '修改資源的名稱、描述、檔案等資訊'
  })
  @ApiParam({ name: 'id', description: '資源 ID', example: 1, type: Number })
  @ApiResponse({ 
    status: 200, 
    description: '更新成功',
    
  })
  @ApiResponse({ status: 400, description: '資料驗證失敗' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 404, description: '資源不存在' })
  async updateResource(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateLearningResourceSchema))
    updateDto: UpdateLearningResourceDto,
    @Request() req: AuthRequest,
  ): Promise<LearningResource> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    return this.resourcesService.updateResource(id, updateDto, user.id, userRecord?.role || 'STUDENT');
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '刪除學習資源', 
    description: '軟刪除學習資源（設為 is_deleted = true）'
  })
  @ApiParam({ name: 'id', description: '資源 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '刪除成功' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '無權限刪除資源' })
  @ApiResponse({ status: 404, description: '資源不存在' })
  async deleteResource(@Param('id', ParseIntPipe) id: number, @Request() req: AuthRequest): Promise<void> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    return this.resourcesService.deleteResource(id, userRecord?.role || 'STUDENT');
  }

  @Post(':id/bind-to-course')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '綁定/解除資源與課程', 
    description: '將學習資源關聯到課程或解除關聯（action: add/remove）'
  })
  @ApiParam({ name: 'id', description: '資源 ID', example: 1, type: Number })
  @ApiBody({
    schema: {
      example: {
        course_id: 1,
        action: 'add'
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: '操作成功'
  })
  @ApiResponse({ status: 400, description: '參數錯誤' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 404, description: '資源或課程不存在' })
  async bindToCourse(
    @Request() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { course_id: number; action: 'add' | 'remove' },
  ): Promise<{ message: string }> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    const userRole = userRecord?.role || '';

    if (!body.course_id) {
      throw new Error('需要提供 course_id');
    }

    return this.resourcesService.bindToCourse(id, body.course_id, body.action || 'add', user.id, userRole);
  }

  @Post(':id/export')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '匯出資源', 
    description: '將學習資源匯出為指定格式（question_only, with_answers 等）'
  })
  @ApiParam({ name: 'id', description: '資源 ID', example: 1, type: Number })
  @ApiBody({
    schema: {
      example: {
        format_type: 'question_only'
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: '匯出成功'
  })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 404, description: '資源不存在' })
  async exportResource(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { format_type?: string },
  ): Promise<any> {
    return this.resourcesService.exportResource(id, body.format_type || 'question_only');
  }

  @Post(':id/grade')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '批改資源作業', 
    description: '自動批改學生提交的作業答案'
  })
  @ApiParam({ name: 'id', description: '資源 ID', example: 1, type: Number })
  @ApiBody({
    schema: {
      example: {
        submission: {
          answers: ['A', 'B', 'C']
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: '批改完成，返回分數和詳細結果'
  })
  @ApiResponse({ status: 400, description: '提交資料格式錯誤' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 404, description: '資源不存在' })
  async gradeResource(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { submission: any },
  ): Promise<any> {
    return this.resourcesService.gradeResource(id, body.submission || {});
  }
}
