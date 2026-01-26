import { z } from 'zod'

/**
 * 餐廳 Schema
 * 對應後端 CramschoolRestaurant 模型
 */
export const RestaurantSchema = z.object({
  restaurant_id: z.number().int().positive(),
  name: z.string().min(1),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  menu_image_path: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
})
export type Restaurant = z.infer<typeof RestaurantSchema>

/**
 * 創建餐廳 DTO Schema
 */
export const CreateRestaurantSchema = RestaurantSchema.omit({
  restaurant_id: true,
  created_at: true,
  updated_at: true,
})
export type CreateRestaurantDto = z.infer<typeof CreateRestaurantSchema>

/**
 * 更新餐廳 DTO Schema
 */
export const UpdateRestaurantSchema = RestaurantSchema.partial().omit({
  restaurant_id: true,
  created_at: true,
  updated_at: true,
})
export type UpdateRestaurantDto = z.infer<typeof UpdateRestaurantSchema>
