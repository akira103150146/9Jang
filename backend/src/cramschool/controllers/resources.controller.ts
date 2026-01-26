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

@Controller('cramschool/resources')
@UseGuards(JwtAuthGuard)
export class ResourcesController {
  constructor(
    private readonly resourcesService: ResourcesService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async getResources(
    @Request() req,
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
  async getResource(@Param('id', ParseIntPipe) id: number): Promise<LearningResource> {
    return this.resourcesService.getResource(id);
  }

  @Post()
  async createResource(
    @Body(new ZodValidationPipe(CreateLearningResourceSchema))
    createDto: CreateLearningResourceDto,
    @Request() req,
  ): Promise<LearningResource> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    return this.resourcesService.createResource(createDto, user.id, userRecord?.role || 'STUDENT');
  }

  @Put(':id')
  async updateResource(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateLearningResourceSchema))
    updateDto: UpdateLearningResourceDto,
    @Request() req,
  ): Promise<LearningResource> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    return this.resourcesService.updateResource(id, updateDto, user.id, userRecord?.role || 'STUDENT');
  }

  @Delete(':id')
  async deleteResource(@Param('id', ParseIntPipe) id: number, @Request() req): Promise<void> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    return this.resourcesService.deleteResource(id, userRecord?.role || 'STUDENT');
  }

  @Post(':id/bind-to-course')
  async bindToCourse(
    @Request() req,
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
  async exportResource(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { format_type?: string },
  ): Promise<any> {
    return this.resourcesService.exportResource(id, body.format_type || 'question_only');
  }

  @Post(':id/grade')
  async gradeResource(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { submission: any },
  ): Promise<any> {
    return this.resourcesService.gradeResource(id, body.submission || {});
  }
}
