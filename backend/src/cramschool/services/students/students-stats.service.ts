/**
 * Students Stats Service
 * 處理學生統計計算邏輯
 */

import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'

@Injectable()
export class StudentsStatsService {
  constructor(private prisma: PrismaService) {}

  /**
   * 計算學生統計信息（總費用、未繳費用、是否需要生成學費等）
   */
  async calculateStudentStats(student: any): Promise<{
    total_fees: number
    unpaid_fees: number
    enrollments_count: number
    has_tuition_needed: boolean
  }> {
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
    ])

    // 計算是否有需要生成的學費
    let hasTuitionNeeded = false
    if (student.enrollments && student.enrollments.length > 0) {
      const activeEnrollments = student.enrollments.filter(
        (e: any) => !e.isDeleted && e.isActive
      )

      if (activeEnrollments.length > 0) {
        const currentDate = new Date()
        const currentYear = currentDate.getFullYear()
        const currentMonth = currentDate.getMonth() + 1

        for (const enrollment of activeEnrollments) {
          if (!enrollment.periods || enrollment.periods.length === 0) {
            const existingFee = student.extraFees?.find(
              (fee: any) =>
                fee.feeDate.getFullYear() === currentYear &&
                fee.feeDate.getMonth() + 1 === currentMonth &&
                fee.item === '學費'
            )
            if (!existingFee) {
              hasTuitionNeeded = true
              break
            }
          } else {
            for (const period of enrollment.periods) {
              const startDate = new Date(period.startDate)
              const endDate = period.endDate ? new Date(period.endDate) : new Date(currentYear + 1, 11, 31)

              let date = new Date(startDate)
              while (date <= endDate && !hasTuitionNeeded) {
                const year = date.getFullYear()
                const month = date.getMonth() + 1

                const existingFee = student.extraFees?.find(
                  (fee: any) =>
                    fee.feeDate.getFullYear() === year &&
                    fee.feeDate.getMonth() + 1 === month &&
                    fee.item === '學費'
                )

                if (!existingFee) {
                  hasTuitionNeeded = true
                  break
                }

                date = new Date(year, month, 1)
              }

              if (hasTuitionNeeded) break
            }

            if (hasTuitionNeeded) break
          }
        }
      }
    }

    return {
      total_fees: Number(totalFees._sum.amount || 0),
      unpaid_fees: Number(unpaidFees._sum.amount || 0),
      enrollments_count: student.enrollments.length,
      has_tuition_needed: hasTuitionNeeded,
    }
  }
}
