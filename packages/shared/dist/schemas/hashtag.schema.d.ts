import { z } from 'zod';
/**
 * 標籤 Schema
 * 對應後端 CramschoolHashtag 模型
 */
export declare const HashtagSchema: z.ZodObject<{
    tag_id: z.ZodNumber;
    tag_name: z.ZodString;
    creator_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    creator_name: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tag_id: number;
    tag_name: string;
    creator_id?: number | null | undefined;
    creator_name?: string | undefined;
}, {
    tag_id: number;
    tag_name: string;
    creator_id?: number | null | undefined;
    creator_name?: string | undefined;
}>;
export type Hashtag = z.infer<typeof HashtagSchema>;
/**
 * 創建標籤 DTO Schema
 */
export declare const CreateHashtagSchema: z.ZodObject<Omit<{
    tag_id: z.ZodNumber;
    tag_name: z.ZodString;
    creator_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    creator_name: z.ZodOptional<z.ZodString>;
}, "tag_id" | "creator_name">, "strip", z.ZodTypeAny, {
    tag_name: string;
    creator_id?: number | null | undefined;
}, {
    tag_name: string;
    creator_id?: number | null | undefined;
}>;
export type CreateHashtagDto = z.infer<typeof CreateHashtagSchema>;
/**
 * 更新標籤 DTO Schema
 */
export declare const UpdateHashtagSchema: z.ZodObject<Omit<{
    tag_id: z.ZodOptional<z.ZodNumber>;
    tag_name: z.ZodOptional<z.ZodString>;
    creator_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    creator_name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "tag_id" | "creator_name">, "strip", z.ZodTypeAny, {
    tag_name?: string | undefined;
    creator_id?: number | null | undefined;
}, {
    tag_name?: string | undefined;
    creator_id?: number | null | undefined;
}>;
export type UpdateHashtagDto = z.infer<typeof UpdateHashtagSchema>;
