import { z } from 'zod';
/**
 * 題目年級枚舉
 */
export declare const QuestionLevelEnum: z.ZodEnum<["JHS", "SHS", "VCS"]>;
/**
 * 題目類型枚舉
 */
export declare const QuestionTypeEnum: z.ZodEnum<["SINGLE_CHOICE", "MULTIPLE_CHOICE", "FILL_IN_BLANK", "PROGRAMMING", "LISTENING"]>;
/**
 * 題目庫 Schema
 * 對應後端 QuestionBank 模型
 */
export declare const QuestionSchema: z.ZodObject<{
    question_id: z.ZodNumber;
    subject_id: z.ZodNumber;
    level: z.ZodEnum<["JHS", "SHS", "VCS"]>;
    chapter: z.ZodString;
    content: z.ZodObject<{
        type: z.ZodLiteral<"doc">;
        content: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodType<any, z.ZodTypeDef, any>, "many">>>;
    }, "strip", z.ZodTypeAny, {
        type: "doc";
        content: any[];
    }, {
        type: "doc";
        content?: any[] | undefined;
    }>;
    image_path: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    correct_answer: z.ZodObject<{
        type: z.ZodLiteral<"doc">;
        content: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodType<any, z.ZodTypeDef, any>, "many">>>;
    }, "strip", z.ZodTypeAny, {
        type: "doc";
        content: any[];
    }, {
        type: "doc";
        content?: any[] | undefined;
    }>;
    difficulty: z.ZodDefault<z.ZodNumber>;
    question_type: z.ZodDefault<z.ZodEnum<["SINGLE_CHOICE", "MULTIPLE_CHOICE", "FILL_IN_BLANK", "PROGRAMMING", "LISTENING"]>>;
    options: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodLiteral<"doc">;
        content: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodType<any, z.ZodTypeDef, any>, "many">>>;
    }, "strip", z.ZodTypeAny, {
        type: "doc";
        content: any[];
    }, {
        type: "doc";
        content?: any[] | undefined;
    }>, "many">>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    question_number: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    origin: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    origin_detail: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    source: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    created_by: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    imported_from_error_log: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    imported_student: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    solution_content: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        type: z.ZodLiteral<"doc">;
        content: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodType<any, z.ZodTypeDef, any>, "many">>>;
    }, "strip", z.ZodTypeAny, {
        type: "doc";
        content: any[];
    }, {
        type: "doc";
        content?: any[] | undefined;
    }>>>;
    search_text_content: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    created_at: z.ZodOptional<z.ZodString>;
    updated_at: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    tag_names: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    content: {
        type: "doc";
        content: any[];
    };
    level: "JHS" | "SHS" | "VCS";
    question_id: number;
    subject_id: number;
    chapter: string;
    correct_answer: {
        type: "doc";
        content: any[];
    };
    difficulty: number;
    question_type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "FILL_IN_BLANK" | "PROGRAMMING" | "LISTENING";
    source: string | null;
    options?: {
        type: "doc";
        content: any[];
    }[] | undefined;
    created_at?: string | undefined;
    updated_at?: string | undefined;
    image_path?: string | null | undefined;
    metadata?: Record<string, any> | undefined;
    question_number?: string | null | undefined;
    origin?: string | null | undefined;
    origin_detail?: string | null | undefined;
    created_by?: number | null | undefined;
    imported_from_error_log?: number | null | undefined;
    imported_student?: number | null | undefined;
    solution_content?: {
        type: "doc";
        content: any[];
    } | null | undefined;
    search_text_content?: string | null | undefined;
    tags?: number[] | undefined;
    tag_names?: string[] | undefined;
}, {
    content: {
        type: "doc";
        content?: any[] | undefined;
    };
    level: "JHS" | "SHS" | "VCS";
    question_id: number;
    subject_id: number;
    chapter: string;
    correct_answer: {
        type: "doc";
        content?: any[] | undefined;
    };
    options?: {
        type: "doc";
        content?: any[] | undefined;
    }[] | undefined;
    created_at?: string | undefined;
    updated_at?: string | undefined;
    image_path?: string | null | undefined;
    difficulty?: number | undefined;
    question_type?: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "FILL_IN_BLANK" | "PROGRAMMING" | "LISTENING" | undefined;
    metadata?: Record<string, any> | undefined;
    question_number?: string | null | undefined;
    origin?: string | null | undefined;
    origin_detail?: string | null | undefined;
    source?: string | null | undefined;
    created_by?: number | null | undefined;
    imported_from_error_log?: number | null | undefined;
    imported_student?: number | null | undefined;
    solution_content?: {
        type: "doc";
        content?: any[] | undefined;
    } | null | undefined;
    search_text_content?: string | null | undefined;
    tags?: number[] | undefined;
    tag_names?: string[] | undefined;
}>;
export type Question = z.infer<typeof QuestionSchema>;
/**
 * 創建題目 DTO Schema
 */
