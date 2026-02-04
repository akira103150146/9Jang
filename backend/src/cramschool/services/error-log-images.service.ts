import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateErrorLogImageDto,
  UpdateErrorLogImageDto,
  ErrorLogImage,
} from '@9jang/shared';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class ErrorLogImagesService {
  constructor(private prisma: PrismaService) {}

  async getErrorLogImages(errorLogId?: number, page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;
    const where: any = {};

    if (errorLogId) {
      where.errorLogId = errorLogId;
    }

    const [results, count] = await Promise.all([
      this.prisma.cramschoolErrorLogImage.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ sortOrder: 'asc' }, { imageId: 'asc' }],
      }),
      this.prisma.cramschoolErrorLogImage.count({ where }),
    ]);

    return createPaginatedResponse(
      results.map((img) => this.toErrorLogImageDto(img)),
      count,
      page,
      pageSize,
    );
  }

  async getErrorLogImage(id: number): Promise<ErrorLogImage> {
    const image = await this.prisma.cramschoolErrorLogImage.findUnique({
      where: { imageId: id },
    });

    if (!image) {
      throw new NotFoundException(`ErrorLogImage with ID ${id} not found`);
    }

    return this.toErrorLogImageDto(image);
  }

  async createErrorLogImage(createDto: CreateErrorLogImageDto): Promise<ErrorLogImage> {
    const image = await this.prisma.cramschoolErrorLogImage.create({
      data: {
        errorLogId: createDto.error_log_id,
        imagePath: createDto.image_path,
        caption: createDto.caption || null,
        sortOrder: createDto.sort_order || 0,
      },
    });

    return this.toErrorLogImageDto(image);
  }

  async updateErrorLogImage(id: number, updateDto: UpdateErrorLogImageDto): Promise<ErrorLogImage> {
    const image = await this.prisma.cramschoolErrorLogImage.findUnique({
      where: { imageId: id },
    });

    if (!image) {
      throw new NotFoundException(`ErrorLogImage with ID ${id} not found`);
    }

    const updatedImage = await this.prisma.cramschoolErrorLogImage.update({
      where: { imageId: id },
      data: {
        caption: updateDto.caption !== undefined ? updateDto.caption : undefined,
        sortOrder: updateDto.sort_order !== undefined ? updateDto.sort_order : undefined,
      },
    });

    return this.toErrorLogImageDto(updatedImage);
  }

  async deleteErrorLogImage(id: number): Promise<void> {
    const image = await this.prisma.cramschoolErrorLogImage.findUnique({
      where: { imageId: id },
    });

    if (!image) {
      throw new NotFoundException(`ErrorLogImage with ID ${id} not found`);
    }

    await this.prisma.cramschoolErrorLogImage.delete({
      where: { imageId: id },
    });
  }

  private toErrorLogImageDto(image: any): ErrorLogImage {
    return {
      image_id: image.imageId,
      error_log_id: image.errorLogId,
      image_path: image.imagePath,
      caption: image.caption || null,
      sort_order: image.sortOrder,
      created_at: image.createdAt?.toISOString(),
    };
  }
}
