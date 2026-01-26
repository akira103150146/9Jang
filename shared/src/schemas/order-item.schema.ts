import { z } from 'zod'

/**
 * 訂單項目 Schema
 * 對應後端 CramschoolOrderItem 模型
 */
export const OrderItemSchema = z.object({
  order_item_id: z.number().int().positive(),
  order_id: z.number().int().positive(),
  item_name: z.string().min(1),
  quantity: z.number().int().positive().default(1),
  unit_price: z.number().nonnegative(),
  subtotal: z.number().nonnegative(),
})
export type OrderItem = z.infer<typeof OrderItemSchema>

/**
 * 創建訂單項目 DTO Schema
 */
export const CreateOrderItemSchema = OrderItemSchema.omit({
  order_item_id: true,
})
export type CreateOrderItemDto = z.infer<typeof CreateOrderItemSchema>

/**
 * 更新訂單項目 DTO Schema
 */
export const UpdateOrderItemSchema = OrderItemSchema.partial().omit({
  order_item_id: true,
})
export type UpdateOrderItemDto = z.infer<typeof UpdateOrderItemSchema>
