import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateStudentDto,
  UpdateStudentDto,
  StudentQuery,
  Student,
} from '@9jang/shared';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async getStudents(query: StudentQuery, userId: number, userRole: string) {
    const page = query.page || 1;
    const pageSize = query.page_size || 10;
    const skip = (page - 1) * pageSize;

    // 構建 where 條件
    const where: any = {};

    // 角色過濾
    if (userRole === 'TEACHER') {
      // 老師：只能看到上過自己課程的學生
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

      const courseIds = teacherCourses.map((c) => c.courseId);
      const enrollments = await this.prisma.cramschoolStudentEnrollment.findMany({
        where: {
          courseId: { in: courseIds },
          isDeleted: false,
        },
        select: { studentId: true },
        distinct: ['studentId'],
      });

      const studentIds = enrollments.map((e) => e.studentId);
      where.studentId = { in: studentIds };
    } else if (userRole === 'STUDENT') {
      // 學生：只能看到自己
      const student = await this.prisma.cramschoolStudent.findFirst({
        where: { userId },
      });

      if (!student) {
        return createPaginatedResponse([], 0, page, pageSize);
      }

      where.studentId = student.studentId;
    }

    // 軟刪除過濾
    if (!query.include_deleted) {
      where.isDeleted = false;
    }

    // 姓名搜尋
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    // 學校搜尋
    if (query.school) {
      where.school = { contains: query.school, mode: 'insensitive' };
    }

    // 年級搜尋
    if (query.grade) {
      where.grade = query.grade;
    }

    // 注意：電話搜尋可以通過 search 參數實現
    // StudentQuery 中不包含 phone 字段，使用 search 參數進行模糊搜尋

    // 標籤篩選
    if (query.tag) {
      const tagId = parseInt(query.tag);
      if (!isNaN(tagId)) {
        const studentsInGroup = await this.prisma.cramschoolStudentGroupStudent.findMany({
          where: { groupId: tagId },
          select: { studentId: true },
        });
        const studentIds = studentsInGroup.map((s) => s.studentId);
        where.studentId = where.studentId
          ? { in: studentIds.filter((id) => (where.studentId as any).in?.includes(id) || true) }
          : { in: studentIds };
      }
    }

    // 課程篩選
    if (query.course) {
      const courseId = parseInt(query.course);
      if (!isNaN(courseId)) {
        const enrollments = await this.prisma.cramschoolStudentEnrollment.findMany({
          where: {
            courseId,
            isDeleted: false,
          },
          select: { studentId: true },
        });
        const studentIds = enrollments.map((e) => e.studentId);
        where.studentId = where.studentId
          ? { in: studentIds.filter((id) => (where.studentId as any).in?.includes(id) || true) }
          : { in: studentIds };
      }
    }

    // 待繳學費篩選
    if (query.has_unpaid_fees === 'yes') {
      // 需要計算未繳費用
      const studentsWithUnpaid = await this.prisma.cramschoolExtraFee.groupBy({
        by: ['studentId'],
        where: {
          isDeleted: false,
          paymentStatus: 'Unpaid',
        },
        having: {
          studentId: {
            _count: { gt: 0 },
          },
        },
      });
      const studentIds = studentsWithUnpaid.map((s) => s.studentId);
      where.studentId = where.studentId
        ? { in: studentIds.filter((id) => (where.studentId as any).in?.includes(id) || true) }
        : { in: studentIds };
    } else if (query.has_unpaid_fees === 'no') {
      // 沒有未繳費用的學生
      const studentsWithUnpaid = await this.prisma.cramschoolExtraFee.groupBy({
        by: ['studentId'],
        where: {
          isDeleted: false,
          paymentStatus: 'Unpaid',
        },
      });
      const unpaidStudentIds = studentsWithUnpaid.map((s) => s.studentId);
      // 這裡需要更複雜的邏輯，暫時跳過
    }

    // 查詢學生
    const [results, count] = await Promise.all([
      this.prisma.cramschoolStudent.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          user: true,
          enrollments: {
            where: { isDeleted: false },
            include: {
              course: true,
              periods: {
                where: { isActive: true },
                orderBy: { startDate: 'asc' },
              },
            },
          },
          extraFees: {
            where: { isDeleted: false },
          },
          studentGroups: {
            include: {
              group: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.cramschoolStudent.count({ where }),
    ]);

    // 計算總費用和未繳費用
    const studentsWithStats = await Promise.all(
      results.map(async (student) => {
        const [totalFees, unpaidFees] = await Promise.all([
          this.prisma.cramschoolExtraFee.aggregate({
            where: {
              studentId: student.studentId,
              isDeleted: false,
            },
            _sum: { amount: true },
          }),
          this.prisma.cramschoolExtraFee.aggregate({
            where: {
              studentId: student.studentId,
              isDeleted: false,
              paymentStatus: 'Unpaid',
            },
            _sum: { amount: true },
          }),
        ]);

        // 計算是否有需要生成的學費
        // 檢查是否有未刪除且活躍的報名
        let hasTuitionNeeded = false;
        if (student.enrollments && student.enrollments.length > 0) {
          const activeEnrollments = student.enrollments.filter(
            (e: any) => !e.isDeleted && e.isActive
          );
          
          if (activeEnrollments.length > 0) {
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth() + 1;
            
            // 檢查每個活躍報名
            for (const enrollment of activeEnrollments) {
              // 如果報名沒有期間，檢查當前月份是否已經有費用記錄
              if (!enrollment.periods || enrollment.periods.length === 0) {
                // 檢查當前月份是否已經有費用記錄
                const existingFee = student.extraFees?.find(
                  (fee: any) =>
                    fee.feeDate.getFullYear() === currentYear &&
                    fee.feeDate.getMonth() + 1 === currentMonth &&
                    fee.item === '學費'
                );
                if (!existingFee) {
                  hasTuitionNeeded = true;
                  break;
                }
              }
              
              // 如果有期間，檢查期間內是否有未生成的學費月份
              for (const period of enrollment.periods) {
                const startDate = new Date(period.startDate);
                const endDate = period.endDate ? new Date(period.endDate) : new Date(currentYear + 1, 11, 31);
                
                let date = new Date(startDate);
                while (date <= endDate && !hasTuitionNeeded) {
                  const year = date.getFullYear();
                  const month = date.getMonth() + 1;
                  
                  // 檢查該月份是否已經有費用記錄（檢查費用名目是否為「學費」）
                  const existingFee = student.extraFees?.find(
                    (fee: any) =>
                      fee.feeDate.getFullYear() === year &&
                      fee.feeDate.getMonth() + 1 === month &&
                      fee.item === '學費'
                  );
                  
                  if (!existingFee) {
                    hasTuitionNeeded = true;
                    break;
                  }
                  
                  // 移到下個月
                  date = new Date(year, month, 1);
                }
                
                if (hasTuitionNeeded) break;
              }
              
              if (hasTuitionNeeded) break;
            }
          }
        }

        return {
          ...this.toStudentDto(student),
          total_fees: Number(totalFees._sum.amount || 0),
          unpaid_fees: Number(unpaidFees._sum.amount || 0),
          enrollments_count: student.enrollments.length,
          has_tuition_needed: hasTuitionNeeded,
          student_groups: student.studentGroups?.map((sg: any) => ({
            group_id: sg.group.groupId,
            name: sg.group.name,
            description: sg.group.description,
            group_type: sg.group.groupType,
          })) || [],
          enrollments: student.enrollments.map((e: any) => ({
            enrollment_id: e.enrollmentId,
            course_id: e.courseId,
            course_name: e.course.courseName,
            enroll_date: e.enrollDate.toISOString().split('T')[0],
            discount_rate: Number(e.discountRate),
            is_active: e.isActive,
          })),
        };
      }),
    );

    return createPaginatedResponse(studentsWithStats, count, page, pageSize);
  }

  async getStudent(id: number): Promise<any> {
    const student = await this.prisma.cramschoolStudent.findUnique({
      where: { studentId: id },
      include: {
        user: true,
        enrollments: {
          where: { isDeleted: false },
          include: {
            course: true,
            periods: {
              where: { isActive: true },
            },
          },
        },
        extraFees: {
          where: { isDeleted: false },
        },
        studentGroups: {
          include: {
            group: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return {
      ...this.toStudentDto(student),
      student_groups: student.studentGroups?.map((sg: any) => ({
        group_id: sg.group.groupId,
        name: sg.group.name,
        description: sg.group.description,
        group_type: sg.group.groupType,
      })) || [],
      enrollments: student.enrollments.map((e: any) => ({
        enrollment_id: e.enrollmentId,
        course_name: e.course.courseName,
        enroll_date: e.enrollDate.toISOString().split('T')[0],
        discount_rate: Number(e.discountRate),
        is_active: e.isActive,
      })),
    };
  }

  async createStudent(createDto: CreateStudentDto, userId: number, userRole: string): Promise<Student> {
    // 只有管理員或會計可以創建學生
    if (userRole !== 'ADMIN' && userRole !== 'ACCOUNTANT') {
      throw new ForbiddenException('只有管理員或會計可以創建學生');
    }

    // 創建學生
    const student = await this.prisma.cramschoolStudent.create({
      data: {
        name: createDto.name,
        school: createDto.school,
        grade: createDto.grade,
        phone: createDto.phone || null,
        emergencyContactName: createDto.emergency_contact_name || null,
        emergencyContactPhone: createDto.emergency_contact_phone || null,
        notes: createDto.notes || null,
        initialPassword: createDto.initial_password || null,
      },
    });

    // 如果提供了 initial_password，創建用戶帳號
    if (createDto.initial_password) {
      const username = `student_${student.studentId}`;
      const email = `${username}@student.local`;
      const hashedPassword = await require('bcrypt').hash(createDto.initial_password, 10);

      const user = await this.prisma.accountCustomUser.create({
        data: {
          username,
          email,
          password: hashedPassword,
          role: 'STUDENT',
          firstName: createDto.name,
          isActive: true,
          mustChangePassword: false,
        },
      });

      await this.prisma.cramschoolStudent.update({
        where: { studentId: student.studentId },
        data: { userId: user.id },
      });
    }

    return this.getStudent(student.studentId);
  }

  async updateStudent(id: number, updateDto: UpdateStudentDto): Promise<Student> {
    const student = await this.prisma.cramschoolStudent.findUnique({
      where: { studentId: id },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    await this.prisma.cramschoolStudent.update({
      where: { studentId: id },
      data: {
        name: updateDto.name,
        school: updateDto.school,
        grade: updateDto.grade,
        phone: updateDto.phone,
        emergencyContactName: updateDto.emergency_contact_name,
        emergencyContactPhone: updateDto.emergency_contact_phone,
        notes: updateDto.notes,
      },
    });

    return this.getStudent(id);
  }

  async deleteStudent(id: number): Promise<void> {
    const student = await this.prisma.cramschoolStudent.findUnique({
      where: { studentId: id },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    // 軟刪除
    await this.prisma.cramschoolStudent.update({
      where: { studentId: id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    // 軟刪除相關記錄
    await Promise.all([
      this.prisma.cramschoolStudentEnrollment.updateMany({
        where: { studentId: id, isDeleted: false },
        data: { isDeleted: true, deletedAt: new Date() },
      }),
      this.prisma.cramschoolExtraFee.updateMany({
        where: { studentId: id, isDeleted: false },
        data: { isDeleted: true, deletedAt: new Date() },
      }),
      this.prisma.cramschoolAttendance.updateMany({
        where: { studentId: id, isDeleted: false },
        data: { isDeleted: true, deletedAt: new Date() },
      }),
      this.prisma.cramschoolLeave.updateMany({
        where: { studentId: id, isDeleted: false },
        data: { isDeleted: true, deletedAt: new Date() },
      }),
    ]);
  }

  async restoreStudent(id: number): Promise<Student> {
    const student = await this.prisma.cramschoolStudent.findUnique({
      where: { studentId: id },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    // 恢復學生
    await this.prisma.cramschoolStudent.update({
      where: { studentId: id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    return this.getStudent(id);
  }

  async getTuitionStatus(id: number): Promise<any> {
    const student = await this.prisma.cramschoolStudent.findUnique({
      where: { studentId: id },
      include: {
        enrollments: {
          where: { isDeleted: false, isActive: true },
          include: {
            course: true,
            periods: {
              where: { isActive: true },
              orderBy: { startDate: 'asc' },
            },
          },
        },
        extraFees: {
          where: { isDeleted: false },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    // 計算總費用和未繳費用
    const [totalFees, unpaidFees] = await Promise.all([
      this.prisma.cramschoolExtraFee.aggregate({
        where: {
          studentId: id,
          isDeleted: false,
        },
        _sum: { amount: true },
      }),
      this.prisma.cramschoolExtraFee.aggregate({
        where: {
          studentId: id,
          isDeleted: false,
          paymentStatus: 'Unpaid',
        },
        _sum: { amount: true },
      }),
    ]);

    // 生成學費月份列表（基於報名期間）
    const tuitionMonths: any[] = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    for (const enrollment of student.enrollments) {
      // 如果報名沒有期間，生成當前月份的學費
      if (!enrollment.periods || enrollment.periods.length === 0) {
        // 檢查當前月份是否已經有費用記錄（檢查費用名目是否為「學費」）
        const existingFee = student.extraFees.find(
          (fee) =>
            fee.feeDate.getFullYear() === currentYear &&
            fee.feeDate.getMonth() + 1 === currentMonth &&
            fee.item === '學費'
        );

        if (!existingFee) {
          tuitionMonths.push({
            year: currentYear,
            month: currentMonth,
            enrollment_id: enrollment.enrollmentId,
            course_name: enrollment.course.courseName,
            has_fee: false,
            weeks: 4, // 預設4週
          });
        }
      } else {
        // 如果有期間，生成期間內每個月的學費
        for (const period of enrollment.periods) {
          const startDate = new Date(period.startDate);
          const endDate = period.endDate ? new Date(period.endDate) : new Date(currentYear + 1, 11, 31);
          
          // 生成該期間內每個月的學費項目
          let date = new Date(startDate);
          while (date <= endDate) {
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            
            // 檢查該月份是否已經有費用記錄（檢查費用名目是否為「學費」）
            const existingFee = student.extraFees.find(
              (fee) =>
                fee.feeDate.getFullYear() === year &&
                fee.feeDate.getMonth() + 1 === month &&
                fee.item === '學費'
            );

            if (!existingFee) {
              tuitionMonths.push({
                year,
                month,
                enrollment_id: enrollment.enrollmentId,
                course_name: enrollment.course.courseName,
                has_fee: false,
                weeks: 4, // 預設4週
              });
            }

            // 移到下個月
            date = new Date(year, month, 1);
          }
        }
      }
    }

    return {
      student_id: id,
      total_unpaid: Number(unpaidFees._sum.amount || 0),
      total_paid: Number(totalFees._sum.amount || 0) - Number(unpaidFees._sum.amount || 0),
      tuition_months: tuitionMonths,
    };
  }

  async generateTuition(id: number, data: { year: number; month: number; enrollment_id: number; weeks: number }): Promise<any> {
    const student = await this.prisma.cramschoolStudent.findUnique({
      where: { studentId: id },
      include: {
        enrollments: {
          where: { enrollmentId: data.enrollment_id, isDeleted: false },
          include: {
            course: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    const enrollment = student.enrollments[0];
    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${data.enrollment_id} not found`);
    }

    // 計算費用（基於課程費用和週數）
    // 每堂費用是每周上四次課的費用，所以費用計算邏輯為：課程費用/4*週數
    const courseFee = Number(enrollment.course.feePerSession) || 0;
    const totalAmount = (courseFee / 4) * data.weeks;

    // 創建費用記錄
    const feeDate = new Date(data.year, data.month - 1, 1);
    const fee = await this.prisma.cramschoolExtraFee.create({
      data: {
        studentId: id,
        item: '學費',
        amount: totalAmount,
        feeDate,
        paymentStatus: 'Unpaid',
        notes: `${enrollment.course.courseName} - ${data.year}年${data.month}月 - ${data.weeks}週`,
      },
    });

    return fee;
  }

  async batchGenerateTuitions(studentIds: number[], weeks: number = 4): Promise<any> {
    let totalStudents = 0;
    let successCount = 0;
    let failCount = 0;
    let totalFeesGenerated = 0;
    const errors: any[] = [];

    for (const studentId of studentIds) {
      totalStudents++;
      try {
        const tuitionStatus = await this.getTuitionStatus(studentId);
        const months = tuitionStatus.tuition_months || [];

        for (const month of months) {
          try {
            await this.generateTuition(studentId, {
              year: month.year,
              month: month.month,
              enrollment_id: month.enrollment_id,
              weeks,
            });
            totalFeesGenerated++;
          } catch (error: any) {
            errors.push({
              student_id: studentId,
              year: month.year,
              month: month.month,
              error: error.message,
            });
          }
        }
        successCount++;
      } catch (error: any) {
        failCount++;
        errors.push({
          student_id: studentId,
          error: error.message,
        });
      }
    }

    return {
      total_students: totalStudents,
      success_count: successCount,
      fail_count: failCount,
      total_fees_generated: totalFeesGenerated,
      errors,
    };
  }

  async resetPassword(id: number, password: string): Promise<any> {
    const student = await this.prisma.cramschoolStudent.findUnique({
      where: { studentId: id },
      include: { user: true },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    if (!student.userId) {
      throw new NotFoundException(`Student with ID ${id} does not have a user account`);
    }

    const hashedPassword = await require('bcrypt').hash(password, 10);
    await this.prisma.accountCustomUser.update({
      where: { id: student.userId },
      data: { password: hashedPassword },
    });

    return {
      password, // 返回明文密碼（前端需要顯示）
    };
  }

  async toggleAccountStatus(id: number): Promise<any> {
    const student = await this.prisma.cramschoolStudent.findUnique({
      where: { studentId: id },
      include: { user: true },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    if (!student.userId) {
      throw new NotFoundException(`Student with ID ${id} does not have a user account`);
    }

    const user = await this.prisma.accountCustomUser.findUnique({
      where: { id: student.userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${student.userId} not found`);
    }

    const updated = await this.prisma.accountCustomUser.update({
      where: { id: student.userId },
      data: {
        isActive: !user.isActive,
      },
    });

    return {
      is_active: updated.isActive,
    };
  }

  private toStudentDto(student: any): Student {
    return {
      student_id: student.studentId,
      name: student.name,
      school: student.school,
      grade: student.grade,
      phone: student.phone,
      emergency_contact_name: student.emergencyContactName,
      emergency_contact_phone: student.emergencyContactPhone,
      notes: student.notes,
      is_deleted: student.isDeleted,
      deleted_at: student.deletedAt?.toISOString() || null,
      user_id: student.userId,
      initial_password: student.initialPassword,
    };
  }
}
