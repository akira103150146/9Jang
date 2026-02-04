import { AuthRequest } from '@/types/request.types';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
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
import { SubjectsService } from '../services/subjects.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateSubjectDto,
  UpdateSubjectDto,
  Subject,
  CreateSubjectSchema,
  UpdateSubjectSchema,
} from '@9jang/shared';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../account/guards/jwt-auth.guard';

@ApiTags('courses')
@Controller('cramschool/subjects')
@UseGuards(JwtAuthGuard)
export class SubjectsController {
  constructor(
    private readonly subjectsService: SubjectsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得科目列表' })
  @ApiResponse({ status: 200, description: '成功' })
  async getSubjects(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true })) pageSize: number = 10,
    @Request() req: AuthRequest,
  ) {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    return this.subjectsService.getSubjects(page, pageSize, userRecord?.role || 'STUDENT');
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得單一科目' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 404, description: '不存在' })
  async getSubject(@Param('id', ParseIntPipe) id: number, @Request() req: AuthRequest): Promise<Subject> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    return this.subjectsService.getSubject(id, userRecord?.role || 'STUDENT');
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '建立科目' })
  @ApiResponse({ status: 201, description: '建立成功' })
  @ApiResponse({ status: 400, description: '驗證失敗' })
  async createSubject(
    @Body(new ZodValidationPipe(CreateSubjectSchema)) createDto: CreateSubjectDto,
    @Request() req: AuthRequest,
  ): Promise<Subject> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    return this.subjectsService.createSubject(createDto, userRecord?.role || 'STUDENT');
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '更新科目' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '不存在' })
  async updateSubject(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateSubjectSchema)) updateDto: UpdateSubjectDto,
    @Request() req: AuthRequest,
  ): Promise<Subject> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    return this.subjectsService.updateSubject(id, updateDto, userRecord?.role || 'STUDENT');
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '刪除科目' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '刪除成功' })
  @ApiResponse({ status: 404, description: '不存在' })
  async deleteSubject(@Param('id', ParseIntPipe) id: number, @Request() req: AuthRequest): Promise<void> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    return this.subjectsService.deleteSubject(id, userRecord?.role || 'STUDENT');
  }
}