export declare const CreateQuestionSchema: z.ZodObject<{
    options: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodLiteral<"doc">;
        content: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodType<any, z.ZodTypeDef, any>, "many">>>;
    }, "strip", z.ZodTypeAny, {
        type: "doc";
        content: any[];
    }, {
        type: "doc";
        content?: any[] | undefined;
    }>, "many">>>;
    content: z.ZodObject<{
        type: z.ZodLiteral<"doc">;
        content: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodType<any, z.ZodTypeDef, any>, "many">>>;
    }, "strip", z.ZodTypeAny, {
        type: "doc";
        content: any[];
    }, {
        type: "doc";
        content?: any[] | undefined;
    }>;
    level: z.ZodEnum<["JHS", "SHS", "VCS"]>;
    subject_id: z.ZodNumber;
    chapter: z.ZodString;
    image_path: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    correct_answer: z.ZodObject<{
        type: z.ZodLiteral<"doc">;
        content: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodType<any, z.ZodTypeDef, any>, "many">>>;
    }, "strip", z.ZodTypeAny, {
        type: "doc";
        content: any[];
    }, {
        type: "doc";
        content?: any[] | undefined;
    }>;
    difficulty: z.ZodDefault<z.ZodNumber>;
    question_type: z.ZodDefault<z.ZodEnum<["SINGLE_CHOICE", "MULTIPLE_CHOICE", "FILL_IN_BLANK", "PROGRAMMING", "LISTENING"]>>;
    metadata: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
    question_number: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    origin: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    origin_detail: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    source: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>>;
    created_by: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    imported_from_error_log: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    imported_student: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    solution_content: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodObject<{
        type: z.ZodLiteral<"doc">;
        content: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodType<any, z.ZodTypeDef, any>, "many">>>;
    }, "strip", z.ZodTypeAny, {
        type: "doc";
        content: any[];
    }, {
        type: "doc";
        content?: any[] | undefined;
    }>>>>;
}, "strip", z.ZodTypeAny, {
    content: {
        type: "doc";
        content: any[];
    };
    level: "JHS" | "SHS" | "VCS";
    subject_id: number;
    chapter: string;
    correct_answer: {
        type: "doc";
        content: any[];
    };
    difficulty: number;
    question_type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "FILL_IN_BLANK" | "PROGRAMMING" | "LISTENING";
    options?: {
        type: "doc";
        content: any[];
    }[] | undefined;
    image_path?: string | null | undefined;
    metadata?: Record<string, any> | undefined;
    question_number?: string | null | undefined;
    origin?: string | null | undefined;
    origin_detail?: string | null | undefined;
    source?: string | null | undefined;
    created_by?: number | null | undefined;
    imported_from_error_log?: number | null | undefined;
    imported_student?: number | null | undefined;
    solution_content?: {
        type: "doc";
        content: any[];
    } | null | undefined;
}, {
    content: {
        type: "doc";
        content?: any[] | undefined;
    };
    level: "JHS" | "SHS" | "VCS";
    subject_id: number;
    chapter: string;
    correct_answer: {
        type: "doc";
        content?: any[] | undefined;
    };
    options?: {
        type: "doc";
        content?: any[] | undefined;
    }[] | undefined;
    image_path?: string | null | undefined;
    difficulty?: number | undefined;
    question_type?: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "FILL_IN_BLANK" | "PROGRAMMING" | "LISTENING" | undefined;
    metadata?: Record<string, any> | undefined;
    question_number?: string | null | undefined;
    origin?: string | null | undefined;
    origin_detail?: string | null | undefined;
    source?: string | null | undefined;
    created_by?: number | null | undefined;
    imported_from_error_log?: number | null | undefined;
    imported_student?: number | null | undefined;
    solution_content?: {
        type: "doc";
        content?: any[] | undefined;
    } | null | undefined;
}>;
export type CreateQuestionDto = z.infer<typeof CreateQuestionSchema>;
/**
 * 更新題目 DTO Schema
 */
