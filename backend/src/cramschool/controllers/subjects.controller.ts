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

@Controller('cramschool/subjects')
@UseGuards(JwtAuthGuard)
export class SubjectsController {
  constructor(
    private readonly subjectsService: SubjectsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async getSubjects(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true })) pageSize: number = 10,
    @Request() req,
  ) {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    return this.subjectsService.getSubjects(page, pageSize, userRecord?.role || 'STUDENT');
  }

  @Get(':id')
  async getSubject(@Param('id', ParseIntPipe) id: number, @Request() req): Promise<Subject> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    return this.subjectsService.getSubject(id, userRecord?.role || 'STUDENT');
  }

  @Post()
  async createSubject(
    @Body(new ZodValidationPipe(CreateSubjectSchema)) createDto: CreateSubjectDto,
    @Request() req,
  ): Promise<Subject> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    return this.subjectsService.createSubject(createDto, userRecord?.role || 'STUDENT');
  }

  @Put(':id')
  async updateSubject(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateSubjectSchema)) updateDto: UpdateSubjectDto,
    @Request() req,
  ): Promise<Subject> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    return this.subjectsService.updateSubject(id, updateDto, userRecord?.role || 'STUDENT');
  }

  @Delete(':id')
  async deleteSubject(@Param('id', ParseIntPipe) id: number, @Request() req): Promise<void> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    return this.subjectsService.deleteSubject(id, userRecord?.role || 'STUDENT');
  }
}
