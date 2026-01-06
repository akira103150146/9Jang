import { z } from 'zod'

/**
 * 團購 Schema
 * 對應後端 CramschoolGroupOrder 模型
 */
export const GroupOrderSchema = z.object({
  group_order_id: z.number().int().positive(),
  restaurant_id: z.number().int().positive(),
  title: z.string().min(1),
  order_link: z.string().url(),
  status: z.string().default('Open'),
  deadline: z.string().datetime(),
  created_by_id: z.number().int().positive().nullable().optional(),
  created_at: z.string().datetime().optional(),
  closed_at: z.string().datetime().nullable().optional(),
})
export type GroupOrder = z.infer<typeof GroupOrderSchema>

/**
 * 創建團購 DTO Schema
 */
export const CreateGroupOrderSchema = GroupOrderSchema.omit({
  group_order_id: true,
  created_at: true,
  closed_at: true,
})
export type CreateGroupOrderDto = z.infer<typeof CreateGroupOrderSchema>

/**
 * 更新團購 DTO Schema
 */
export const UpdateGroupOrderSchema = GroupOrderSchema.partial().omit({
  group_order_id: true,
  created_at: true,
})
export type UpdateGroupOrderDto = z.infer<typeof UpdateGroupOrderSchema>