export declare const UpdateQuestionSchema: z.ZodObject<Omit<{
    question_id: z.ZodOptional<z.ZodNumber>;
    subject_id: z.ZodOptional<z.ZodNumber>;
    level: z.ZodOptional<z.ZodEnum<["JHS", "SHS", "VCS"]>>;
    chapter: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodObject<{
        type: z.ZodLiteral<"doc">;
        content: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodType<any, z.ZodTypeDef, any>, "many">>>;
    }, "strip", z.ZodTypeAny, {
        type: "doc";
        content: any[];
    }, {
        type: "doc";
        content?: any[] | undefined;
    }>>;
    image_path: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    correct_answer: z.ZodOptional<z.ZodObject<{
        type: z.ZodLiteral<"doc">;
        content: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodType<any, z.ZodTypeDef, any>, "many">>>;
    }, "strip", z.ZodTypeAny, {
        type: "doc";
        content: any[];
    }, {
        type: "doc";
        content?: any[] | undefined;
    }>>;
    difficulty: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    question_type: z.ZodOptional<z.ZodDefault<z.ZodEnum<["SINGLE_CHOICE", "MULTIPLE_CHOICE", "FILL_IN_BLANK", "PROGRAMMING", "LISTENING"]>>>;
    options: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodLiteral<"doc">;
        content: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodType<any, z.ZodTypeDef, any>, "many">>>;
    }, "strip", z.ZodTypeAny, {
        type: "doc";
        content: any[];
    }, {
        type: "doc";
        content?: any[] | undefined;
    }>, "many">>>;
    metadata: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
    question_number: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    origin: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    origin_detail: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    source: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>>;
    created_by: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    imported_from_error_log: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    imported_student: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    solution_content: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodObject<{
        type: z.ZodLiteral<"doc">;
        content: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodType<any, z.ZodTypeDef, any>, "many">>>;
    }, "strip", z.ZodTypeAny, {
        type: "doc";
        content: any[];
    }, {
        type: "doc";
        content?: any[] | undefined;
    }>>>>;
    search_text_content: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    created_at: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    updated_at: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    tags: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>>;
    tag_names: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
}, "created_at" | "updated_at" | "question_id" | "search_text_content" | "tags" | "tag_names">, "strip", z.ZodTypeAny, {
    options?: {
        type: "doc";
        content: any[];
    }[] | undefined;
    content?: {
        type: "doc";
        content: any[];
    } | undefined;
    level?: "JHS" | "SHS" | "VCS" | undefined;
    subject_id?: number | undefined;
    chapter?: string | undefined;
    image_path?: string | null | undefined;
    correct_answer?: {
        type: "doc";
        content: any[];
    } | undefined;
    difficulty?: number | undefined;
    question_type?: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "FILL_IN_BLANK" | "PROGRAMMING" | "LISTENING" | undefined;
    metadata?: Record<string, any> | undefined;
    question_number?: string | null | undefined;
    origin?: string | null | undefined;
    origin_detail?: string | null | undefined;
    source?: string | null | undefined;
    created_by?: number | null | undefined;
    imported_from_error_log?: number | null | undefined;
    imported_student?: number | null | undefined;
    solution_content?: {
        type: "doc";
        content: any[];
    } | null | undefined;
}, {
    options?: {
        type: "doc";
        content?: any[] | undefined;
    }[] | undefined;
    content?: {
        type: "doc";
        content?: any[] | undefined;
    } | undefined;
    level?: "JHS" | "SHS" | "VCS" | undefined;
    subject_id?: number | undefined;
    chapter?: string | undefined;
    image_path?: string | null | undefined;
    correct_answer?: {
        type: "doc";
        content?: any[] | undefined;
    } | undefined;
    difficulty?: number | undefined;
    question_type?: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "FILL_IN_BLANK" | "PROGRAMMING" | "LISTENING" | undefined;
    metadata?: Record<string, any> | undefined;
    question_number?: string | null | undefined;
    origin?: string | null | undefined;
    origin_detail?: string | null | undefined;
    source?: string | null | undefined;
    created_by?: number | null | undefined;
    imported_from_error_log?: number | null | undefined;
    imported_student?: number | null | undefined;
    solution_content?: {
        type: "doc";
        content?: any[] | undefined;
    } | null | undefined;
}>;
export type UpdateQuestionDto = z.infer<typeof UpdateQuestionSchema>;
/**
 * 題目查詢參數 Schema
 */
