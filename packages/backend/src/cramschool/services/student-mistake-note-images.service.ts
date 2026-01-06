import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateStudentMistakeNoteImageDto,
  UpdateStudentMistakeNoteImageDto,
  StudentMistakeNoteImage,
} from '@9jang/shared';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class StudentMistakeNoteImagesService {
  constructor(private prisma: PrismaService) {}

  async getStudentMistakeNoteImages(
    userId: number,
    userRole: string,
    noteId?: number,
    page: number = 1,
    pageSize: number = 10,
  ) {
    const skip = (page - 1) * pageSize;
    const where: any = {};

    // 只有學生可以訪問
    if (userRole !== 'STUDENT') {
      return { count: 0, results: [], page: 1, page_size: pageSize };
    }

    const student = await this.prisma.cramschoolStudent.findFirst({
      where: { userId },
    });

    if (!student) {
      return { count: 0, results: [], page: 1, page_size: pageSize };
    }

    if (noteId) {
      where.noteId = noteId;
      // 確保該筆記屬於該學生
      const note = await this.prisma.cramschoolStudentMistakeNote.findUnique({
        where: { noteId },
      });
      if (!note || note.studentId !== student.studentId) {
        return { count: 0, results: [], page: 1, page_size: pageSize };
      }
    } else {
      // 如果沒有指定 noteId，只返回該學生的所有筆記的圖片
      const notes = await this.prisma.cramschoolStudentMistakeNote.findMany({
        where: { studentId: student.studentId },
        select: { noteId: true },
      });
      where.noteId = { in: notes.map((n) => n.noteId) };
    }

    const [results, count] = await Promise.all([
      this.prisma.cramschoolStudentMistakeNoteImage.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          note: {
            include: {
              student: true,
            },
          },
        },
        orderBy: [{ sortOrder: 'asc' }, { imageId: 'asc' }],
      }),
      this.prisma.cramschoolStudentMistakeNoteImage.count({ where }),
    ]);

    return createPaginatedResponse(
      results.map((img) => this.toStudentMistakeNoteImageDto(img)),
      count,
      page,
      pageSize,
    );
  }

  async getStudentMistakeNoteImage(id: number, userId: number, userRole: string): Promise<StudentMistakeNoteImage> {
    const image = await this.prisma.cramschoolStudentMistakeNoteImage.findUnique({
      where: { imageId: id },
      include: {
        note: {
          include: {
            student: true,
          },
        },
      },
    });

    if (!image) {
      throw new NotFoundException(`StudentMistakeNoteImage with ID ${id} not found`);
    }

    // 權限檢查：只有學生可以訪問，且只能訪問自己的
    if (userRole !== 'STUDENT') {
      throw new NotFoundException(`StudentMistakeNoteImage with ID ${id} not found`);
    }

    const student = await this.prisma.cramschoolStudent.findFirst({
      where: { userId },
    });

    if (!student || image.note.studentId !== student.studentId) {
      throw new NotFoundException(`StudentMistakeNoteImage with ID ${id} not found`);
    }

    return this.toStudentMistakeNoteImageDto(image);
  }

  async createStudentMistakeNoteImage(
    createDto: CreateStudentMistakeNoteImageDto,
    userId: number,
    userRole: string,
  ): Promise<StudentMistakeNoteImage> {
    // 只有學生可以新增
    if (userRole !== 'STUDENT') {
      throw new ForbiddenException('只有學生可以新增錯題筆記圖片');
    }

    const student = await this.prisma.cramschoolStudent.findFirst({
      where: { userId },
    });

    if (!student) {
      throw new ForbiddenException('找不到學生資料');
    }

    // 確保該筆記屬於該學生
    const note = await this.prisma.cramschoolStudentMistakeNote.findUnique({
      where: { noteId: createDto.note_id },
    });

    if (!note || note.studentId !== student.studentId) {
      throw new ForbiddenException('只能為自己的錯題筆記添加圖片');
    }

    const image = await this.prisma.cramschoolStudentMistakeNoteImage.create({
      data: {
        noteId: createDto.note_id,
        imagePath: createDto.image_path,
        caption: createDto.caption || null,
        sortOrder: createDto.sort_order || 0,
      },
      include: {
        note: {
          include: {
            student: true,
          },
        },
      },
    });

    return this.toStudentMistakeNoteImageDto(image);
  }

  async updateStudentMistakeNoteImage(
    id: number,
    updateDto: UpdateStudentMistakeNoteImageDto,
    userId: number,
    userRole: string,
  ): Promise<StudentMistakeNoteImage> {
    const image = await this.prisma.cramschoolStudentMistakeNoteImage.findUnique({
      where: { imageId: id },
      include: {
        note: {
          include: {
            student: true,
          },
        },
      },
    });

    if (!image) {
      throw new NotFoundException(`StudentMistakeNoteImage with ID ${id} not found`);
    }

    // 只有學生可以編輯，且只能編輯自己的
    if (userRole !== 'STUDENT') {
      throw new ForbiddenException('只有學生可以編輯錯題筆記圖片');
    }

    const student = await this.prisma.cramschoolStudent.findFirst({
      where: { userId },
    });

    if (!student || image.note.studentId !== student.studentId) {
      throw new ForbiddenException('只能編輯自己的錯題筆記圖片');
    }

    const updatedImage = await this.prisma.cramschoolStudentMistakeNoteImage.update({
      where: { imageId: id },
      data: {
        caption: updateDto.caption !== undefined ? updateDto.caption : undefined,
        sortOrder: updateDto.sort_order !== undefined ? updateDto.sort_order : undefined,
      },
      include: {
        note: {
          include: {
            student: true,
          },
        },
      },
    });

    return this.toStudentMistakeNoteImageDto(updatedImage);
  }

  async deleteStudentMistakeNoteImage(id: number, userId: number, userRole: string): Promise<void> {
    const image = await this.prisma.cramschoolStudentMistakeNoteImage.findUnique({
      where: { imageId: id },
      include: {
        note: {
          include: {
            student: true,
          },
        },
      },
    });

    if (!image) {
      throw new NotFoundException(`StudentMistakeNoteImage with ID ${id} not found`);
    }

    // 只有學生可以刪除，且只能刪除自己的
    if (userRole !== 'STUDENT') {
      throw new ForbiddenException('只有學生可以刪除錯題筆記圖片');
    }

    const student = await this.prisma.cramschoolStudent.findFirst({
      where: { userId },
    });

    if (!student || image.note.studentId !== student.studentId) {
      throw new ForbiddenException('只能刪除自己的錯題筆記圖片');
    }

    await this.prisma.cramschoolStudentMistakeNoteImage.delete({
      where: { imageId: id },
    });
  }

  private toStudentMistakeNoteImageDto(image: any): StudentMistakeNoteImage {
    return {
      image_id: image.imageId,
      note_id: image.noteId,
      image_path: image.imagePath,
      caption: image.caption || null,
      sort_order: image.sortOrder,
      created_at: image.createdAt?.toISOString(),
    };
  }
}
