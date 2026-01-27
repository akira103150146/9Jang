/**
 * Students Fee Service
 * 處理學生費用相關邏輯
 */

import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'

@Injectable()
export class StudentsFeeService {
  constructor(private prisma: PrismaService) {}

  /**
   * 獲取學費狀態
   */
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
    })

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`)
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
    ])

    // 生成學費月份列表（基於報名期間）
    const tuitionMonths: any[] = []
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1

    for (const enrollment of student.enrollments) {
      // 如果報名沒有期間，生成當前月份的學費
      if (!enrollment.periods || enrollment.periods.length === 0) {
        const existingFee = student.extraFees.find(
          (fee) =>
            fee.feeDate.getFullYear() === currentYear &&
            fee.feeDate.getMonth() + 1 === currentMonth &&
            fee.item === '學費'
        )

        if (!existingFee) {
          tuitionMonths.push({
            year: currentYear,
            month: currentMonth,
            enrollment_id: enrollment.enrollmentId,
            course_name: enrollment.course.courseName,
            has_fee: false,
            weeks: 4,
          })
        }
      } else {
        // 如果有期間，生成期間內每個月的學費
        for (const period of enrollment.periods) {
          const startDate = new Date(period.startDate)
          const endDate = period.endDate ? new Date(period.endDate) : new Date(currentYear + 1, 11, 31)

          let date = new Date(startDate)
          while (date <= endDate) {
            const year = date.getFullYear()
            const month = date.getMonth() + 1

            const existingFee = student.extraFees.find(
              (fee) =>
                fee.feeDate.getFullYear() === year &&
                fee.feeDate.getMonth() + 1 === month &&
                fee.item === '學費'
            )

            if (!existingFee) {
              tuitionMonths.push({
                year,
                month,
                enrollment_id: enrollment.enrollmentId,
                course_name: enrollment.course.courseName,
                has_fee: false,
                weeks: 4,
              })
            }

            // 移到下個月
            date = new Date(year, month, 1)
          }
        }
      }
    }

    return {
      student_id: id,
      total_unpaid: Number(unpaidFees._sum.amount || 0),
      total_paid: Number(totalFees._sum.amount || 0) - Number(unpaidFees._sum.amount || 0),
      tuition_months: tuitionMonths,
    }
  }

  /**
   * 生成學費
   */
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
    })

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`)
    }

    const enrollment = student.enrollments[0]
    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${data.enrollment_id} not found`)
    }

    // 計算費用（基於課程費用和週數）
    const courseFee = Number(enrollment.course.feePerSession) || 0
    const totalAmount = (courseFee / 4) * data.weeks

    // 創建費用記錄
    const feeDate = new Date(data.year, data.month - 1, 1)
    const fee = await this.prisma.cramschoolExtraFee.create({
      data: {
        studentId: id,
        item: '學費',
        amount: totalAmount,
        feeDate,
        paymentStatus: 'Unpaid',
        notes: `${enrollment.course.courseName} - ${data.year}年${data.month}月 - ${data.weeks}週`,
      },
    })

    return fee
  }

  /**
   * 批次生成學費
   */
  async batchGenerateTuitions(studentIds: number[], weeks: number = 4): Promise<any> {
    let totalStudents = 0
    let successCount = 0
    let failCount = 0
    let totalFeesGenerated = 0
    const errors: any[] = []

    for (const studentId of studentIds) {
      totalStudents++
      try {
        const tuitionStatus = await this.getTuitionStatus(studentId)
        const months = tuitionStatus.tuition_months || []

        for (const month of months) {
          try {
            await this.generateTuition(studentId, {
              year: month.year,
              month: month.month,
              enrollment_id: month.enrollment_id,
              weeks,
            })
            totalFeesGenerated++
          } catch (error: any) {
            errors.push({
              student_id: studentId,
              year: month.year,
              month: month.month,
              error: error.message,
            })
          }
        }
        successCount++
      } catch (error: any) {
        failCount++
        errors.push({
          student_id: studentId,
          error: error.message,
        })
      }
    }

    return {
      total_students: totalStudents,
      success_count: successCount,
      fail_count: failCount,
      total_fees_generated: totalFeesGenerated,
      errors,
    }
  }
}
