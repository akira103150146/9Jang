/**
 * Tiptap JSON 結構類型定義
 * 定義 Tiptap 編輯器使用的 JSON 文檔結構
 */
import { z } from 'zod';
/**
 * Tiptap 文本節點 Schema
 */
export declare const TiptapTextNodeSchema: z.ZodObject<{
    type: z.ZodLiteral<"text">;
    text: z.ZodString;
    marks: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "text";
    text: string;
    marks?: any[] | undefined;
}, {
    type: "text";
    text: string;
    marks?: any[] | undefined;
}>;
/**
 * Tiptap 屬性類型（用於所有節點）
 */
export declare const TiptapAttrsSchema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
/**
 * Tiptap 段落節點 Schema
 */
export declare const TiptapParagraphNodeSchema: z.ZodType<any>;
/**
 * Tiptap 標題節點 Schema
 */
export declare const TiptapHeadingNodeSchema: z.ZodType<any>;
/**
 * Tiptap LaTeX Block 節點 Schema
 */
export declare const TiptapLatexBlockNodeSchema: z.ZodType<any>;
/**
 * Tiptap Inline LaTeX 節點 Schema
 */
export declare const TiptapInlineLatexNodeSchema: z.ZodObject<{
    type: z.ZodLiteral<"inlineLatex">;
    attrs: z.ZodOptional<z.ZodObject<{
        formula: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        formula: string;
    }, {
        formula?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    type: "inlineLatex";
    attrs?: {
        formula: string;
    } | undefined;
}, {
    type: "inlineLatex";
    attrs?: {
        formula?: string | undefined;
    } | undefined;
}>;
/**
 * Tiptap Image 節點 Schema
 */
export declare const TiptapImageNodeSchema: z.ZodObject<{
    type: z.ZodLiteral<"image">;
    attrs: z.ZodOptional<z.ZodObject<{
        src: z.ZodOptional<z.ZodString>;
        alt: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        src?: string | undefined;
        alt?: string | undefined;
        title?: string | undefined;
        width?: number | undefined;
        height?: number | undefined;
    }, {
        src?: string | undefined;
        alt?: string | undefined;
        title?: string | undefined;
        width?: number | undefined;
        height?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    type: "image";
    attrs?: {
        src?: string | undefined;
        alt?: string | undefined;
        title?: string | undefined;
        width?: number | undefined;
        height?: number | undefined;
    } | undefined;
}, {
    type: "image";
    attrs?: {
        src?: string | undefined;
        alt?: string | undefined;
        title?: string | undefined;
        width?: number | undefined;
        height?: number | undefined;
    } | undefined;
}>;
/**
 * Tiptap Question Block 節點 Schema
 */
export declare const TiptapQuestionBlockNodeSchema: z.ZodType<any>;
/**
 * Tiptap Circuit Block 節點 Schema（電路圖）
 */
export declare const TiptapCircuitBlockNodeSchema: z.ZodType<any>;
/**
 * Tiptap Diagram 2D Block 節點 Schema
 */
export declare const TiptapDiagram2DBlockNodeSchema: z.ZodType<any>;
/**
 * Tiptap Diagram 3D Block 節點 Schema
 */
export declare const TiptapDiagram3DBlockNodeSchema: z.ZodType<any>;
/**
 * Tiptap Template Block 節點 Schema
 */
export declare const TiptapTemplateBlockNodeSchema: z.ZodType<any>;
/**
 * Tiptap Section Block 節點 Schema
 */
export declare const TiptapSectionBlockNodeSchema: z.ZodType<any>;
/**
 * Tiptap Page Break 節點 Schema
 */
export declare const TiptapPageBreakNodeSchema: z.ZodObject<{
    type: z.ZodLiteral<"pageBreak">;
    attrs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    type: "pageBreak";
    attrs?: Record<string, any> | undefined;
}, {
    type: "pageBreak";
    attrs?: Record<string, any> | undefined;
}>;
/**
 * Tiptap Image Placeholder 節點 Schema
 */
export declare const TiptapImagePlaceholderNodeSchema: z.ZodType<any>;
/**
 * Tiptap 行內內容 Schema（文本、行內 LaTeX、行內圖片等）
 */
export declare const TiptapInlineContentSchema: z.ZodUnion<[z.ZodObject<{
    type: z.ZodLiteral<"text">;
    text: z.ZodString;
    marks: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "text";
    text: string;
    marks?: any[] | undefined;
}, {
    type: "text";
    text: string;
    marks?: any[] | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"inlineLatex">;
    attrs: z.ZodOptional<z.ZodObject<{
        formula: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        formula: string;
    }, {
        formula?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    type: "inlineLatex";
    attrs?: {
        formula: string;
    } | undefined;
}, {
    type: "inlineLatex";
    attrs?: {
        formula?: string | undefined;
    } | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"image">;
    attrs: z.ZodOptional<z.ZodObject<{
        src: z.ZodOptional<z.ZodString>;
        alt: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        src?: string | undefined;
        alt?: string | undefined;
        title?: string | undefined;
        width?: number | undefined;
        height?: number | undefined;
    }, {
        src?: string | undefined;
        alt?: string | undefined;
        title?: string | undefined;
        width?: number | undefined;
        height?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    type: "image";
    attrs?: {
        src?: string | undefined;
        alt?: string | undefined;
        title?: string | undefined;
        width?: number | undefined;
        height?: number | undefined;
    } | undefined;
}, {
    type: "image";
    attrs?: {
        src?: string | undefined;
        alt?: string | undefined;
        title?: string | undefined;
        width?: number | undefined;
        height?: number | undefined;
    } | undefined;
}>]>;
/**
 * Tiptap 區塊內容 Schema（段落、標題、LaTeX Block、Question Block 等）
 */
export declare const TiptapBlockContentSchema: z.ZodType<any>;
/**
 * Tiptap 文檔 Schema（最頂層）
 */
export declare const TiptapDocumentSchema: z.ZodObject<{
    type: z.ZodLiteral<"doc">;
    content: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodType<any, z.ZodTypeDef, any>, "many">>>;
}, "strip", z.ZodTypeAny, {
    type: "doc";
    content: any[];
}, {
    type: "doc";
    content?: any[] | undefined;
}>;
/**
 * TypeScript 類型定義（從 Zod Schema 自動推斷）
 */
export type TiptapTextNode = z.infer<typeof TiptapTextNodeSchema>;
export type TiptapParagraphNode = z.infer<typeof TiptapParagraphNodeSchema>;
export type TiptapHeadingNode = z.infer<typeof TiptapHeadingNodeSchema>;
export type TiptapLatexBlockNode = z.infer<typeof TiptapLatexBlockNodeSchema>;
export type TiptapInlineLatexNode = z.infer<typeof TiptapInlineLatexNodeSchema>;
export type TiptapImageNode = z.infer<typeof TiptapImageNodeSchema>;
export type TiptapQuestionBlockNode = z.infer<typeof TiptapQuestionBlockNodeSchema>;
export type TiptapCircuitBlockNode = z.infer<typeof TiptapCircuitBlockNodeSchema>;
export type TiptapDiagram2DBlockNode = z.infer<typeof TiptapDiagram2DBlockNodeSchema>;
export type TiptapDiagram3DBlockNode = z.infer<typeof TiptapDiagram3DBlockNodeSchema>;
export type TiptapTemplateBlockNode = z.infer<typeof TiptapTemplateBlockNodeSchema>;
export type TiptapSectionBlockNode = z.infer<typeof TiptapSectionBlockNodeSchema>;
export type TiptapPageBreakNode = z.infer<typeof TiptapPageBreakNodeSchema>;
export type TiptapImagePlaceholderNode = z.infer<typeof TiptapImagePlaceholderNodeSchema>;
export type TiptapInlineContent = z.infer<typeof TiptapInlineContentSchema>;
export type TiptapBlockContent = z.infer<typeof TiptapBlockContentSchema>;
export type TiptapDocument = z.infer<typeof TiptapDocumentSchema>;
