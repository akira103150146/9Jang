import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCourseDto, UpdateCourseDto, Course } from '@9jang/shared';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async getCourses(page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;
    const [results, count] = await Promise.all([
      this.prisma.cramschoolCourse.findMany({
        skip,
        take: pageSize,
        include: {
          teacher: {
            include: {
              user: true,
            },
          },
          enrollments: {
            where: { isDeleted: false },
            include: {
              student: true,
            },
          },
        },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      }),
      this.prisma.cramschoolCourse.count(),
    ]);

    return createPaginatedResponse(
      results.map((c) => this.toCourseDto(c)),
      count,
      page,
      pageSize,
    );
  }

  async getCourse(id: number): Promise<Course> {
    const course = await this.prisma.cramschoolCourse.findUnique({
      where: { courseId: id },
      include: {
        teacher: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return this.toCourseDto(course);
  }

  async createCourse(createDto: CreateCourseDto): Promise<Course> {
    const course = await this.prisma.cramschoolCourse.create({
      data: {
        courseName: createDto.course_name,
        teacherId: createDto.teacher_id,
        startTime: createDto.start_time,
        endTime: createDto.end_time,
        dayOfWeek: createDto.day_of_week,
        feePerSession: createDto.fee_per_session,
        status: createDto.status || 'Active',
      },
    });

    return this.getCourse(course.courseId);
  }

  async updateCourse(id: number, updateDto: UpdateCourseDto): Promise<Course> {
    const course = await this.prisma.cramschoolCourse.findUnique({
      where: { courseId: id },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    await this.prisma.cramschoolCourse.update({
      where: { courseId: id },
      data: {
        courseName: updateDto.course_name,
        teacherId: updateDto.teacher_id,
        startTime: updateDto.start_time,
        endTime: updateDto.end_time,
        dayOfWeek: updateDto.day_of_week,
        feePerSession: updateDto.fee_per_session,
        status: updateDto.status,
      },
    });

    return this.getCourse(id);
  }

  async deleteCourse(id: number): Promise<void> {
    const course = await this.prisma.cramschoolCourse.findUnique({
      where: { courseId: id },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    await this.prisma.cramschoolCourse.delete({
      where: { courseId: id },
    });
  }

  private toCourseDto(course: any): Course {
    return {
      course_id: course.courseId,
      course_name: course.courseName,
      teacher_id: course.teacherId,
      start_time: course.startTime,
      end_time: course.endTime,
      day_of_week: course.dayOfWeek as 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun',
      fee_per_session: Number(course.feePerSession),
      status: course.status as 'Active' | 'Pending' | 'Closed',
    };
  }
}
