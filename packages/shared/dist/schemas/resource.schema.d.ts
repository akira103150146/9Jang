import { z } from 'zod';
/**
 * 教學資源模式枚舉
 */
export declare const LearningResourceModeEnum: z.ZodEnum<["HANDOUT", "ONLINE_QUIZ", "LEETCODE", "LISTENING_TEST", "FLASHCARD"]>;
/**
 * 教學資源 Schema
 * 對應後端 LearningResource 模型
 */
export declare const LearningResourceSchema: z.ZodObject<{
    resource_id: z.ZodNumber;
    title: z.ZodString;
    mode: z.ZodDefault<z.ZodEnum<["HANDOUT", "ONLINE_QUIZ", "LEETCODE", "LISTENING_TEST", "FLASHCARD"]>>;
    course_ids: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>>;
    student_group_ids: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>>;
    structure: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodAny, "many">>>;
    tiptap_structure: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        type: z.ZodLiteral<"doc">;
        content: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodType<any, z.ZodTypeDef, any>, "many">>>;
    }, "strip", z.ZodTypeAny, {
        type: "doc";
        content: any[];
    }, {
        type: "doc";
        content?: any[] | undefined;
    }>>>;
    settings: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
    tag_ids: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>>;
    created_by: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    is_individualized: z.ZodDefault<z.ZodBoolean>;
    available_from: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    available_until: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    created_at: z.ZodOptional<z.ZodString>;
    updated_at: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    resource_id: number;
    mode: "HANDOUT" | "ONLINE_QUIZ" | "LEETCODE" | "LISTENING_TEST" | "FLASHCARD";
    course_ids: number[];
    student_group_ids: number[];
    structure: any[];
    settings: Record<string, any>;
    tag_ids: number[];
    is_individualized: boolean;
    created_at?: string | undefined;
    updated_at?: string | undefined;
    created_by?: number | null | undefined;
    tiptap_structure?: {
        type: "doc";
        content: any[];
    } | null | undefined;
    available_from?: string | null | undefined;
    available_until?: string | null | undefined;
}, {
    title: string;
    resource_id: number;
    created_at?: string | undefined;
    updated_at?: string | undefined;
    created_by?: number | null | undefined;
    mode?: "HANDOUT" | "ONLINE_QUIZ" | "LEETCODE" | "LISTENING_TEST" | "FLASHCARD" | undefined;
    course_ids?: number[] | undefined;
    student_group_ids?: number[] | undefined;
    structure?: any[] | undefined;
    tiptap_structure?: {
        type: "doc";
        content?: any[] | undefined;
    } | null | undefined;
    settings?: Record<string, any> | undefined;
    tag_ids?: number[] | undefined;
    is_individualized?: boolean | undefined;
    available_from?: string | null | undefined;
    available_until?: string | null | undefined;
}>;
export type LearningResource = z.infer<typeof LearningResourceSchema>;
/**
 * 創建教學資源 DTO Schema
 */
