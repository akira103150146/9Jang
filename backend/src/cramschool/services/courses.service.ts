import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCourseDto, UpdateCourseDto, Course } from '@9jang/shared';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async getCourses(page: number = 1, pageSize: number = 10, userId?: number, userRole?: string) {
    // #region agent log
    const fs = require('fs');
    const logEntry1 = JSON.stringify({location:'courses.service.ts:getCourses:entry',message:'getCourses service called',data:{page,pageSize,userId,userRole},timestamp:Date.now(),sessionId:'debug-session',runId:'verification',hypothesisId:'F,G'}) + '\n';
    fs.appendFileSync('/home/akira/github/9Jang/.cursor/debug.log', logEntry1);
    // #endregion

    const skip = (page - 1) * pageSize;

    // 如果是學生角色,需要找到對應的 studentId
    let studentId: number | undefined;
    if (userRole === 'STUDENT' && userId) {
      const studentProfile = await this.prisma.cramschoolStudent.findFirst({
        where: { userId },
      });
      studentId = studentProfile?.studentId;
      // #region agent log
      const logEntry2 = JSON.stringify({location:'courses.service.ts:getCourses:studentLookup',message:'Student profile lookup',data:{userId,studentId,found:!!studentProfile},timestamp:Date.now(),sessionId:'debug-session',runId:'verification',hypothesisId:'F,G'}) + '\n';
      fs.appendFileSync('/home/akira/github/9Jang/.cursor/debug.log', logEntry2);
      // #endregion
    }

    // 構建查詢條件:學生只能看到自己報名的課程
    const whereCondition = userRole === 'STUDENT' && studentId
      ? {
          enrollments: {
            some: {
              studentId: studentId,
              isDeleted: false,
            },
          },
        }
      : {};

    // #region agent log
    const logEntry2_5 = JSON.stringify({location:'courses.service.ts:getCourses:whereCondition',message:'Query where condition',data:{userRole,studentId,whereCondition},timestamp:Date.now(),sessionId:'debug-session',runId:'verification',hypothesisId:'F,G'}) + '\n';
    fs.appendFileSync('/home/akira/github/9Jang/.cursor/debug.log', logEntry2_5);
    // #endregion

    const [results, count] = await Promise.all([
      this.prisma.cramschoolCourse.findMany({
        where: whereCondition,
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
      this.prisma.cramschoolCourse.count(userRole === 'STUDENT' && studentId ? { where: whereCondition } : {}),
    ]);

    // #region agent log
    const logEntry3 = JSON.stringify({location:'courses.service.ts:getCourses:afterQuery',message:'Courses fetched from DB',data:{totalCourses:results.length,totalCount:count,userRole,studentId},timestamp:Date.now(),sessionId:'debug-session',runId:'verification',hypothesisId:'F,G'}) + '\n';
    fs.appendFileSync('/home/akira/github/9Jang/.cursor/debug.log', logEntry3);
    // #endregion

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
        enrollments: {
          where: { isDeleted: false },
          include: {
            student: true,
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

  private toCourseDto(course: any): Course & { enrollments_count?: number } {
    // 計算報名人數（排除已刪除的報名）
    const enrollmentsCount = course.enrollments 
      ? course.enrollments.filter((e: any) => !e.isDeleted).length 
      : 0;

    const result: any = {
      course_id: course.courseId,
      course_name: course.courseName,
      teacher_id: course.teacherId,
      start_time: course.startTime,
      end_time: course.endTime,
      day_of_week: course.dayOfWeek as 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun',
      fee_per_session: Number(course.feePerSession),
      status: course.status as 'Active' | 'Pending' | 'Closed',
      enrollments_count: enrollmentsCount,
    };
    return result as Course;
  }

  async getStudentStatus(id: number): Promise<any> {
    const course = await this.prisma.cramschoolCourse.findUnique({
      where: { courseId: id },
      include: {
        enrollments: {
          where: { isDeleted: false },
          include: {
            student: true,
            periods: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // 獲取今天該課程的請假記錄
    const todayLeaves = await this.prisma.cramschoolLeave.findMany({
      where: {
        courseId: id,
        leaveDate: today,
        isDeleted: false,
      },
      select: { studentId: true },
    });
    const todayLeaveStudentIds = new Set(todayLeaves.map((l) => l.studentId));

    let presentCount = 0;
    let leaveCount = 0;
    let inactiveCount = 0;

    // 遍歷每個報名記錄
    for (const enrollment of course.enrollments) {
      const studentId = enrollment.studentId;

      // 檢查該學生的報名期間是否包含今天
      let hasActivePeriod = false;
      for (const period of enrollment.periods) {
        const startDate = period.startDate.toISOString().split('T')[0];
        const endDate = period.endDate
          ? period.endDate.toISOString().split('T')[0]
          : null;

        if (startDate <= todayStr && (!endDate || endDate >= todayStr)) {
          hasActivePeriod = true;
          break;
        }
      }

      // 如果沒有活躍的期間，算作暫停
      if (!hasActivePeriod) {
        inactiveCount++;
        continue;
      }

      // 如果有活躍期間，檢查今天是否有請假記錄
      if (todayLeaveStudentIds.has(studentId)) {
        leaveCount++;
      } else {
        presentCount++;
      }
    }

    return {
      course_id: course.courseId,
      course_name: course.courseName,
      total_students: course.enrollments.length,
      present_count: presentCount,
      leave_count: leaveCount,
      inactive_count: inactiveCount,
    };
  }

  async getResources(id: number, userId: number, userRole: string): Promise<any> {
    const course = await this.prisma.cramschoolCourse.findUnique({
      where: { courseId: id },
      include: {
        teacher: true,
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    // 權限檢查
    if (userRole === 'TEACHER') {
      const teacher = await this.prisma.cramschoolTeacher.findFirst({
        where: { userId },
      });

      if (!teacher || course.teacherId !== teacher.teacherId) {
        throw new NotFoundException('您沒有權限查看此課程的資源');
      }
    } else if (userRole !== 'ADMIN') {
      throw new NotFoundException('您沒有權限查看課程資源');
    }

    // 獲取課程綁定的所有教學資源
    const resources = await this.prisma.cramschoolLearningResource.findMany({
      where: {
        courses: {
          some: {
            courseId: id,
          },
        },
      },
      include: {
        courses: true,
      },
    });

    // 轉換資源數據
    return resources.map((r) => ({
      resource_id: r.resourceId,
      title: r.title,
      mode: r.mode,
      course_ids: r.courses?.map((c: any) => c.courseId) || [],
      created_by: r.createdById || null,
      created_at: r.createdAt?.toISOString() || null,
      updated_at: r.updatedAt?.toISOString() || null,
    }));
  }
}
