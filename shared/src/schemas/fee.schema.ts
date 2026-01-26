import { z } from 'zod'

/**
 * 費用 Schema
 * 對應後端 CramschoolExtraFee 模型
 */
export const FeeSchema = z.object({
  fee_id: z.number().int().positive(),
  student_id: z.number().int().positive(),
  item: z.string(),
  amount: z.number().nonnegative(),
  fee_date: z.string().date(),
  payment_status: z.enum(['Paid', 'Unpaid', 'Partial']).default('Unpaid'),
  notes: z.string().nullable().optional(),
  paid_at: z.string().datetime().nullable().optional(),
  is_deleted: z.boolean().default(false),
  deleted_at: z.string().datetime().nullable().optional(),
  student_name: z.string().optional(), // 從關聯查詢中獲取
})
export type Fee = z.infer<typeof FeeSchema>

/**
 * 創建費用 DTO Schema
 */
export const CreateFeeSchema = FeeSchema.omit({
  fee_id: true,
  is_deleted: true,
  deleted_at: true,
  student_name: true,
}).extend({
  paid_at: z.string().datetime().nullable().optional(),
})
export type CreateFeeDto = z.infer<typeof CreateFeeSchema>

/**
 * 更新費用 DTO Schema
 */
export const UpdateFeeSchema = CreateFeeSchema.partial()
export type UpdateFeeDto = z.infer<typeof UpdateFeeSchema>

/**
 * 批次更新費用狀態 DTO Schema
 */
export const BatchUpdateFeeStatusSchema = z.object({
  fee_ids: z.array(z.number().int().positive()),
  payment_status: z.enum(['Paid', 'Unpaid', 'Partial']),
})
export type BatchUpdateFeeStatusDto = z.infer<typeof BatchUpdateFeeStatusSchema>

/**
 * 費用查詢參數 Schema
 */
export const FeeQuerySchema = z.object({
  student: z.number().int().positive().optional(),
  include_deleted: z.boolean().default(false).optional(),
})
export type FeeQuery = z.infer<typeof FeeQuerySchema>