export declare const CreateLearningResourceSchema: z.ZodObject<{
    title: z.ZodString;
    created_by: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    mode: z.ZodDefault<z.ZodEnum<["HANDOUT", "ONLINE_QUIZ", "LEETCODE", "LISTENING_TEST", "FLASHCARD"]>>;
    course_ids: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>>>;
    student_group_ids: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>>>;
    structure: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodAny, "many">>>>;
    tiptap_structure: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodObject<{
        type: z.ZodLiteral<"doc">;
        content: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodType<any, z.ZodTypeDef, any>, "many">>>;
    }, "strip", z.ZodTypeAny, {
        type: "doc";
        content: any[];
    }, {
        type: "doc";
        content?: any[] | undefined;
    }>>>>;
    settings: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>>;
    tag_ids: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>>>;
    is_individualized: z.ZodDefault<z.ZodBoolean>;
    available_from: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    available_until: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    mode: "HANDOUT" | "ONLINE_QUIZ" | "LEETCODE" | "LISTENING_TEST" | "FLASHCARD";
    is_individualized: boolean;
    created_by?: number | null | undefined;
    course_ids?: number[] | undefined;
    student_group_ids?: number[] | undefined;
    structure?: any[] | undefined;
    tiptap_structure?: {
        type: "doc";
        content: any[];
    } | null | undefined;
    settings?: Record<string, any> | undefined;
    tag_ids?: number[] | undefined;
    available_from?: string | null | undefined;
    available_until?: string | null | undefined;
}, {
    title: string;
    created_by?: number | null | undefined;
    mode?: "HANDOUT" | "ONLINE_QUIZ" | "LEETCODE" | "LISTENING_TEST" | "FLASHCARD" | undefined;
    course_ids?: number[] | undefined;
    student_group_ids?: number[] | undefined;
    structure?: any[] | undefined;
    tiptap_structure?: {
        type: "doc";
        content?: any[] | undefined;
    } | null | undefined;
    settings?: Record<string, any> | undefined;
    tag_ids?: number[] | undefined;
    is_individualized?: boolean | undefined;
    available_from?: string | null | undefined;
    available_until?: string | null | undefined;
}>;
export type CreateLearningResourceDto = z.infer<typeof CreateLearningResourceSchema>;
/**
 * 更新教學資源 DTO Schema
 */
export declare const UpdateLearningResourceSchema: z.ZodObject<Omit<{
    resource_id: z.ZodOptional<z.ZodNumber>;
    title: z.ZodOptional<z.ZodString>;
    mode: z.ZodOptional<z.ZodDefault<z.ZodEnum<["HANDOUT", "ONLINE_QUIZ", "LEETCODE", "LISTENING_TEST", "FLASHCARD"]>>>;
    course_ids: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>>>;
    student_group_ids: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>>>;
    structure: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodAny, "many">>>>;
    tiptap_structure: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodObject<{
        type: z.ZodLiteral<"doc">;
        content: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodType<any, z.ZodTypeDef, any>, "many">>>;
    }, "strip", z.ZodTypeAny, {
        type: "doc";
        content: any[];
    }, {
        type: "doc";
        content?: any[] | undefined;
    }>>>>;
    settings: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>>;
    tag_ids: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>>>;
    created_by: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    is_individualized: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    available_from: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    available_until: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    created_at: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    updated_at: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "created_at" | "updated_at" | "resource_id">, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    created_by?: number | null | undefined;
    mode?: "HANDOUT" | "ONLINE_QUIZ" | "LEETCODE" | "LISTENING_TEST" | "FLASHCARD" | undefined;
    course_ids?: number[] | undefined;
    student_group_ids?: number[] | undefined;
    structure?: any[] | undefined;
    tiptap_structure?: {
        type: "doc";
        content: any[];
    } | null | undefined;
    settings?: Record<string, any> | undefined;
    tag_ids?: number[] | undefined;
    is_individualized?: boolean | undefined;
    available_from?: string | null | undefined;
    available_until?: string | null | undefined;
}, {
    title?: string | undefined;
    created_by?: number | null | undefined;
    mode?: "HANDOUT" | "ONLINE_QUIZ" | "LEETCODE" | "LISTENING_TEST" | "FLASHCARD" | undefined;
    course_ids?: number[] | undefined;
    student_group_ids?: number[] | undefined;
    structure?: any[] | undefined;
    tiptap_structure?: {
        type: "doc";
        content?: any[] | undefined;
    } | null | undefined;
    settings?: Record<string, any> | undefined;
    tag_ids?: number[] | undefined;
    is_individualized?: boolean | undefined;
    available_from?: string | null | undefined;
    available_until?: string | null | undefined;
}>;
export type UpdateLearningResourceDto = z.infer<typeof UpdateLearningResourceSchema>;
/**
 * 內容模板 Schema
 * 對應後端 ContentTemplate 模型
 */
