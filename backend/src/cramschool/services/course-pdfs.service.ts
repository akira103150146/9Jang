import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCoursePdfDto, UpdateCoursePdfDto, CoursePdf } from '@9jang/shared';
import * as path from 'path';
import * as fs from 'fs/promises';
import { createReadStream } from 'fs';

@Injectable()
export class CoursePdfsService {
  constructor(private prisma: PrismaService) {}

  /**
   * 老師上傳 PDF
   */
  async uploadPdf(
    file: Express.Multer.File,
    createDto: CreateCoursePdfDto,
    userId: number,
    userRole: string,
  ): Promise<CoursePdf> {
    // 權限檢查: 只有老師可以上傳
    if (userRole !== 'TEACHER' && userRole !== 'ADMIN') {
      throw new ForbiddenException('只有老師可以上傳 PDF 講義');
    }

    // 驗證課程是否屬於該老師
    const teacher = await this.prisma.cramschoolTeacher.findFirst({
      where: { userId },
    });

    if (!teacher && userRole !== 'ADMIN') {
      throw new ForbiddenException('找不到教師資料');
    }

    const course = await this.prisma.cramschoolCourse.findUnique({
      where: { courseId: createDto.course_id },
    });

    if (!course) {
      throw new NotFoundException(`課程 ID ${createDto.course_id} 不存在`);
    }

    if (userRole === 'TEACHER' && teacher && course.teacherId !== teacher.teacherId) {
      throw new ForbiddenException('只能在自己的課程下上傳 PDF');
    }

    // 保存 PDF 檔案
    const mediaRoot = process.env.MEDIA_ROOT || './media';
    const timestamp = Date.now();
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const relativePath = `course_pdfs/${createDto.course_id}/${timestamp}_${sanitizedFilename}`;
    const fullPath = path.join(mediaRoot, relativePath);
    const dir = path.dirname(fullPath);

    try {
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(fullPath, file.buffer);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`保存文件失敗: ${errorMessage}`);
    }

