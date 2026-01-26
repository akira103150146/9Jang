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

@Controller('cramschool/content-templates')
@UseGuards(JwtAuthGuard)
export class ContentTemplatesController {
  constructor(
    private readonly contentTemplatesService: ContentTemplatesService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async getContentTemplates(
    @Request() req,
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
  async getContentTemplate(
    @Request() req,
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
  async createContentTemplate(
    @Request() req,
    @Body(new ZodValidationPipe(CreateContentTemplateSchema)) createDto: CreateContentTemplateDto,
  ): Promise<ContentTemplate> {
    const user = req.user;
    return this.contentTemplatesService.createContentTemplate(createDto, user.id);
  }

  @Put(':id')
  async updateContentTemplate(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateContentTemplateSchema)) updateDto: UpdateContentTemplateDto,
  ): Promise<ContentTemplate> {
    const user = req.user;
    return this.contentTemplatesService.updateContentTemplate(id, updateDto, user.id);
  }

  @Delete(':id')
  async deleteContentTemplate(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    const user = req.user;
    return this.contentTemplatesService.deleteContentTemplate(id, user.id);
  }
}
