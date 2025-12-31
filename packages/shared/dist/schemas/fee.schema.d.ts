import { z } from 'zod';
/**
 * 費用 Schema
 * 對應後端 CramschoolExtraFee 模型
 */
export declare const FeeSchema: z.ZodObject<{
    fee_id: z.ZodNumber;
    student_id: z.ZodNumber;
    item: z.ZodString;
    amount: z.ZodNumber;
    fee_date: z.ZodString;
    payment_status: z.ZodDefault<z.ZodEnum<["Paid", "Unpaid", "Partial"]>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    paid_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    is_deleted: z.ZodDefault<z.ZodBoolean>;
    deleted_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    student_name: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    student_id: number;
    is_deleted: boolean;
    fee_id: number;
    item: string;
    amount: number;
    fee_date: string;
    payment_status: "Paid" | "Unpaid" | "Partial";
    notes?: string | null | undefined;
    deleted_at?: string | null | undefined;
    student_name?: string | undefined;
    paid_at?: string | null | undefined;
}, {
    student_id: number;
    fee_id: number;
    item: string;
    amount: number;
    fee_date: string;
    notes?: string | null | undefined;
    is_deleted?: boolean | undefined;
    deleted_at?: string | null | undefined;
    student_name?: string | undefined;
    payment_status?: "Paid" | "Unpaid" | "Partial" | undefined;
    paid_at?: string | null | undefined;
}>;
export type Fee = z.infer<typeof FeeSchema>;
/**
 * 創建費用 DTO Schema
 */
export declare const CreateFeeSchema: z.ZodObject<{
    student_id: z.ZodNumber;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    item: z.ZodString;
    amount: z.ZodNumber;
    fee_date: z.ZodString;
    payment_status: z.ZodDefault<z.ZodEnum<["Paid", "Unpaid", "Partial"]>>;
} & {
    paid_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    student_id: number;
    item: string;
    amount: number;
    fee_date: string;
    payment_status: "Paid" | "Unpaid" | "Partial";
    notes?: string | null | undefined;
    paid_at?: string | null | undefined;
}, {
    student_id: number;
    item: string;
    amount: number;
    fee_date: string;
    notes?: string | null | undefined;
    payment_status?: "Paid" | "Unpaid" | "Partial" | undefined;
    paid_at?: string | null | undefined;
}>;
export type CreateFeeDto = z.infer<typeof CreateFeeSchema>;
/**
 * 更新費用 DTO Schema
 */
export declare const UpdateFeeSchema: z.ZodObject<{
    student_id: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    item: z.ZodOptional<z.ZodString>;
    amount: z.ZodOptional<z.ZodNumber>;
    fee_date: z.ZodOptional<z.ZodString>;
    payment_status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["Paid", "Unpaid", "Partial"]>>>;
    paid_at: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    student_id?: number | undefined;
    notes?: string | null | undefined;
    item?: string | undefined;
    amount?: number | undefined;
    fee_date?: string | undefined;
    payment_status?: "Paid" | "Unpaid" | "Partial" | undefined;
    paid_at?: string | null | undefined;
}, {
    student_id?: number | undefined;
    notes?: string | null | undefined;
    item?: string | undefined;
    amount?: number | undefined;
    fee_date?: string | undefined;
    payment_status?: "Paid" | "Unpaid" | "Partial" | undefined;
    paid_at?: string | null | undefined;
}>;
export type UpdateFeeDto = z.infer<typeof UpdateFeeSchema>;
/**
 * 批次更新費用狀態 DTO Schema
 */
export declare const BatchUpdateFeeStatusSchema: z.ZodObject<{
    fee_ids: z.ZodArray<z.ZodNumber, "many">;
    payment_status: z.ZodEnum<["Paid", "Unpaid", "Partial"]>;
}, "strip", z.ZodTypeAny, {
    payment_status: "Paid" | "Unpaid" | "Partial";
    fee_ids: number[];
}, {
    payment_status: "Paid" | "Unpaid" | "Partial";
    fee_ids: number[];
}>;
export type BatchUpdateFeeStatusDto = z.infer<typeof BatchUpdateFeeStatusSchema>;
/**
 * 費用查詢參數 Schema
 */
export declare const FeeQuerySchema: z.ZodObject<{
    student: z.ZodOptional<z.ZodNumber>;
    include_deleted: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    include_deleted?: boolean | undefined;
    student?: number | undefined;
}, {
    include_deleted?: boolean | undefined;
    student?: number | undefined;
}>;
export type FeeQuery = z.infer<typeof FeeQuerySchema>;
