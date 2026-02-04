import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateContentTemplateDto,
  UpdateContentTemplateDto,
  ContentTemplate,
} from '@9jang/shared';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class ContentTemplatesService {
  constructor(private prisma: PrismaService) {}

  async getContentTemplates(userId: number, userRole: string, page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;

    // 只有老師可以訪問
    if (userRole !== 'TEACHER') {
      return { count: 0, results: [], page: 1, page_size: pageSize };
    }

    const where: any = {
      OR: [
        { isPublic: true },
        { createdById: userId },
      ],
    };

    const [results, count] = await Promise.all([
      this.prisma.cramschoolContentTemplate.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: { templateId: 'desc' },
      }),
      this.prisma.cramschoolContentTemplate.count({ where }),
    ]);

    return createPaginatedResponse(
      results.map((t) => this.toContentTemplateDto(t)),
      count,
      page,
      pageSize,
    );
  }

  async getContentTemplate(id: number, userId: number, userRole: string): Promise<ContentTemplate> {
    const template = await this.prisma.cramschoolContentTemplate.findUnique({
      where: { templateId: id },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException(`ContentTemplate with ID ${id} not found`);
    }

    // 權限檢查：只有老師可以訪問，且必須是公開的或自己創建的
    if (userRole !== 'TEACHER') {
      throw new NotFoundException(`ContentTemplate with ID ${id} not found`);
    }

    if (!template.isPublic && template.createdById !== userId) {
      throw new NotFoundException(`ContentTemplate with ID ${id} not found`);
    }

    return this.toContentTemplateDto(template);
  }

  async createContentTemplate(createDto: CreateContentTemplateDto, userId: number): Promise<ContentTemplate> {
    const template = await this.prisma.cramschoolContentTemplate.create({
      data: {
        title: createDto.title,
        structure: createDto.structure || [],
        tiptapStructure: createDto.tiptap_structure ?? Prisma.DbNull,
        createdById: userId,
        isPublic: createDto.is_public || false,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return this.toContentTemplateDto(template);
  }

  async updateContentTemplate(
    id: number,
    updateDto: UpdateContentTemplateDto,
    userId: number,
  ): Promise<ContentTemplate> {
    const template = await this.prisma.cramschoolContentTemplate.findUnique({
      where: { templateId: id },
    });

    if (!template) {
      throw new NotFoundException(`ContentTemplate with ID ${id} not found`);
    }

    // 只有創建者可以更新
    if (template.createdById !== userId) {
      throw new NotFoundException(`ContentTemplate with ID ${id} not found`);
    }

    const updatedTemplate = await this.prisma.cramschoolContentTemplate.update({
      where: { templateId: id },
      data: {
        title: updateDto.title,
        structure: updateDto.structure,
        tiptapStructure: updateDto.tiptap_structure !== undefined 
          ? (updateDto.tiptap_structure ?? Prisma.DbNull)
          : undefined,
        isPublic: updateDto.is_public,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return this.toContentTemplateDto(updatedTemplate);
  }

  async deleteContentTemplate(id: number, userId: number): Promise<void> {
    const template = await this.prisma.cramschoolContentTemplate.findUnique({
      where: { templateId: id },
    });

    if (!template) {
      throw new NotFoundException(`ContentTemplate with ID ${id} not found`);
    }

    // 只有創建者可以刪除
    if (template.createdById !== userId) {
      throw new NotFoundException(`ContentTemplate with ID ${id} not found`);
    }

    await this.prisma.cramschoolContentTemplate.delete({
      where: { templateId: id },
    });
  }

  private toContentTemplateDto(template: any): ContentTemplate {
    return {
      template_id: template.templateId,
      title: template.title,
      structure: template.structure as any,
      tiptap_structure: template.tiptapStructure as any || null,
      created_by: template.createdById || null,
      is_public: template.isPublic,
      tag_ids: template.tags?.map((t: any) => t.tag?.tagId || t.tagId) || [],
      created_at: template.createdAt?.toISOString(),
      updated_at: template.updatedAt?.toISOString(),
    };
  }
}
