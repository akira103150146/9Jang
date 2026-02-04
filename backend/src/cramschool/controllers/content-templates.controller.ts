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
import { ContentTemplatesService } from '../services/content-templates.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateContentTemplateDto,
  UpdateContentTemplateDto,
  ContentTemplate,
  CreateContentTemplateSchema,
  UpdateContentTemplateSchema,
} from '@9jang/shared';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../account/guards/jwt-auth.guard';

@ApiTags('resources')
@Controller('cramschool/content-templates')
@UseGuards(JwtAuthGuard)
export class ContentTemplatesController {
  constructor(
    private readonly contentTemplatesService: ContentTemplatesService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得內容模板列表', description: '分頁取得內容模板，可查看公開和自己建立的模板' })
  @ApiQuery({ name: 'page', required: false, description: '頁碼', example: 1, type: Number })
  @ApiQuery({ name: 'page_size', required: false, description: '每頁筆數', example: 10, type: Number })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 401, description: '未授權' })
  async getContentTemplates(
    @Request() req: AuthRequest,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true })) pageSize: number = 10,
  ) {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    const userRole = userRecord?.role || '';
    return this.contentTemplatesService.getContentTemplates(user.id, userRole, page, pageSize);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得單一內容模板', description: '根據模板 ID 取得詳細資料' })
  @ApiParam({ name: 'id', description: '模板 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '成功',  })
  @ApiResponse({ status: 404, description: '模板不存在' })
  async getContentTemplate(
    @Request() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ContentTemplate> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    const userRole = userRecord?.role || '';
    return this.contentTemplatesService.getContentTemplate(id, user.id, userRole);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '建立內容模板', description: '新增內容模板到系統' })
  @ApiResponse({ status: 201, description: '建立成功',  })
  @ApiResponse({ status: 400, description: '驗證失敗' })
  async createContentTemplate(
    @Request() req: AuthRequest,
    @Body(new ZodValidationPipe(CreateContentTemplateSchema)) createDto: CreateContentTemplateDto,
  ): Promise<ContentTemplate> {
    const user = req.user;
    return this.contentTemplatesService.createContentTemplate(createDto, user.id);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '更新內容模板', description: '修改模板內容和結構' })
  @ApiParam({ name: 'id', description: '模板 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '更新成功',  })
  @ApiResponse({ status: 404, description: '模板不存在' })
  async updateContentTemplate(
    @Request() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateContentTemplateSchema)) updateDto: UpdateContentTemplateDto,
  ): Promise<ContentTemplate> {
    const user = req.user;
    return this.contentTemplatesService.updateContentTemplate(id, updateDto, user.id);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '刪除內容模板', description: '刪除模板' })
  @ApiParam({ name: 'id', description: '模板 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '刪除成功' })
  @ApiResponse({ status: 404, description: '模板不存在' })
  async deleteContentTemplate(
    @Request() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    const user = req.user;
    return this.contentTemplatesService.deleteContentTemplate(id, user.id);
  }
}
