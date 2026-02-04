import { AuthRequest } from '@/types/request.types';
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

@Controller('cramschool/student-mistake-note-images')
@UseGuards(JwtAuthGuard)
export class StudentMistakeNoteImagesController {
  constructor(
    private readonly studentMistakeNoteImagesService: StudentMistakeNoteImagesService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
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