export declare const ContentTemplateSchema: z.ZodObject<{
    template_id: z.ZodNumber;
    title: z.ZodString;
    structure: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodAny, "many">>>;
    tiptap_structure: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        type: z.ZodLiteral<"doc">;
        content: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodType<any, z.ZodTypeDef, any>, "many">>>;
    }, "strip", z.ZodTypeAny, {
        type: "doc";
        content: any[];
    }, {
        type: "doc";
        content?: any[] | undefined;
    }>>>;
    created_by: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    is_public: z.ZodDefault<z.ZodBoolean>;
    tag_ids: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>>;
    created_at: z.ZodOptional<z.ZodString>;
    updated_at: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    structure: any[];
    tag_ids: number[];
    template_id: number;
    is_public: boolean;
    created_at?: string | undefined;
    updated_at?: string | undefined;
    created_by?: number | null | undefined;
    tiptap_structure?: {
        type: "doc";
        content: any[];
    } | null | undefined;
}, {
    title: string;
    template_id: number;
    created_at?: string | undefined;
    updated_at?: string | undefined;
    created_by?: number | null | undefined;
    structure?: any[] | undefined;
    tiptap_structure?: {
        type: "doc";
        content?: any[] | undefined;
    } | null | undefined;
    tag_ids?: number[] | undefined;
    is_public?: boolean | undefined;
}>;
export type ContentTemplate = z.infer<typeof ContentTemplateSchema>;
/**
 * 創建內容模板 DTO Schema
 */
export declare const CreateContentTemplateSchema: z.ZodObject<{
    title: z.ZodString;
    created_by: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    structure: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodAny, "many">>>>;
    tiptap_structure: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodObject<{
        type: z.ZodLiteral<"doc">;
        content: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodType<any, z.ZodTypeDef, any>, "many">>>;
    }, "strip", z.ZodTypeAny, {
        type: "doc";
        content: any[];
    }, {
        type: "doc";
        content?: any[] | undefined;
    }>>>>;
    tag_ids: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>>>;
    is_public: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    title: string;
    is_public: boolean;
    created_by?: number | null | undefined;
    structure?: any[] | undefined;
    tiptap_structure?: {
        type: "doc";
        content: any[];
    } | null | undefined;
    tag_ids?: number[] | undefined;
}, {
    title: string;
    created_by?: number | null | undefined;
    structure?: any[] | undefined;
    tiptap_structure?: {
        type: "doc";
        content?: any[] | undefined;
    } | null | undefined;
    tag_ids?: number[] | undefined;
    is_public?: boolean | undefined;
}>;
export type CreateContentTemplateDto = z.infer<typeof CreateContentTemplateSchema>;
/**
 * 更新內容模板 DTO Schema
 */
export declare const UpdateContentTemplateSchema: z.ZodObject<Omit<{
    template_id: z.ZodOptional<z.ZodNumber>;
    title: z.ZodOptional<z.ZodString>;
    structure: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodAny, "many">>>>;
    tiptap_structure: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodObject<{
        type: z.ZodLiteral<"doc">;
        content: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodType<any, z.ZodTypeDef, any>, "many">>>;
    }, "strip", z.ZodTypeAny, {
        type: "doc";
        content: any[];
    }, {
        type: "doc";
        content?: any[] | undefined;
    }>>>>;
    created_by: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    is_public: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    tag_ids: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>>>;
    created_at: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    updated_at: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "created_at" | "updated_at" | "template_id">, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    created_by?: number | null | undefined;
    structure?: any[] | undefined;
    tiptap_structure?: {
        type: "doc";
        content: any[];
    } | null | undefined;
    tag_ids?: number[] | undefined;
    is_public?: boolean | undefined;
}, {
    title?: string | undefined;
    created_by?: number | null | undefined;
    structure?: any[] | undefined;
    tiptap_structure?: {
        type: "doc";
        content?: any[] | undefined;
    } | null | undefined;
    tag_ids?: number[] | undefined;
    is_public?: boolean | undefined;
}>;
export type UpdateContentTemplateDto = z.infer<typeof UpdateContentTemplateSchema>;
