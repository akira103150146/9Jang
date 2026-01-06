import { z } from 'zod';
/**
 * 題目標籤 Schema
 * 對應後端 CramschoolQuestionTag 模型
 */
export declare const QuestionTagSchema: z.ZodObject<{
    question_tag_id: z.ZodNumber;
    question_id: z.ZodNumber;
    tag_id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    question_id: number;
    tag_id: number;
    question_tag_id: number;
}, {
    question_id: number;
    tag_id: number;
    question_tag_id: number;
}>;
export type QuestionTag = z.infer<typeof QuestionTagSchema>;
/**
 * 創建題目標籤 DTO Schema
 */
export declare const CreateQuestionTagSchema: z.ZodObject<Omit<{
    question_tag_id: z.ZodNumber;
    question_id: z.ZodNumber;
    tag_id: z.ZodNumber;
}, "question_tag_id">, "strip", z.ZodTypeAny, {
    question_id: number;
    tag_id: number;
}, {
    question_id: number;
    tag_id: number;
}>;
export type CreateQuestionTagDto = z.infer<typeof CreateQuestionTagSchema>;
/**
 * 更新題目標籤 DTO Schema
 */
export declare const UpdateQuestionTagSchema: z.ZodObject<Omit<{
    question_tag_id: z.ZodOptional<z.ZodNumber>;
    question_id: z.ZodOptional<z.ZodNumber>;
    tag_id: z.ZodOptional<z.ZodNumber>;
}, "question_tag_id">, "strip", z.ZodTypeAny, {
    question_id?: number | undefined;
    tag_id?: number | undefined;
}, {
    question_id?: number | undefined;
    tag_id?: number | undefined;
}>;
export type UpdateQuestionTagDto = z.infer<typeof UpdateQuestionTagSchema>;
