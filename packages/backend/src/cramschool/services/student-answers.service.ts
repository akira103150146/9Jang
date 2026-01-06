import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateStudentAnswerDto,
  UpdateStudentAnswerDto,
  StudentAnswer,
} from '@9jang/shared';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class StudentAnswersService {
  constructor(private prisma: PrismaService) {}

  async getStudentAnswers(includeDeleted: boolean = false, page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;
    const where: any = {};
    if (!includeDeleted) {
      where.isDeleted = false;
    }

    const [results, count] = await Promise.all([
      this.prisma.cramschoolStudentAnswer.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          student: true,
          question: true,
        },
        orderBy: { answerId: 'desc' },
      }),
      this.prisma.cramschoolStudentAnswer.count({ where }),
    ]);

    return createPaginatedResponse(
      results.map((a) => this.toStudentAnswerDto(a)),
      count,
      page,
      pageSize,
    );
  }

  async getStudentAnswer(id: number): Promise<StudentAnswer> {
    const answer = await this.prisma.cramschoolStudentAnswer.findUnique({
      where: { answerId: id },
      include: {
        student: true,
        question: true,
      },
    });

    if (!answer) {
      throw new NotFoundException(`StudentAnswer with ID ${id} not found`);
    }

    return this.toStudentAnswerDto(answer);
  }

  async createStudentAnswer(createDto: CreateStudentAnswerDto): Promise<StudentAnswer> {
    const answer = await this.prisma.cramschoolStudentAnswer.create({
      data: {
        studentId: createDto.student_id,
        questionId: createDto.question_id,
        testName: createDto.test_name,
        submissionId: createDto.submission_id || null,
        isCorrect: createDto.is_correct || false,
        scannedFilePath: createDto.scanned_file_path || null,
      },
      include: {
        student: true,
        question: true,
      },
    });

    return this.toStudentAnswerDto(answer);
  }

  async updateStudentAnswer(id: number, updateDto: UpdateStudentAnswerDto): Promise<StudentAnswer> {
    const answer = await this.prisma.cramschoolStudentAnswer.findUnique({
      where: { answerId: id },
    });

    if (!answer) {
      throw new NotFoundException(`StudentAnswer with ID ${id} not found`);
    }

    const updatedAnswer = await this.prisma.cramschoolStudentAnswer.update({
      where: { answerId: id },
      data: {
        studentId: updateDto.student_id,
        questionId: updateDto.question_id,
        testName: updateDto.test_name,
        submissionId: updateDto.submission_id !== undefined ? updateDto.submission_id : undefined,
        isCorrect: updateDto.is_correct,
        scannedFilePath: updateDto.scanned_file_path !== undefined ? updateDto.scanned_file_path : undefined,
      },
      include: {
        student: true,
        question: true,
      },
    });

    return this.toStudentAnswerDto(updatedAnswer);
  }

  async deleteStudentAnswer(id: number): Promise<void> {
    const answer = await this.prisma.cramschoolStudentAnswer.findUnique({
      where: { answerId: id },
    });

    if (!answer) {
      throw new NotFoundException(`StudentAnswer with ID ${id} not found`);
    }

    // 軟刪除
    await this.prisma.cramschoolStudentAnswer.update({
      where: { answerId: id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async restoreStudentAnswer(id: number): Promise<StudentAnswer> {
    const answer = await this.prisma.cramschoolStudentAnswer.findUnique({
      where: { answerId: id },
    });

    if (!answer) {
      throw new NotFoundException(`StudentAnswer with ID ${id} not found`);
    }

    if (!answer.isDeleted) {
      throw new NotFoundException(`StudentAnswer with ID ${id} is not deleted`);
    }

    const restoredAnswer = await this.prisma.cramschoolStudentAnswer.update({
      where: { answerId: id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
      include: {
        student: true,
        question: true,
      },
    });

    return this.toStudentAnswerDto(restoredAnswer);
  }

  private toStudentAnswerDto(answer: any): StudentAnswer {
    return {
      answer_id: answer.answerId,
      student_id: answer.studentId,
      question_id: answer.questionId,
      test_name: answer.testName,
      submission_id: answer.submissionId || null,
      is_correct: answer.isCorrect,
      scanned_file_path: answer.scannedFilePath || null,
      is_deleted: answer.isDeleted,
      deleted_at: answer.deletedAt?.toISOString() || null,
    };
  }
}
