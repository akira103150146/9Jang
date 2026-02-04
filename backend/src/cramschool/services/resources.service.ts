import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateLearningResourceDto,
  UpdateLearningResourceDto,
  LearningResource,
} from '@9jang/shared';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class ResourcesService {
  constructor(private prisma: PrismaService) {}

  async getResources(
    userId: number,
    userRole: string,
    page: number = 1,
    pageSize: number = 10,
    courseId?: number,
    mode?: string,
  ) {
    const skip = (page - 1) * pageSize;
    const where: any = {};

    // 角色過濾
    if (userRole === 'ADMIN') {
      // 管理員可以查看所有資源
      if (courseId) {
        const resourcesInCourse = await this.prisma.cramschoolLearningResourceCourse.findMany({
          where: { courseId },
          select: { resourceId: true },
        });
        where.resourceId = { in: resourcesInCourse.map((r) => r.resourceId) };
      }
      if (mode) {
        where.mode = mode;
      }
    } else if (userRole === 'TEACHER') {
      // 老師：只能看到自己課程的資源
      const teacher = await this.prisma.cramschoolTeacher.findFirst({
        where: { userId },
      });

      if (!teacher) {
        return createPaginatedResponse([], 0, page, pageSize);
      }

      const teacherCourses = await this.prisma.cramschoolCourse.findMany({
        where: { teacherId: teacher.teacherId },
        select: { courseId: true },
      });

      const teacherCourseIds = teacherCourses.map((c) => c.courseId);
      const resourcesInCourses = await this.prisma.cramschoolLearningResourceCourse.findMany({
        where: { courseId: { in: teacherCourseIds } },
        select: { resourceId: true },
        distinct: ['resourceId'],
      });

      const resourceIds = resourcesInCourses.map((r) => r.resourceId);
      where.resourceId = { in: resourceIds };

      if (mode) {
        where.mode = mode;
      }
    } else if (userRole === 'STUDENT') {
      // 學生：只顯示可見的
      const student = await this.prisma.cramschoolStudent.findFirst({
        where: { userId },
      });

      if (!student) {
        return createPaginatedResponse([], 0, page, pageSize);
      }

      const now = new Date();

      // 時間過濾
      where.OR = [
        { availableFrom: { lte: now } },
        { availableFrom: null },
      ];
      where.AND = [
        {
          OR: [
            { availableUntil: { gte: now } },
            { availableUntil: null },
          ],
        },
      ];

      // 獲取學生報名的課程
      const enrollments = await this.prisma.cramschoolStudentEnrollment.findMany({
        where: {
          studentId: student.studentId,
          isActive: true,
          isDeleted: false,
        },
        select: { courseId: true },
      });

      const enrolledCourseIds = enrollments.map((e) => e.courseId);

      // 獲取學生群組
      const studentGroups = await this.prisma.cramschoolStudentGroupStudent.findMany({
        where: { studentId: student.studentId },
        select: { groupId: true },
      });

      const studentGroupIds = studentGroups.map((g) => g.groupId);

      // 獲取匹配的資源
      const [resourcesInCourses, resourcesInGroups] = await Promise.all([
        this.prisma.cramschoolLearningResourceCourse.findMany({
          where: { courseId: { in: enrolledCourseIds } },
          select: { resourceId: true },
          distinct: ['resourceId'],
        }),
        this.prisma.cramschoolLearningResourceStudentGroup.findMany({
          where: { groupId: { in: studentGroupIds } },
          select: { resourceId: true },
          distinct: ['resourceId'],
        }),
      ]);

      const resourceIds = [
        ...resourcesInCourses.map((r) => r.resourceId),
        ...resourcesInGroups.map((r) => r.resourceId),
      ];

      where.resourceId = { in: resourceIds };

      if (mode) {
        where.mode = mode;
      }
    } else {
      return createPaginatedResponse([], 0, page, pageSize);
    }

    const [results, count] = await Promise.all([
      this.prisma.cramschoolLearningResource.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          courses: {
            include: {
              course: true,
            },
          },
          studentGroups: {
            include: {
              group: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.cramschoolLearningResource.count({ where }),
    ]);

    return createPaginatedResponse(
      results.map((r) => this.toResourceDto(r)),
      count,
      page,
      pageSize,
    );
  }

  async getResource(id: number): Promise<LearningResource> {
    const resource = await this.prisma.cramschoolLearningResource.findUnique({
      where: { resourceId: id },
      include: {
        courses: {
          include: {
            course: true,
          },
        },
        studentGroups: {
          include: {
            group: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!resource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }

    return this.toResourceDto(resource);
  }

  async createResource(
    createDto: CreateLearningResourceDto,
    userId: number,
    userRole: string,
  ): Promise<LearningResource> {
    // 只有老師可以創建
    if (userRole !== 'TEACHER') {
      throw new ForbiddenException('只有老師可以創建教學資源');
    }

    // 驗證課程（如果指定了課程，必須都是自己的課程）
    if (createDto.course_ids && createDto.course_ids.length > 0) {
      const teacher = await this.prisma.cramschoolTeacher.findFirst({
        where: { userId },
      });

      if (teacher) {
        const teacherCourses = await this.prisma.cramschoolCourse.findMany({
          where: { teacherId: teacher.teacherId },
          select: { courseId: true },
        });

        const teacherCourseIds = teacherCourses.map((c) => c.courseId);
        const invalidCourses = createDto.course_ids.filter(
          (cid) => !teacherCourseIds.includes(cid),
        );

        if (invalidCourses.length > 0) {
          throw new ForbiddenException(
            `只能在自己課程下創建資源，無效的課程ID: ${invalidCourses.join(', ')}`,
          );
        }
      }
    }

    const resource = await this.prisma.cramschoolLearningResource.create({
      data: {
        title: createDto.title!,
        mode: createDto.mode || 'HANDOUT',
        structure: (createDto.structure || []) as any,
        tiptapStructure: (createDto.tiptap_structure || null) as any,
        settings: (createDto.settings || {}) as any,
        createdById: userId,
        isIndividualized: createDto.is_individualized || false,
        availableFrom: createDto.available_from ? new Date(createDto.available_from) : null,
        availableUntil: createDto.available_until ? new Date(createDto.available_until) : null,
      },
    });

    // 處理課程關聯
    if (createDto.course_ids && createDto.course_ids.length > 0) {
      await Promise.all(
        createDto.course_ids.map((courseId) =>
          this.prisma.cramschoolLearningResourceCourse.create({
            data: {
              resourceId: resource.resourceId,
              courseId,
            },
          }),
        ),
      );
    }

    // 處理學生群組關聯
    if (createDto.student_group_ids && createDto.student_group_ids.length > 0) {
      await Promise.all(
        createDto.student_group_ids.map((groupId) =>
          this.prisma.cramschoolLearningResourceStudentGroup.create({
            data: {
              resourceId: resource.resourceId,
              groupId,
            },
          }),
        ),
      );
    }

    // 處理標籤
    if (createDto.tag_ids && createDto.tag_ids.length > 0) {
      await Promise.all(
        createDto.tag_ids.map((tagId) =>
          this.prisma.cramschoolLearningResourceTag.create({
            data: {
              resourceId: resource.resourceId,
              tagId,
            },
          }),
        ),
      );
    }

    return this.getResource(resource.resourceId);
  }

  async updateResource(
    id: number,
    updateDto: UpdateLearningResourceDto,
    _userId: number,
    userRole: string,
  ): Promise<LearningResource> {
    // 只有老師可以更新
    if (userRole !== 'TEACHER') {
      throw new ForbiddenException('只有老師可以更新教學資源');
    }

    const resource = await this.prisma.cramschoolLearningResource.findUnique({
      where: { resourceId: id },
    });

    if (!resource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }

    await this.prisma.cramschoolLearningResource.update({
      where: { resourceId: id },
      data: {
        title: updateDto.title,
        mode: updateDto.mode,
        structure: updateDto.structure as any,
        tiptapStructure: updateDto.tiptap_structure as any,
        settings: updateDto.settings as any,
        isIndividualized: updateDto.is_individualized,
        availableFrom: updateDto.available_from ? new Date(updateDto.available_from) : undefined,
        availableUntil: updateDto.available_until ? new Date(updateDto.available_until) : undefined,
      },
    });

    // 更新課程關聯
    if (updateDto.course_ids !== undefined) {
      // 刪除現有關聯
      await this.prisma.cramschoolLearningResourceCourse.deleteMany({
        where: { resourceId: id },
      });

      // 創建新關聯
      if (updateDto.course_ids.length > 0) {
        await Promise.all(
          updateDto.course_ids.map((courseId) =>
            this.prisma.cramschoolLearningResourceCourse.create({
              data: {
                resourceId: id,
                courseId,
              },
            }),
          ),
        );
      }
    }

    // 更新學生群組關聯
    if (updateDto.student_group_ids !== undefined) {
      await this.prisma.cramschoolLearningResourceStudentGroup.deleteMany({
        where: { resourceId: id },
      });

      if (updateDto.student_group_ids.length > 0) {
        await Promise.all(
          updateDto.student_group_ids.map((groupId) =>
            this.prisma.cramschoolLearningResourceStudentGroup.create({
              data: {
                resourceId: id,
                groupId,
              },
            }),
          ),
        );
      }
    }

    // 更新標籤
    if (updateDto.tag_ids !== undefined) {
      await this.prisma.cramschoolLearningResourceTag.deleteMany({
        where: { resourceId: id },
      });

      if (updateDto.tag_ids.length > 0) {
        await Promise.all(
          updateDto.tag_ids.map((tagId) =>
            this.prisma.cramschoolLearningResourceTag.create({
              data: {
                resourceId: id,
                tagId,
              },
            }),
          ),
        );
      }
    }

    return this.getResource(id);
  }

  async deleteResource(id: number, userRole: string): Promise<void> {
    // 只有老師可以刪除
    if (userRole !== 'TEACHER') {
      throw new ForbiddenException('只有老師可以刪除教學資源');
    }

    const resource = await this.prisma.cramschoolLearningResource.findUnique({
      where: { resourceId: id },
    });

    if (!resource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }

    await this.prisma.cramschoolLearningResource.delete({
      where: { resourceId: id },
    });
  }

  async bindToCourse(
    id: number,
    courseId: number,
    action: 'add' | 'remove',
    userId: number,
    userRole: string,
  ): Promise<{ message: string }> {
    if (userRole !== 'TEACHER') {
      throw new ForbiddenException('只有老師可以綁定教學資源到課程');
    }

    const resource = await this.prisma.cramschoolLearningResource.findUnique({
      where: { resourceId: id },
    });

    if (!resource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }

    const course = await this.prisma.cramschoolCourse.findUnique({
      where: { courseId },
      include: {
        teacher: true,
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    // 驗證是否為自己的課程
    const teacher = await this.prisma.cramschoolTeacher.findFirst({
      where: { userId },
    });

    if (!teacher || course.teacherId !== teacher.teacherId) {
      throw new ForbiddenException('只能在自己的課程下綁定資源');
    }

    if (action === 'add') {
      // 檢查是否已經綁定
      const existing = await this.prisma.cramschoolLearningResourceCourse.findUnique({
        where: {
          resourceId_courseId: {
            resourceId: id,
            courseId,
          },
        },
      });

      if (!existing) {
        await this.prisma.cramschoolLearningResourceCourse.create({
          data: {
            resourceId: id,
            courseId,
          },
        });
      }

      return { message: `已將資源綁定到課程 ${course.courseName}` };
    } else if (action === 'remove') {
      await this.prisma.cramschoolLearningResourceCourse.deleteMany({
        where: {
          resourceId: id,
          courseId,
        },
      });

      return { message: `已從課程 ${course.courseName} 解除綁定` };
    } else {
      throw new ForbiddenException('action 必須是 "add" 或 "remove"');
    }
  }

  async exportResource(
    id: number,
    formatType: string = 'question_only',
  ): Promise<any> {
    const resource = await this.prisma.cramschoolLearningResource.findUnique({
      where: { resourceId: id },
    });

    if (!resource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }

    // TODO: 實現完整的匯出功能（需要遷移 resource_modes 目錄功能）
    // 目前先返回基本結構
    return {
      resource_id: resource.resourceId,
      mode: resource.mode,
      format_type: formatType,
      message: '匯出功能需要遷移 resource_modes 目錄後才能完整實現',
    };
  }

  async gradeResource(id: number, _submission: any): Promise<any> {
    const resource = await this.prisma.cramschoolLearningResource.findUnique({
      where: { resourceId: id },
    });

    if (!resource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }

    // TODO: 實現完整的評分功能（需要遷移 resource_modes 目錄功能）
    // 目前先返回基本結構
    return {
      resource_id: resource.resourceId,
      mode: resource.mode,
      message: '評分功能需要遷移 resource_modes 目錄後才能完整實現',
    };
  }

  private toResourceDto(resource: any): LearningResource {
    return {
      resource_id: resource.resourceId,
      title: resource.title,
      mode: resource.mode as any,
      course_ids: resource.courses?.map((c: any) => c.course.courseId) || [],
      student_group_ids: resource.studentGroups?.map((g: any) => g.group.groupId) || [],
      structure: resource.structure as any,
      tiptap_structure: resource.tiptapStructure as any,
      settings: resource.settings as any,
      tag_ids: resource.tags?.map((t: any) => t.tag.tagId) || [],
      created_by: resource.createdById,
      is_individualized: resource.isIndividualized,
      available_from: resource.availableFrom?.toISOString() || null,
      available_until: resource.availableUntil?.toISOString() || null,
      created_at: resource.createdAt.toISOString(),
      updated_at: resource.updatedAt.toISOString(),
    };
  }
}
