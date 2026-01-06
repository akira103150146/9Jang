import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateStudentMistakeNoteDto,
  UpdateStudentMistakeNoteDto,
  StudentMistakeNote,
} from '@9jang/shared';
import { createPaginatedResponse } from '../../common/utils/pagination.util';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StudentMistakeNotesService {
  constructor(private prisma: PrismaService) {}

  async getStudentMistakeNotes(
    userId: number,
    userRole: string,
    includeDeleted: boolean = false,
    studentId?: number,
    searchQuery?: string,
    page: number = 1,
    pageSize: number = 10,
  ) {
    const skip = (page - 1) * pageSize;
    const where: any = {};

    // 會計不可用
    if (userRole === 'ACCOUNTANT') {
      return { count: 0, results: [], page: 1, page_size: pageSize };
    }

    // 學生只能看自己的筆記
    if (userRole === 'STUDENT') {
      const student = await this.prisma.cramschoolStudent.findFirst({
        where: { userId },
      });
      if (student) {
        where.studentId = student.studentId;
      } else {
        return { count: 0, results: [], page: 1, page_size: pageSize };
      }
    } else if (userRole === 'TEACHER' || userRole === 'ADMIN') {
      // 老師/管理員可以查看指定學生的筆記
      if (studentId) {
        where.studentId = studentId;
      } else {
        return { count: 0, results: [], page: 1, page_size: pageSize };
      }
    } else {
      return { count: 0, results: [], page: 1, page_size: pageSize };
    }

    if (!includeDeleted) {
      where.isDeleted = false;
    }

    // 搜尋功能
    if (searchQuery) {
      where.OR = [
        { title: { contains: searchQuery } },
        { subject: { contains: searchQuery } },
        { content: { contains: searchQuery } },
      ];
    }

    const [results, count] = await Promise.all([
      this.prisma.cramschoolStudentMistakeNote.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          student: true,
        },
        orderBy: [{ updatedAt: 'desc' }, { noteId: 'desc' }],
      }),
      this.prisma.cramschoolStudentMistakeNote.count({ where }),
    ]);

    return createPaginatedResponse(
      results.map((n) => this.toStudentMistakeNoteDto(n)),
      count,
      page,
      pageSize,
    );
  }

  async getStudentMistakeNote(id: number, userId: number, userRole: string): Promise<StudentMistakeNote> {
    const note = await this.prisma.cramschoolStudentMistakeNote.findUnique({
      where: { noteId: id },
      include: {
        student: true,
      },
    });

    if (!note) {
      throw new NotFoundException(`StudentMistakeNote with ID ${id} not found`);
    }

    // 權限檢查
    if (userRole === 'STUDENT') {
      const student = await this.prisma.cramschoolStudent.findFirst({
        where: { userId },
      });
      if (!student || note.studentId !== student.studentId) {
        throw new NotFoundException(`StudentMistakeNote with ID ${id} not found`);
      }
    } else if (userRole === 'ACCOUNTANT') {
      throw new NotFoundException(`StudentMistakeNote with ID ${id} not found`);
    }

    return this.toStudentMistakeNoteDto(note);
  }

  async createStudentMistakeNote(
    createDto: CreateStudentMistakeNoteDto,
    userId: number,
    userRole: string,
  ): Promise<StudentMistakeNote> {
    // 只有學生可以新增
    if (userRole !== 'STUDENT') {
      throw new ForbiddenException('只有學生可以新增錯題筆記');
    }

    const student = await this.prisma.cramschoolStudent.findFirst({
      where: { userId },
    });

    if (!student) {
      throw new ForbiddenException('找不到學生資料');
    }

    const note = await this.prisma.cramschoolStudentMistakeNote.create({
      data: {
        studentId: student.studentId,
        title: createDto.title,
        subject: createDto.subject || null,
        content: createDto.content || null,
      },
      include: {
        student: true,
      },
    });

    return this.toStudentMistakeNoteDto(note);
  }

  async updateStudentMistakeNote(
    id: number,
    updateDto: UpdateStudentMistakeNoteDto,
    userId: number,
    userRole: string,
  ): Promise<StudentMistakeNote> {
    const note = await this.prisma.cramschoolStudentMistakeNote.findUnique({
      where: { noteId: id },
    });

    if (!note) {
      throw new NotFoundException(`StudentMistakeNote with ID ${id} not found`);
    }

    // 只有學生可以編輯，且只能編輯自己的
    if (userRole !== 'STUDENT') {
      throw new ForbiddenException('只有學生可以編輯錯題筆記');
    }

    const student = await this.prisma.cramschoolStudent.findFirst({
      where: { userId },
    });

    if (!student || note.studentId !== student.studentId) {
      throw new ForbiddenException('只能編輯自己的錯題筆記');
    }

    const updatedNote = await this.prisma.cramschoolStudentMistakeNote.update({
      where: { noteId: id },
      data: {
        title: updateDto.title,
        subject: updateDto.subject !== undefined ? updateDto.subject : undefined,
        content: updateDto.content !== undefined ? updateDto.content : undefined,
      },
      include: {
        student: true,
      },
    });

    return this.toStudentMistakeNoteDto(updatedNote);
  }

  async deleteStudentMistakeNote(id: number, userId: number, userRole: string): Promise<void> {
    const note = await this.prisma.cramschoolStudentMistakeNote.findUnique({
      where: { noteId: id },
    });

    if (!note) {
      throw new NotFoundException(`StudentMistakeNote with ID ${id} not found`);
    }

    // 只有學生可以刪除，且只能刪除自己的
    if (userRole !== 'STUDENT') {
      throw new ForbiddenException('只有學生可以刪除錯題筆記');
    }

    const student = await this.prisma.cramschoolStudent.findFirst({
      where: { userId },
    });

    if (!student || note.studentId !== student.studentId) {
      throw new ForbiddenException('只能刪除自己的錯題筆記');
    }

    // 軟刪除
    await this.prisma.cramschoolStudentMistakeNote.update({
      where: { noteId: id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async restoreStudentMistakeNote(id: number): Promise<StudentMistakeNote> {
    const note = await this.prisma.cramschoolStudentMistakeNote.findUnique({
      where: { noteId: id },
    });

    if (!note) {
      throw new NotFoundException(`StudentMistakeNote with ID ${id} not found`);
    }

    if (!note.isDeleted) {
      throw new NotFoundException(`StudentMistakeNote with ID ${id} is not deleted`);
    }

    const restoredNote = await this.prisma.cramschoolStudentMistakeNote.update({
      where: { noteId: id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
      include: {
        student: true,
      },
    });

    return this.toStudentMistakeNoteDto(restoredNote);
  }

  async importToQuestionBank(
    id: number,
    userId: number,
    body: {
      subject_id: number;
      level: string;
      chapter: string;
      content: string;
      correct_answer: string;
      difficulty?: number;
      question_number?: string;
      origin?: string;
      origin_detail?: string;
      solution_content?: string;
      image_path?: string;
      tag_ids?: number[];
    },
  ): Promise<any> {
    const note = await this.prisma.cramschoolStudentMistakeNote.findUnique({
      where: { noteId: id },
      include: {
        student: true,
      },
    });

    if (!note) {
      throw new NotFoundException(`StudentMistakeNote with ID ${id} not found`);
    }

    if (note.isDeleted) {
      throw new NotFoundException(`StudentMistakeNote with ID ${id} is deleted`);
    }

    // 創建題目
    const newQuestion = await this.prisma.cramschoolQuestionBank.create({
      data: {
        subjectId: body.subject_id,
        level: body.level,
        chapter: body.chapter,
        content: body.content,
        correctAnswer: body.correct_answer,
        difficulty: body.difficulty || 3,
        questionNumber: body.question_number || null,
        origin: body.origin || '',
        originDetail: body.origin_detail || '',
        solutionContent: body.solution_content || '',
        imagePath: body.image_path || null,
        source: 'imported_from_student_note',
        createdById: userId,
        importedStudentId: note.studentId,
      },
    });

    // 處理標籤
    if (body.tag_ids && body.tag_ids.length > 0) {
      const tagRelations = body.tag_ids.map((tagId) => ({
        questionId: newQuestion.questionId,
        tagId,
      }));

      await this.prisma.cramschoolQuestionTag.createMany({
        data: tagRelations,
        skipDuplicates: true,
      });
    }

    return newQuestion;
  }

  async uploadImages(noteId: number, userId: number, files: Express.Multer.File[]): Promise<any[]> {
    const note = await this.prisma.cramschoolStudentMistakeNote.findUnique({
      where: { noteId },
      include: {
        student: true,
      },
    });

    if (!note) {
      throw new NotFoundException(`StudentMistakeNote with ID ${noteId} not found`);
    }

    // 驗證是學生自己的筆記
    const student = await this.prisma.cramschoolStudent.findFirst({
      where: { userId },
    });

    if (!student || note.studentId !== student.studentId) {
      throw new ForbiddenException('只能操作自己的錯題筆記');
    }

    // 獲取當前最大 sort_order
    const maxSortOrder = await this.prisma.cramschoolStudentMistakeNoteImage.aggregate({
      where: { noteId },
      _max: { sortOrder: true },
    });
    const currentMax = maxSortOrder._max.sortOrder || 0;

    const created: any[] = [];

    for (let idx = 0; idx < files.length; idx++) {
      const file = files[idx];

      // 檢查文件類型
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      const fileExt = path.extname(file.originalname).slice(1).toLowerCase();
      if (!allowedExtensions.includes(fileExt)) {
        throw new BadRequestException(
          `不支援的文件類型。允許的類型：${allowedExtensions.join(', ')}`,
        );
      }

      // 檢查文件大小（限制為 5MB）
      if (file.size > 5 * 1024 * 1024) {
        throw new BadRequestException('圖片文件大小不能超過 5MB');
      }

      // 創建保存路徑
      const now = new Date();
      const dateFolder = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
      const uniqueFilename = `${uuidv4().replace(/-/g, '')}.${fileExt}`;
      const relativePath = `mistake_images/${dateFolder}/${uniqueFilename}`;

      // 保存文件
      const mediaRoot = process.env.MEDIA_ROOT || './media';
      const fullPath = path.join(mediaRoot, relativePath);
      const dir = path.dirname(fullPath);

      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(fullPath, file.buffer);

      // 構建 URL
      const mediaUrl = process.env.MEDIA_URL || '/media/';
      const imageUrl = mediaUrl.startsWith('http')
        ? `${mediaUrl}${relativePath}`
        : `${process.env.BASE_URL || 'http://localhost:3000'}${mediaUrl}${relativePath}`;

      // 創建數據庫記錄
      const image = await this.prisma.cramschoolStudentMistakeNoteImage.create({
        data: {
          noteId,
          imagePath: relativePath,
          sortOrder: currentMax + idx + 1,
        },
        include: {
          note: {
            include: {
              student: true,
            },
          },
        },
      });

      created.push({
        image_id: image.imageId,
        note_id: image.noteId,
        image_path: image.imagePath,
        image_url: imageUrl,
        caption: image.caption || null,
        sort_order: image.sortOrder,
        created_at: image.createdAt?.toISOString(),
      });
    }

    return created;
  }

  async reorderImages(noteId: number, userId: number, imageIds: number[]): Promise<{ success: boolean }> {
    const note = await this.prisma.cramschoolStudentMistakeNote.findUnique({
      where: { noteId },
    });

    if (!note) {
      throw new NotFoundException(`StudentMistakeNote with ID ${noteId} not found`);
    }

    // 驗證是學生自己的筆記
    const student = await this.prisma.cramschoolStudent.findFirst({
      where: { userId },
    });

    if (!student || note.studentId !== student.studentId) {
      throw new ForbiddenException('只能操作自己的錯題筆記');
    }

    // 驗證所有圖片都屬於此筆記
    const images = await this.prisma.cramschoolStudentMistakeNoteImage.findMany({
      where: {
        noteId,
        imageId: { in: imageIds },
      },
    });

    if (images.length !== imageIds.length) {
      throw new BadRequestException('image_ids 包含不屬於此筆記的圖片');
    }

    // 更新排序
    const updates = imageIds.map((imageId, index) =>
      this.prisma.cramschoolStudentMistakeNoteImage.update({
        where: { imageId },
        data: { sortOrder: index + 1 },
      }),
    );

    await Promise.all(updates);

    return { success: true };
  }

  private toStudentMistakeNoteDto(note: any): StudentMistakeNote {
    return {
      note_id: note.noteId,
      student_id: note.studentId,
      title: note.title,
      subject: note.subject || null,
      content: note.content || null,
      created_at: note.createdAt?.toISOString(),
      updated_at: note.updatedAt?.toISOString(),
      is_deleted: note.isDeleted,
      deleted_at: note.deletedAt?.toISOString() || null,
    };
  }
}
