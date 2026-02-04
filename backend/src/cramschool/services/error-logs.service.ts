import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateErrorLogDto,
  UpdateErrorLogDto,
  ErrorLog,
} from '@9jang/shared';
import { createPaginatedResponse } from '../../common/utils/pagination.util';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ErrorLogsService {
  constructor(private prisma: PrismaService) {}

  async getErrorLogs(
    userId: number,
    userRole: string,
    includeDeleted: boolean = false,
    studentId?: number,
    page: number = 1,
    pageSize: number = 10,
  ) {
    const skip = (page - 1) * pageSize;
    const where: any = {};

    if (!includeDeleted) {
      where.isDeleted = false;
    }

    // 會計不可用
    if (userRole === 'ACCOUNTANT') {
      return { count: 0, results: [], page: 1, page_size: pageSize };
    }

    // 學生只能看自己的錯題
    if (userRole === 'STUDENT') {
      const student = await this.prisma.cramschoolStudent.findFirst({
        where: { userId },
      });
      if (student) {
        where.studentId = student.studentId;
      } else {
        return { count: 0, results: [], page: 1, page_size: pageSize };
      }
    }

    if (studentId) {
      where.studentId = studentId;
    }

    const [results, count] = await Promise.all([
      this.prisma.cramschoolErrorLog.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          student: true,
          question: {
            include: {
              subject: true,
            },
          },
        },
        orderBy: { errorLogId: 'desc' },
      }),
      this.prisma.cramschoolErrorLog.count({ where }),
    ]);

    return createPaginatedResponse(
      results.map((el) => this.toErrorLogDto(el)),
      count,
      page,
      pageSize,
    );
  }

  async getErrorLog(id: number): Promise<ErrorLog> {
    const errorLog = await this.prisma.cramschoolErrorLog.findUnique({
      where: { errorLogId: id },
      include: {
        student: true,
        question: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (!errorLog) {
      throw new NotFoundException(`ErrorLog with ID ${id} not found`);
    }

    return this.toErrorLogDto(errorLog);
  }

  async createErrorLog(createDto: CreateErrorLogDto): Promise<ErrorLog> {
    const errorLog = await this.prisma.cramschoolErrorLog.create({
      data: {
        studentId: createDto.student_id,
        questionId: createDto.question_id,
        errorCount: createDto.error_count || 1,
        reviewStatus: createDto.review_status || 'New',
      },
      include: {
        student: true,
        question: {
          include: {
            subject: true,
          },
        },
      },
    });

    return this.toErrorLogDto(errorLog);
  }

  async updateErrorLog(id: number, updateDto: UpdateErrorLogDto): Promise<ErrorLog> {
    const errorLog = await this.prisma.cramschoolErrorLog.findUnique({
      where: { errorLogId: id },
    });

    if (!errorLog) {
      throw new NotFoundException(`ErrorLog with ID ${id} not found`);
    }

    const updatedErrorLog = await this.prisma.cramschoolErrorLog.update({
      where: { errorLogId: id },
      data: {
        studentId: updateDto.student_id,
        questionId: updateDto.question_id,
        errorCount: updateDto.error_count,
        reviewStatus: updateDto.review_status,
      },
      include: {
        student: true,
        question: {
          include: {
            subject: true,
          },
        },
      },
    });

    return this.toErrorLogDto(updatedErrorLog);
  }

  async deleteErrorLog(id: number): Promise<void> {
    const errorLog = await this.prisma.cramschoolErrorLog.findUnique({
      where: { errorLogId: id },
    });

    if (!errorLog) {
      throw new NotFoundException(`ErrorLog with ID ${id} not found`);
    }

    // 軟刪除
    await this.prisma.cramschoolErrorLog.update({
      where: { errorLogId: id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async restoreErrorLog(id: number): Promise<ErrorLog> {
    const errorLog = await this.prisma.cramschoolErrorLog.findUnique({
      where: { errorLogId: id },
    });

    if (!errorLog) {
      throw new NotFoundException(`ErrorLog with ID ${id} not found`);
    }

    if (!errorLog.isDeleted) {
      throw new NotFoundException(`ErrorLog with ID ${id} is not deleted`);
    }

    const restoredErrorLog = await this.prisma.cramschoolErrorLog.update({
      where: { errorLogId: id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
      include: {
        student: true,
        question: {
          include: {
            subject: true,
          },
        },
      },
    });

    return this.toErrorLogDto(restoredErrorLog);
  }

  async importToQuestionBank(id: number, userId: number): Promise<any> {
    const errorLog = await this.prisma.cramschoolErrorLog.findUnique({
      where: { errorLogId: id },
      include: {
        question: true,
        student: true,
      },
    });

    if (!errorLog) {
      throw new NotFoundException(`ErrorLog with ID ${id} not found`);
    }

    // 檢查是否已經匯入過
    const existing = await this.prisma.cramschoolQuestionBank.findFirst({
      where: {
        importedFromErrorLogId: id,
      },
    });

    if (existing) {
      return existing;
    }

    // 複製題目
    const question = errorLog.question;
    const newQuestion = await this.prisma.cramschoolQuestionBank.create({
      data: {
        subjectId: question.subjectId,
        level: question.level,
        chapter: question.chapter,
        content: question.content as Prisma.InputJsonValue,
        imagePath: question.imagePath,
        correctAnswer: question.correctAnswer as Prisma.InputJsonValue,
        difficulty: question.difficulty,
        questionNumber: question.questionNumber,
        origin: question.origin,
        originDetail: question.originDetail,
        solutionContent: question.solutionContent as Prisma.InputJsonValue,
        source: 'imported_from_error_log',
        createdById: userId,
        importedFromErrorLogId: id,
        importedStudentId: errorLog.studentId,
      },
    });

    return newQuestion;
  }

  async uploadImages(errorLogId: number, files: Express.Multer.File[]): Promise<any[]> {
    const errorLog = await this.prisma.cramschoolErrorLog.findUnique({
      where: { errorLogId },
    });

    if (!errorLog) {
      throw new NotFoundException(`ErrorLog with ID ${errorLogId} not found`);
    }

    // 獲取當前最大 sort_order
    const maxSortOrder = await this.prisma.cramschoolErrorLogImage.aggregate({
      where: { errorLogId },
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
      const relativePath = `error_log_images/${dateFolder}/${uniqueFilename}`;

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
      const image = await this.prisma.cramschoolErrorLogImage.create({
        data: {
          errorLogId,
          imagePath: relativePath,
          sortOrder: currentMax + idx + 1,
        },
      });

      created.push({
        image_id: image.imageId,
        error_log_id: image.errorLogId,
        image_path: image.imagePath,
        image_url: imageUrl,
        caption: image.caption || null,
        sort_order: image.sortOrder,
        created_at: image.createdAt?.toISOString(),
      });
    }

    return created;
  }

  async reorderImages(errorLogId: number, imageIds: number[]): Promise<{ success: boolean }> {
    const errorLog = await this.prisma.cramschoolErrorLog.findUnique({
      where: { errorLogId },
    });

    if (!errorLog) {
      throw new NotFoundException(`ErrorLog with ID ${errorLogId} not found`);
    }

    // 驗證所有圖片都屬於此錯題記錄
    const images = await this.prisma.cramschoolErrorLogImage.findMany({
      where: {
        errorLogId,
        imageId: { in: imageIds },
      },
    });

    if (images.length !== imageIds.length) {
      throw new BadRequestException('image_ids 包含不屬於此錯題的圖片');
    }

    // 更新排序
    const updates = imageIds.map((imageId, index) =>
      this.prisma.cramschoolErrorLogImage.update({
        where: { imageId },
        data: { sortOrder: index + 1 },
      }),
    );

    await Promise.all(updates);

    return { success: true };
  }

  private toErrorLogDto(errorLog: any): ErrorLog {
    return {
      error_log_id: errorLog.errorLogId,
      student_id: errorLog.studentId,
      question_id: errorLog.questionId,
      error_count: errorLog.errorCount,
      review_status: errorLog.reviewStatus,
      is_deleted: errorLog.isDeleted,
      deleted_at: errorLog.deletedAt?.toISOString() || null,
    };
  }
}
