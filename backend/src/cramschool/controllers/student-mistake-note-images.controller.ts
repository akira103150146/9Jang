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
import { StudentMistakeNoteImagesService } from '../services/student-mistake-note-images.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateStudentMistakeNoteImageDto,
  UpdateStudentMistakeNoteImageDto,
  StudentMistakeNoteImage,
  CreateStudentMistakeNoteImageSchema,
  UpdateStudentMistakeNoteImageSchema,
} from '@9jang/shared';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../account/guards/jwt-auth.guard';

@ApiTags('mistake-notes')
@Controller('cramschool/student-mistake-note-images')
@UseGuards(JwtAuthGuard)
export class StudentMistakeNoteImagesController {
  constructor(
    private readonly studentMistakeNoteImagesService: StudentMistakeNoteImagesService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得訂正本圖片列表', description: '分頁取得訂正本圖片' })
  @ApiQuery({ name: 'note', required: false, description: '訂正本 ID 篩選', type: Number })
  @ApiQuery({ name: 'page', required: false, description: '頁碼', example: 1, type: Number })
  @ApiQuery({ name: 'page_size', required: false, description: '每頁筆數', example: 10, type: Number })
  @ApiResponse({ status: 200, description: '成功' })
  async getStudentMistakeNoteImages(
    @Request() req: AuthRequest,
    @Query('note', new ParseIntPipe({ optional: true })) noteId?: number,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true })) pageSize: number = 10,
  ) {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    const userRole = userRecord?.role || '';
    return this.studentMistakeNoteImagesService.getStudentMistakeNoteImages(user.id, userRole, noteId, page, pageSize);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得單一訂正本圖片', description: '根據圖片 ID 取得詳細資料' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 404, description: '圖片不存在' })
  async getStudentMistakeNoteImage(
    @Request() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StudentMistakeNoteImage> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    const userRole = userRecord?.role || '';
    return this.studentMistakeNoteImagesService.getStudentMistakeNoteImage(id, user.id, userRole);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '建立訂正本圖片記錄', description: '新增訂正本圖片記錄' })
  @ApiResponse({ status: 201, description: '建立成功' })
  @ApiResponse({ status: 400, description: '驗證失敗' })
  async createStudentMistakeNoteImage(
    @Request() req: AuthRequest,
    @Body(new ZodValidationPipe(CreateStudentMistakeNoteImageSchema)) createDto: CreateStudentMistakeNoteImageDto,
  ): Promise<StudentMistakeNoteImage> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    const userRole = userRecord?.role || '';
    return this.studentMistakeNoteImagesService.createStudentMistakeNoteImage(createDto, user.id, userRole);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '更新訂正本圖片', description: '修改圖片排序或資訊' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '圖片不存在' })
  async updateStudentMistakeNoteImage(
    @Request() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateStudentMistakeNoteImageSchema)) updateDto: UpdateStudentMistakeNoteImageDto,
  ): Promise<StudentMistakeNoteImage> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    const userRole = userRecord?.role || '';
    return this.studentMistakeNoteImagesService.updateStudentMistakeNoteImage(id, updateDto, user.id, userRole);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '刪除訂正本圖片', description: '刪除訂正本圖片記錄' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '刪除成功' })
  @ApiResponse({ status: 404, description: '圖片不存在' })
  async deleteStudentMistakeNoteImage(
    @Request() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    const userRole = userRecord?.role || '';
    return this.studentMistakeNoteImagesService.deleteStudentMistakeNoteImage(id, user.id, userRole);
  }
}
