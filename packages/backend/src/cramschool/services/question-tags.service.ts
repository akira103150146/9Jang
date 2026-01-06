import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateQuestionTagDto,
  UpdateQuestionTagDto,
  QuestionTag,
} from '@9jang/shared';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class QuestionTagsService {
  constructor(private prisma: PrismaService) {}

  async getQuestionTags(page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;

    const [results, count] = await Promise.all([
      this.prisma.cramschoolQuestionTag.findMany({
        skip,
        take: pageSize,
        include: {
          question: true,
          tag: true,
        },
      }),
      this.prisma.cramschoolQuestionTag.count(),
    ]);

    return createPaginatedResponse(
      results.map((qt) => this.toQuestionTagDto(qt)),
      count,
      page,
      pageSize,
    );
  }

  async getQuestionTag(id: number): Promise<QuestionTag> {
    const questionTag = await this.prisma.cramschoolQuestionTag.findUnique({
      where: { questionTagId: id },
      include: {
        question: true,
        tag: true,
      },
    });

    if (!questionTag) {
      throw new NotFoundException(`QuestionTag with ID ${id} not found`);
    }

    return this.toQuestionTagDto(questionTag);
  }

  async createQuestionTag(createDto: CreateQuestionTagDto): Promise<QuestionTag> {
    const questionTag = await this.prisma.cramschoolQuestionTag.create({
      data: {
        questionId: createDto.question_id,
        tagId: createDto.tag_id,
      },
      include: {
        question: true,
        tag: true,
      },
    });

    return this.toQuestionTagDto(questionTag);
  }

  async updateQuestionTag(id: number, updateDto: UpdateQuestionTagDto): Promise<QuestionTag> {
    const questionTag = await this.prisma.cramschoolQuestionTag.findUnique({
      where: { questionTagId: id },
    });

    if (!questionTag) {
      throw new NotFoundException(`QuestionTag with ID ${id} not found`);
    }

    const updatedQuestionTag = await this.prisma.cramschoolQuestionTag.update({
      where: { questionTagId: id },
      data: {
        questionId: updateDto.question_id,
        tagId: updateDto.tag_id,
      },
      include: {
        question: true,
        tag: true,
      },
    });

    return this.toQuestionTagDto(updatedQuestionTag);
  }

  async deleteQuestionTag(id: number): Promise<void> {
    const questionTag = await this.prisma.cramschoolQuestionTag.findUnique({
      where: { questionTagId: id },
    });

    if (!questionTag) {
      throw new NotFoundException(`QuestionTag with ID ${id} not found`);
    }

    await this.prisma.cramschoolQuestionTag.delete({
      where: { questionTagId: id },
    });
  }

  private toQuestionTagDto(questionTag: any): QuestionTag {
    return {
      question_tag_id: questionTag.questionTagId,
      question_id: questionTag.questionId,
      tag_id: questionTag.tagId,
    };
  }
}
