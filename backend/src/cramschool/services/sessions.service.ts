import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateSessionDto,
  UpdateSessionDto,
  Session,
} from '@9jang/shared';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async getSessions(page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;

    const [results, count] = await Promise.all([
      this.prisma.cramschoolSessionRecord.findMany({
        skip,
        take: pageSize,
        include: {
          course: true,
        },
        orderBy: { sessionDate: 'desc' },
      }),
      this.prisma.cramschoolSessionRecord.count(),
    ]);

    return createPaginatedResponse(
      results.map((s) => this.toSessionDto(s)),
      count,
      page,
      pageSize,
    );
  }

  async getSession(id: number): Promise<Session> {
    const session = await this.prisma.cramschoolSessionRecord.findUnique({
      where: { sessionId: id },
      include: {
        course: true,
      },
    });

    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    return this.toSessionDto(session);
  }

  async createSession(createDto: CreateSessionDto): Promise<Session> {
    const session = await this.prisma.cramschoolSessionRecord.create({
      data: {
        courseId: createDto.course_id,
        sessionDate: new Date(createDto.session_date),
      },
      include: {
        course: true,
      },
    });

    return this.toSessionDto(session);
  }

  async updateSession(id: number, updateDto: UpdateSessionDto): Promise<Session> {
    const session = await this.prisma.cramschoolSessionRecord.findUnique({
      where: { sessionId: id },
    });

    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    const updatedSession = await this.prisma.cramschoolSessionRecord.update({
      where: { sessionId: id },
      data: {
        courseId: updateDto.course_id,
        sessionDate: updateDto.session_date ? new Date(updateDto.session_date) : undefined,
      },
      include: {
        course: true,
      },
    });

    return this.toSessionDto(updatedSession);
  }

  async deleteSession(id: number): Promise<void> {
    const session = await this.prisma.cramschoolSessionRecord.findUnique({
      where: { sessionId: id },
    });

    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    await this.prisma.cramschoolSessionRecord.delete({
      where: { sessionId: id },
    });
  }

  private toSessionDto(session: any): Session & { course_name?: string } {
    const result: any = {
      session_id: session.sessionId,
      course_id: session.courseId,
      session_date: session.sessionDate.toISOString().split('T')[0],
      course_name: session.course?.courseName || undefined,
    };

    return result as Session;
  }
}