export declare const QuestionQuerySchema: z.ZodObject<{
    subject: z.ZodOptional<z.ZodNumber>;
    level: z.ZodOptional<z.ZodEnum<["JHS", "SHS", "VCS"]>>;
    chapter: z.ZodOptional<z.ZodString>;
    question_type: z.ZodOptional<z.ZodEnum<["SINGLE_CHOICE", "MULTIPLE_CHOICE", "FILL_IN_BLANK", "PROGRAMMING", "LISTENING"]>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    search: z.ZodOptional<z.ZodString>;
    difficulty: z.ZodOptional<z.ZodNumber>;
    source: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    page_size: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    page_size: number;
    level?: "JHS" | "SHS" | "VCS" | undefined;
    search?: string | undefined;
    chapter?: string | undefined;
    difficulty?: number | undefined;
    question_type?: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "FILL_IN_BLANK" | "PROGRAMMING" | "LISTENING" | undefined;
    source?: string | undefined;
    tags?: number[] | undefined;
    subject?: number | undefined;
}, {
    level?: "JHS" | "SHS" | "VCS" | undefined;
    page?: number | undefined;
    search?: string | undefined;
    page_size?: number | undefined;
    chapter?: string | undefined;
    difficulty?: number | undefined;
    question_type?: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "FILL_IN_BLANK" | "PROGRAMMING" | "LISTENING" | undefined;
    source?: string | undefined;
    tags?: number[] | undefined;
    subject?: number | undefined;
}>;
export type QuestionQuery = z.infer<typeof QuestionQuerySchema>;
/**
 * 科目 Schema
 */
export declare const SubjectSchema: z.ZodObject<{
    subject_id: z.ZodNumber;
    name: z.ZodString;
    code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    subject_id: number;
    code?: string | null | undefined;
    description?: string | null | undefined;
}, {
    name: string;
    subject_id: number;
    code?: string | null | undefined;
    description?: string | null | undefined;
}>;
export type Subject = z.infer<typeof SubjectSchema>;
/**
 * 標籤 Schema
 */
export declare const TagSchema: z.ZodObject<{
    tag_id: z.ZodNumber;
    tag_name: z.ZodString;
    creator_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    tag_id: number;
    tag_name: string;
    creator_id?: number | null | undefined;
}, {
    tag_id: number;
    tag_name: string;
    creator_id?: number | null | undefined;
}>;
export type Tag = z.infer<typeof TagSchema>;
