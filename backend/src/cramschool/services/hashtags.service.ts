import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateHashtagDto,
  UpdateHashtagDto,
  Hashtag,
} from '@9jang/shared';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class HashtagsService {
  constructor(private prisma: PrismaService) {}

  async getHashtags(page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;

    const [results, count] = await Promise.all([
      this.prisma.cramschoolHashtag.findMany({
        skip,
        take: pageSize,
        include: {
          creator: true,
        },
        orderBy: { tagName: 'asc' },
      }),
      this.prisma.cramschoolHashtag.count(),
    ]);

    return createPaginatedResponse(
      results.map((h) => this.toHashtagDto(h)),
      count,
      page,
      pageSize,
    );
  }

  async getHashtag(id: number): Promise<Hashtag> {
    const hashtag = await this.prisma.cramschoolHashtag.findUnique({
      where: { tagId: id },
      include: {
        creator: true,
      },
    });

    if (!hashtag) {
      throw new NotFoundException(`Hashtag with ID ${id} not found`);
    }

    return this.toHashtagDto(hashtag);
  }

  async createHashtag(createDto: CreateHashtagDto): Promise<Hashtag> {
    const hashtag = await this.prisma.cramschoolHashtag.create({
      data: {
        tagName: createDto.tag_name,
        creatorId: createDto.creator_id || null,
      },
      include: {
        creator: true,
      },
    });

    return this.toHashtagDto(hashtag);
  }

  async updateHashtag(id: number, updateDto: UpdateHashtagDto): Promise<Hashtag> {
    const hashtag = await this.prisma.cramschoolHashtag.findUnique({
      where: { tagId: id },
    });

    if (!hashtag) {
      throw new NotFoundException(`Hashtag with ID ${id} not found`);
    }

    const updatedHashtag = await this.prisma.cramschoolHashtag.update({
      where: { tagId: id },
      data: {
        tagName: updateDto.tag_name,
        creatorId: updateDto.creator_id !== undefined ? updateDto.creator_id : undefined,
      },
      include: {
        creator: true,
      },
    });

    return this.toHashtagDto(updatedHashtag);
  }

  async deleteHashtag(id: number): Promise<void> {
    const hashtag = await this.prisma.cramschoolHashtag.findUnique({
      where: { tagId: id },
    });

    if (!hashtag) {
      throw new NotFoundException(`Hashtag with ID ${id} not found`);
    }

    await this.prisma.cramschoolHashtag.delete({
      where: { tagId: id },
    });
  }

  private toHashtagDto(hashtag: any): Hashtag & { creator_name?: string } {
    const result: any = {
      tag_id: hashtag.tagId,
      tag_name: hashtag.tagName,
      creator_id: hashtag.creatorId || null,
      creator_name: hashtag.creator?.name || undefined,
    };

    return result as Hashtag;
  }
}