    // 建立資料庫記錄
    try {
      const pdf = await this.prisma.cramschoolCoursePdf.create({
        data: {
          title: createDto.title,
          description: createDto.description || null,
          filePath: relativePath,
          fileSize: file.size,
          courseId: createDto.course_id,
          uploadedById: userId,
          allowDownload: createDto.allow_download ?? false,
          isVisibleToAll: createDto.is_visible_to_all ?? false,
          isActive: createDto.is_active ?? true,
        },
      });

      // 處理學生群組關聯
      if (!createDto.is_visible_to_all && createDto.student_group_ids && createDto.student_group_ids.length > 0) {
        await Promise.all(
          createDto.student_group_ids.map((groupId) =>
            this.prisma.cramschoolCoursePdfStudentGroup.create({
              data: {
                pdfId: pdf.pdfId,
                groupId,
              },
            }),
          ),
        );
      }

      return this.getPdf(pdf.pdfId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 學生取得課程的 PDF 列表
   */
  async getPdfsForStudent(courseId: number, userId: number): Promise<CoursePdf[]> {
    // 確認學生有報名該課程
    const student = await this.prisma.cramschoolStudent.findFirst({
      where: { userId },
    });

    if (!student) {
      throw new NotFoundException('找不到學生資料');
    }

    const enrollment = await this.prisma.cramschoolStudentEnrollment.findFirst({
      where: {
        studentId: student.studentId,
        courseId: courseId,
        isActive: true,
        isDeleted: false,
      },
    });

    if (!enrollment) {
      throw new ForbiddenException('您未報名此課程');
    }

    // 取得學生所屬的群組
    const studentGroups = await this.prisma.cramschoolStudentGroupStudent.findMany({
      where: { studentId: student.studentId },
      select: { groupId: true },
    });

    const groupIds = studentGroups.map((g) => g.groupId);

    // 取得該課程的 PDF, 並過濾可見的
    const pdfs = await this.prisma.cramschoolCoursePdf.findMany({
      where: {
        courseId: courseId,
        isActive: true,
        OR: [
          // 沒有設定群組限制 (所有學生可見)
          { isVisibleToAll: true },
          // 或者學生在允許的群組中
          {
            isVisibleToAll: false,
            studentGroups: { some: { groupId: { in: groupIds } } },
          },
        ],
      },
      include: {
        studentGroups: {
          include: {
            group: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return pdfs.map((pdf) => this.toPdfDto(pdf));
  }

  /**
   * 老師取得課程的所有 PDF
   */
  async getPdfsForTeacher(courseId: number, userId: number, userRole: string): Promise<CoursePdf[]> {
    if (userRole === 'ADMIN') {
      // 管理員可以看所有課程的 PDF
      try {
        const pdfs = await this.prisma.cramschoolCoursePdf.findMany({
          where: { courseId },
          include: {
            studentGroups: {
              include: {
                group: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        return pdfs.map((pdf) => this.toPdfDto(pdf));
      } catch (error) {
        throw error;
      }
    }

    const teacher = await this.prisma.cramschoolTeacher.findFirst({
      where: { userId },
    });

    if (!teacher) {
      throw new ForbiddenException('找不到教師資料');
    }

    const course = await this.prisma.cramschoolCourse.findUnique({
      where: { courseId },
    });

    if (!course || course.teacherId !== teacher.teacherId) {
      throw new ForbiddenException('只能查看自己課程的 PDF');
    }

    const pdfs = await this.prisma.cramschoolCoursePdf.findMany({
      where: { courseId },
      include: {
        studentGroups: {
          include: {
            group: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return pdfs.map((pdf) => this.toPdfDto(pdf));
  }

  /**
   * 檢視 PDF (返回檔案流)
   */
  async viewPdf(pdfId: number, userId: number, userRole: string): Promise<{ stream: any; filename: string }> {
    const pdf = await this.prisma.cramschoolCoursePdf.findUnique({
      where: { pdfId },
      include: {
        course: true,
        studentGroups: true,
      },
    });

    if (!pdf || !pdf.isActive) {
      throw new NotFoundException('PDF 不存在或已被刪除');
    }

    // 權限檢查
    await this.checkViewPermission(pdf, userId, userRole);

    // 返回檔案流
    const mediaRoot = process.env.MEDIA_ROOT || './media';
    const fullPath = path.join(mediaRoot, pdf.filePath);

    try {
      await fs.access(fullPath);
      const stream = createReadStream(fullPath);
      const filename = path.basename(pdf.filePath);
      return { stream, filename };
    } catch (error) {
      throw new NotFoundException('PDF 檔案不存在');
    }
  }

  /**
   * 下載 PDF (返回檔案流)
   */
  async downloadPdf(pdfId: number, userId: number, userRole: string): Promise<{ stream: any; filename: string }> {
    const pdf = await this.prisma.cramschoolCoursePdf.findUnique({
      where: { pdfId },
      include: {
        course: true,
        studentGroups: true,
      },
    });

    if (!pdf || !pdf.isActive) {
      throw new NotFoundException('PDF 不存在或已被刪除');
    }

    // 檢查下載權限
    if (!pdf.allowDownload) {
      throw new ForbiddenException('此 PDF 不允許下載');
    }

    // 權限檢查
    await this.checkViewPermission(pdf, userId, userRole);

    // 返回檔案流
    const mediaRoot = process.env.MEDIA_ROOT || './media';
    const fullPath = path.join(mediaRoot, pdf.filePath);

    try {
      await fs.access(fullPath);
      const stream = createReadStream(fullPath);
      const filename = path.basename(pdf.filePath);
      return { stream, filename };
    } catch (error) {
      throw new NotFoundException('PDF 檔案不存在');
    }
  }

  /**
   * 刪除 PDF
   */
  async deletePdf(pdfId: number, userId: number, userRole: string): Promise<void> {
    const pdf = await this.prisma.cramschoolCoursePdf.findUnique({
      where: { pdfId },
      include: {
        course: true,
      },
    });

    if (!pdf) {
      throw new NotFoundException('PDF 不存在');
    }

    // 權限檢查: 只有老師可以刪除自己課程的 PDF
    if (userRole === 'ADMIN') {
      // 管理員可以刪除任何 PDF
    } else if (userRole === 'TEACHER') {
      const teacher = await this.prisma.cramschoolTeacher.findFirst({
        where: { userId },
      });

      if (!teacher || pdf.course.teacherId !== teacher.teacherId) {
        throw new ForbiddenException('只能刪除自己課程的 PDF');
      }
    } else {
      throw new ForbiddenException('沒有權限刪除 PDF');
    }

    // 軟刪除 (設為 isActive = false)
    await this.prisma.cramschoolCoursePdf.update({
      where: { pdfId },
      data: { isActive: false },
    });

    // 可選: 硬刪除檔案
    // const mediaRoot = process.env.MEDIA_ROOT || './media';
    // const fullPath = path.join(mediaRoot, pdf.filePath);
    // try {
    //   await fs.unlink(fullPath);
    // } catch (error) {
    //   // 忽略檔案不存在的錯誤
    // }
  }

  /**
   * 切換下載權限
   */
  async toggleDownload(
    pdfId: number,
    allowDownload: boolean,
    userId: number,
    userRole: string,
  ): Promise<CoursePdf> {
    const pdf = await this.prisma.cramschoolCoursePdf.findUnique({
      where: { pdfId },
      include: {
        course: true,
      },
    });

    if (!pdf) {
      throw new NotFoundException('PDF 不存在');
    }

    // 權限檢查: 只有老師可以切換自己課程的 PDF 下載權限
    if (userRole === 'ADMIN') {
      // 管理員可以切換任何 PDF
    } else if (userRole === 'TEACHER') {
      const teacher = await this.prisma.cramschoolTeacher.findFirst({
        where: { userId },
      });

      if (!teacher || pdf.course.teacherId !== teacher.teacherId) {
        throw new ForbiddenException('只能修改自己課程的 PDF 設定');
      }
    } else {
      throw new ForbiddenException('沒有權限修改 PDF 設定');
    }

    await this.prisma.cramschoolCoursePdf.update({
      where: { pdfId },
      data: { allowDownload },
    });

    return this.getPdf(pdfId);
  }

  /**
   * 更新 PDF 資訊 (標題、描述、群組設定)
   */
  async updatePdf(
    pdfId: number,
    updateDto: UpdateCoursePdfDto,
    userId: number,
    userRole: string,
  ): Promise<CoursePdf> {
    const pdf = await this.prisma.cramschoolCoursePdf.findUnique({
      where: { pdfId },
      include: {
        course: true,
      },
    });

    if (!pdf) {
      throw new NotFoundException('PDF 不存在');
    }

    // 權限檢查
    if (userRole === 'ADMIN') {
      // 管理員可以更新任何 PDF
    } else if (userRole === 'TEACHER') {
      const teacher = await this.prisma.cramschoolTeacher.findFirst({
        where: { userId },
      });

      if (!teacher || pdf.course.teacherId !== teacher.teacherId) {
        throw new ForbiddenException('只能修改自己課程的 PDF');
      }
    } else {
      throw new ForbiddenException('沒有權限修改 PDF');
    }

    // 更新基本資訊
    await this.prisma.cramschoolCoursePdf.update({
      where: { pdfId },
      data: {
        title: updateDto.title,
        description: updateDto.description,
        allowDownload: updateDto.allow_download,
        isVisibleToAll: updateDto.is_visible_to_all,
        isActive: updateDto.is_active,
      },
    });

    // 更新學生群組關聯
    if (updateDto.student_group_ids !== undefined) {
      // 刪除現有關聯
      await this.prisma.cramschoolCoursePdfStudentGroup.deleteMany({
        where: { pdfId },
      });

      // 創建新關聯
      if (!updateDto.is_visible_to_all && updateDto.student_group_ids.length > 0) {
        await Promise.all(
          updateDto.student_group_ids.map((groupId) =>
            this.prisma.cramschoolCoursePdfStudentGroup.create({
              data: {
                pdfId,
                groupId,
              },
            }),
          ),
        );
      }
    }

    return this.getPdf(pdfId);
  }

  /**
   * 取得單一 PDF
   */
  private async getPdf(id: number): Promise<CoursePdf> {
    const pdf = await this.prisma.cramschoolCoursePdf.findUnique({
      where: { pdfId: id },
      include: {
        studentGroups: {
          include: {
            group: true,
          },
        },
      },
    });

    if (!pdf) {
      throw new NotFoundException(`PDF with ID ${id} not found`);
    }

    return this.toPdfDto(pdf);
  }

  /**
   * 檢查檢視權限
   */
  private async checkViewPermission(pdf: any, userId: number, userRole: string): Promise<void> {
    if (userRole === 'ADMIN') {
      // 管理員可以查看所有 PDF
      return;
    }

    if (userRole === 'TEACHER') {
      const teacher = await this.prisma.cramschoolTeacher.findFirst({
        where: { userId },
      });

      if (!teacher) {
        throw new ForbiddenException('找不到教師資料');
      }

      if (pdf.course.teacherId === teacher.teacherId) {
        // 老師可以查看自己課程的 PDF
        return;
      }

      // 如果不是自己的課程，拋出錯誤
      throw new ForbiddenException('只能查看自己課程的 PDF');
    }

    if (userRole === 'STUDENT') {
      const student = await this.prisma.cramschoolStudent.findFirst({
        where: { userId },
      });

      if (!student) {
        throw new ForbiddenException('找不到學生資料');
      }

      // 檢查是否有報名該課程
      const enrollment = await this.prisma.cramschoolStudentEnrollment.findFirst({
        where: {
          studentId: student.studentId,
          courseId: pdf.courseId,
          isActive: true,
          isDeleted: false,
        },
      });

      if (!enrollment) {
        throw new ForbiddenException('您未報名此課程');
      }

      // 檢查可見性
      if (pdf.isVisibleToAll) {
        // 所有報名學生可見
        return;
      }

      // 檢查是否在允許的群組中
      const studentGroups = await this.prisma.cramschoolStudentGroupStudent.findMany({
        where: { studentId: student.studentId },
        select: { groupId: true },
      });

      const groupIds = studentGroups.map((g) => g.groupId);
      const pdfGroupIds = pdf.studentGroups.map((g: any) => g.groupId);

      const hasPermission = pdfGroupIds.some((gid: number) => groupIds.includes(gid));

      if (hasPermission) {
        return;
      }

      throw new ForbiddenException('沒有權限查看此 PDF');
    }

    throw new ForbiddenException('沒有權限查看此 PDF');
  }

  /**
   * 轉換為 DTO
   */
  private toPdfDto(pdf: any): CoursePdf {
    return {
      pdf_id: pdf.pdfId,
      title: pdf.title,
      description: pdf.description,
      file_path: pdf.filePath,
      file_size: pdf.fileSize,
      course_id: pdf.courseId,
      uploaded_by_id: pdf.uploadedById,
      student_group_ids: pdf.studentGroups?.map((g: any) => g.group.groupId) || [],
      allow_download: pdf.allowDownload,
      is_visible_to_all: pdf.isVisibleToAll,
      is_active: pdf.isActive,
      created_at: pdf.createdAt.toISOString(),
      updated_at: pdf.updatedAt.toISOString(),
    };
  }
}
