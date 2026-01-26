import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateSubjectDto,
  UpdateSubjectDto,
  Subject,
} from '@9jang/shared';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  async getSubjects(page: number = 1, pageSize: number = 10, userRole: string) {
    // 學生/會計不可見
    if (userRole === 'STUDENT' || userRole === 'ACCOUNTANT') {
      return createPaginatedResponse([], 0, page, pageSize);
    }

    const skip = (page - 1) * pageSize;
    const [results, count] = await Promise.all([
      this.prisma.cramschoolSubject.findMany({
        skip,
        take: pageSize,
        orderBy: { name: 'asc' },
      }),
      this.prisma.cramschoolSubject.count(),
    ]);

    return createPaginatedResponse(
      results.map((s) => this.toSubjectDto(s)),
      count,
      page,
      pageSize,
    );
  }

  async getSubject(id: number, userRole: string): Promise<Subject> {
    // 學生/會計不可見
    if (userRole === 'STUDENT' || userRole === 'ACCOUNTANT') {
      throw new ForbiddenException('您沒有權限查看科目');
    }

    const subject = await this.prisma.cramschoolSubject.findUnique({
      where: { subjectId: id },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    return this.toSubjectDto(subject);
  }

  async createSubject(createDto: CreateSubjectDto, userRole: string): Promise<Subject> {
    // 學生/會計不可見
    if (userRole === 'STUDENT' || userRole === 'ACCOUNTANT') {
      throw new ForbiddenException('您沒有權限創建科目');
    }

    const subject = await this.prisma.cramschoolSubject.create({
      data: {
        name: createDto.name,
        code: createDto.code || null,
        description: createDto.description || null,
      },
    });

    return this.toSubjectDto(subject);
  }

  async updateSubject(id: number, updateDto: UpdateSubjectDto, userRole: string): Promise<Subject> {
    // 學生/會計不可見
    if (userRole === 'STUDENT' || userRole === 'ACCOUNTANT') {
      throw new ForbiddenException('您沒有權限更新科目');
    }

    const subject = await this.prisma.cramschoolSubject.findUnique({
      where: { subjectId: id },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    const updatedSubject = await this.prisma.cramschoolSubject.update({
      where: { subjectId: id },
      data: {
        name: updateDto.name,
        code: updateDto.code,
        description: updateDto.description,
      },
    });

    return this.toSubjectDto(updatedSubject);
  }

  async deleteSubject(id: number, userRole: string): Promise<void> {
    // 學生/會計不可見
    if (userRole === 'STUDENT' || userRole === 'ACCOUNTANT') {
      throw new ForbiddenException('您沒有權限刪除科目');
    }

    const subject = await this.prisma.cramschoolSubject.findUnique({
      where: { subjectId: id },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    await this.prisma.cramschoolSubject.delete({
      where: { subjectId: id },
    });
  }

  private toSubjectDto(subject: any): Subject {
    return {
      subject_id: subject.subjectId,
      name: subject.name,
      code: subject.code || null,
      description: subject.description || null,
      created_at: subject.createdAt?.toISOString(),
    };
  }
}
