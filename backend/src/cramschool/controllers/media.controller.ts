import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../account/guards/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs/promises';

@Controller('cramschool')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private prisma: PrismaService) {}

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('沒有提供圖片文件');
    }

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
    const relativePath = `question_images/${dateFolder}/${uniqueFilename}`;

    // 保存文件（簡化版本，實際應該使用 Cloud Storage 或配置的存儲）
    const mediaRoot = process.env.MEDIA_ROOT || './media';
    const fullPath = path.join(mediaRoot, relativePath);
    const dir = path.dirname(fullPath);

    try {
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(fullPath, file.buffer);

      // 構建 URL
      const mediaUrl = process.env.MEDIA_URL || '/media/';
      const imageUrl = mediaUrl.startsWith('http')
        ? `${mediaUrl}${relativePath}`
        : `${process.env.BASE_URL || 'http://localhost:3000'}${mediaUrl}${relativePath}`;

      return {
        image_path: relativePath,
        image_url: imageUrl,
      };
    } catch (error) {
      throw new BadRequestException(`保存文件失敗：${error.message}`);
    }
  }

  @Post('generate-resource')
  async generateResource(@Body() body: any) {
    const {
      mode = 'HANDOUT',
      title = '自動生成的資源',
      subject_id,
      level,
      chapter,
      difficulty,
      tag_ids = [],
      source,
      course_id,
      is_individualized = false,
      student_group_ids = [],
      template_id,
    } = body;

    // 構建查詢條件
    const where: any = {};

    if (subject_id) {
      where.subjectId = subject_id;
    }
    if (level) {
      where.level = level;
    }
    if (chapter) {
      where.chapter = { contains: chapter, mode: 'insensitive' };
    }
    if (difficulty) {
      where.difficulty = parseInt(difficulty);
    }
    if (tag_ids && tag_ids.length > 0) {
      const questionsWithTags = await this.prisma.cramschoolQuestionTag.findMany({
        where: { tagId: { in: tag_ids } },
        select: { questionId: true },
        distinct: ['questionId'],
      });
      where.questionId = { in: questionsWithTags.map((q) => q.questionId) };
    }
    if (source) {
      where.source = source;
    }

    // 根據模式決定題目數量限制
    const limit = mode === 'ONLINE_QUIZ' ? 50 : 100;

    const questions = await this.prisma.cramschoolQuestionBank.findMany({
      where,
      take: limit,
      include: {
        subject: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: { questionId: 'asc' },
    });

    // 生成結構化資料
    const questionData = questions.map((q) => ({
      question_id: q.questionId,
      subject: q.subject?.name || null,
      level: q.level,
      chapter: q.chapter,
      content: q.content,
      correct_answer: q.correctAnswer,
      difficulty: q.difficulty,
      question_type: q.questionType,
      options: q.options,
      tags: q.tags?.map((t) => t.tag.tagName) || [],
    }));

    // 構建結構
    const structure: any[] = [];
    let idCounter = 1;

    // 如果有選擇 Template，先插入 Template 區塊
    if (template_id) {
      structure.push({
        id: idCounter,
        type: 'template',
        template_id: template_id,
      });
      idCounter++;
    }

    // 添加題目區塊
    for (const question of questionData) {
      structure.push({
        id: idCounter,
        type: 'question',
        question_id: question.question_id,
      });
      idCounter++;
    }

    const responseData: any = {
      title,
      mode,
      course_id: course_id || null,
      questions: questionData,
      structure,
      total_count: questionData.length,
    };

    // 根據模式添加特定參數
    if (mode === 'ONLINE_QUIZ') {
      responseData.is_individualized = is_individualized;
      responseData.student_group_ids = student_group_ids;
    }

    return responseData;
  }
}
