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
import { ErrorLogImagesService } from '../services/error-log-images.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateErrorLogImageDto,
  UpdateErrorLogImageDto,
  ErrorLogImage,
  CreateErrorLogImageSchema,
  UpdateErrorLogImageSchema,
} from '@9jang/shared';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../account/guards/jwt-auth.guard';

@Controller('cramschool/error-log-images')
@UseGuards(JwtAuthGuard)
export class ErrorLogImagesController {
  constructor(
    private readonly errorLogImagesService: ErrorLogImagesService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async getErrorLogImages(
    @Request() req,
    @Query('error_log', new ParseIntPipe({ optional: true })) errorLogId?: number,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true })) pageSize: number = 10,
  ) {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    const userRole = userRecord?.role || '';

    // 會計和學生不可用
    if (userRole === 'ACCOUNTANT' || userRole === 'STUDENT') {
      return { count: 0, results: [], page: 1, page_size: pageSize };
    }

    return this.errorLogImagesService.getErrorLogImages(errorLogId, page, pageSize);
  }

  @Get(':id')
  async getErrorLogImage(@Param('id', ParseIntPipe) id: number): Promise<ErrorLogImage> {
    return this.errorLogImagesService.getErrorLogImage(id);
  }

  @Post()
  async createErrorLogImage(
    @Body(new ZodValidationPipe(CreateErrorLogImageSchema)) createDto: CreateErrorLogImageDto,
  ): Promise<ErrorLogImage> {
    return this.errorLogImagesService.createErrorLogImage(createDto);
  }

  @Put(':id')
  async updateErrorLogImage(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateErrorLogImageSchema)) updateDto: UpdateErrorLogImageDto,
  ): Promise<ErrorLogImage> {
    return this.errorLogImagesService.updateErrorLogImage(id, updateDto);
  }

  @Delete(':id')
  async deleteErrorLogImage(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.errorLogImagesService.deleteErrorLogImage(id);
  }
}
