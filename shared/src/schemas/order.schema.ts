import { z } from 'zod'

/**
 * 訂單 Schema
 * 對應後端 CramschoolOrder 模型
 */
export const OrderSchema = z.object({
  order_id: z.number().int().positive(),
  group_order_id: z.number().int().positive(),
  student_id: z.number().int().positive(),
  status: z.string().default('Pending'),
  total_amount: z.number().nonnegative().default(0),
  notes: z.string().nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  is_deleted: z.boolean().default(false),
  deleted_at: z.string().datetime().nullable().optional(),
})
export type Order = z.infer<typeof OrderSchema>

/**
 * 創建訂單 DTO Schema
 */
export const CreateOrderSchema = OrderSchema.omit({
  order_id: true,
  created_at: true,
  updated_at: true,
  is_deleted: true,
  deleted_at: true,
})
export type CreateOrderDto = z.infer<typeof CreateOrderSchema>

/**
 * 更新訂單 DTO Schema
 */
export const UpdateOrderSchema = OrderSchema.partial().omit({
  order_id: true,
  created_at: true,
  updated_at: true,
  is_deleted: true,
  deleted_at: true,
})
export type UpdateOrderDto = z.infer<typeof UpdateOrderSchema>
