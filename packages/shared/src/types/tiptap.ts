/**
 * Tiptap JSON 結構類型定義
 * 定義 Tiptap 編輯器使用的 JSON 文檔結構
 */

import { z } from 'zod'

/**
 * Tiptap 文本節點 Schema
 */
export const TiptapTextNodeSchema = z.object({
  type: z.literal('text'),
  text: z.string(),
  marks: z.array(z.any()).optional()
})

/**
 * Tiptap 屬性類型（用於所有節點）
 */
export const TiptapAttrsSchema = z.record(z.any()).optional()

/**
 * Tiptap 段落節點 Schema
 */
export const TiptapParagraphNodeSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    type: z.literal('paragraph'),
    attrs: TiptapAttrsSchema,
    content: z.array(TiptapInlineContentSchema).optional()
  })
)

/**
 * Tiptap 標題節點 Schema
 */
export const TiptapHeadingNodeSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    type: z.literal('heading'),
    attrs: z.object({
      level: z.number().int().min(1).max(6).optional()
    }).optional(),
    content: z.array(TiptapInlineContentSchema).optional()
  })
)

/**
 * Tiptap LaTeX Block 節點 Schema
 */
export const TiptapLatexBlockNodeSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    type: z.literal('latexBlock'),
    attrs: z.object({
      id: z.string().nullable().optional(),
      formula: z.string().optional().default(''),
      displayMode: z.boolean().optional().default(true)
    }).optional(),
    content: z.array(TiptapBlockContentSchema).optional()
  })
)

/**
 * Tiptap Inline LaTeX 節點 Schema
 */
export const TiptapInlineLatexNodeSchema = z.object({
  type: z.literal('inlineLatex'),
  attrs: z.object({
    formula: z.string().optional().default('')
  }).optional()
})

/**
 * Tiptap Image 節點 Schema
 */
export const TiptapImageNodeSchema = z.object({
  type: z.literal('image'),
  attrs: z.object({
    src: z.string().optional(),
    alt: z.string().optional(),
    title: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional()
  }).optional()
})

/**
 * Tiptap Question Block 節點 Schema
 */
export const TiptapQuestionBlockNodeSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    type: z.literal('questionBlock'),
    attrs: z.object({
      questionId: z.number().int().positive().optional(),
      questionNumber: z.number().int().positive().optional()
    }).optional(),
    content: z.array(TiptapBlockContentSchema).optional()
  })
)

/**
 * Tiptap Circuit Block 節點 Schema（電路圖）
 */
export const TiptapCircuitBlockNodeSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    type: z.literal('circuitBlock'),
    attrs: z.object({
      id: z.string().nullable().optional(),
      circuitData: z.record(z.any()).optional() // 電路圖的 JSON 數據結構
    }).optional(),
    content: z.array(TiptapBlockContentSchema).optional()
  })
)

/**
 * Tiptap Diagram 2D Block 節點 Schema
 */
export const TiptapDiagram2DBlockNodeSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    type: z.literal('diagram2DBlock'),
    attrs: z.object({
      id: z.string().nullable().optional(),
      diagramData: z.record(z.any()).optional() // 2D 圖形的 JSON 數據
    }).optional(),
    content: z.array(TiptapBlockContentSchema).optional()
  })
)

/**
 * Tiptap Diagram 3D Block 節點 Schema
 */
export const TiptapDiagram3DBlockNodeSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    type: z.literal('diagram3DBlock'),
    attrs: z.object({
      id: z.string().nullable().optional(),
      diagramData: z.record(z.any()).optional() // 3D 圖形的 JSON 數據
    }).optional(),
    content: z.array(TiptapBlockContentSchema).optional()
  })
)

/**
 * Tiptap Template Block 節點 Schema
 */
export const TiptapTemplateBlockNodeSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    type: z.literal('templateBlock'),
    attrs: z.object({
      templateId: z.number().int().positive().optional()
    }).optional(),
    content: z.array(TiptapBlockContentSchema).optional()
  })
)

/**
 * Tiptap Section Block 節點 Schema
 */
export const TiptapSectionBlockNodeSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    type: z.literal('sectionBlock'),
    attrs: TiptapAttrsSchema,
    content: z.array(TiptapBlockContentSchema).optional()
  })
)

/**
 * Tiptap Page Break 節點 Schema
 */
export const TiptapPageBreakNodeSchema = z.object({
  type: z.literal('pageBreak'),
  attrs: TiptapAttrsSchema
})

/**
 * Tiptap Image Placeholder 節點 Schema
 */
export const TiptapImagePlaceholderNodeSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    type: z.literal('imagePlaceholder'),
    attrs: z.object({
      id: z.string().nullable().optional(),
      placeholderId: z.string().optional()
    }).optional(),
    content: z.array(TiptapBlockContentSchema).optional()
  })
)

/**
 * Tiptap 行內內容 Schema（文本、行內 LaTeX、行內圖片等）
 */
export const TiptapInlineContentSchema = z.union([
  TiptapTextNodeSchema,
  TiptapInlineLatexNodeSchema,
  TiptapImageNodeSchema
])

/**
 * Tiptap 區塊內容 Schema（段落、標題、LaTeX Block、Question Block 等）
 */
export const TiptapBlockContentSchema: z.ZodType<any> = z.lazy(() =>
  z.union([
    TiptapParagraphNodeSchema,
    TiptapHeadingNodeSchema,
    TiptapLatexBlockNodeSchema,
    TiptapQuestionBlockNodeSchema,
    TiptapCircuitBlockNodeSchema,
    TiptapDiagram2DBlockNodeSchema,
    TiptapDiagram3DBlockNodeSchema,
    TiptapTemplateBlockNodeSchema,
    TiptapSectionBlockNodeSchema,
    TiptapPageBreakNodeSchema,
    TiptapImagePlaceholderNodeSchema,
    // 允許其他未知節點類型（向後兼容）
    z.object({
      type: z.string(),
      attrs: z.any().optional(),
      content: z.array(TiptapBlockContentSchema).optional()
    })
  ])
)

/**
 * Tiptap 文檔 Schema（最頂層）
 */
export const TiptapDocumentSchema = z.object({
  type: z.literal('doc'),
  content: z.array(TiptapBlockContentSchema).optional().default([])
})

/**
 * TypeScript 類型定義（從 Zod Schema 自動推斷）
 */
export type TiptapTextNode = z.infer<typeof TiptapTextNodeSchema>
export type TiptapParagraphNode = z.infer<typeof TiptapParagraphNodeSchema>
export type TiptapHeadingNode = z.infer<typeof TiptapHeadingNodeSchema>
export type TiptapLatexBlockNode = z.infer<typeof TiptapLatexBlockNodeSchema>
export type TiptapInlineLatexNode = z.infer<typeof TiptapInlineLatexNodeSchema>
export type TiptapImageNode = z.infer<typeof TiptapImageNodeSchema>
export type TiptapQuestionBlockNode = z.infer<typeof TiptapQuestionBlockNodeSchema>
export type TiptapCircuitBlockNode = z.infer<typeof TiptapCircuitBlockNodeSchema>
export type TiptapDiagram2DBlockNode = z.infer<typeof TiptapDiagram2DBlockNodeSchema>
export type TiptapDiagram3DBlockNode = z.infer<typeof TiptapDiagram3DBlockNodeSchema>
export type TiptapTemplateBlockNode = z.infer<typeof TiptapTemplateBlockNodeSchema>
export type TiptapSectionBlockNode = z.infer<typeof TiptapSectionBlockNodeSchema>
export type TiptapPageBreakNode = z.infer<typeof TiptapPageBreakNodeSchema>
export type TiptapImagePlaceholderNode = z.infer<typeof TiptapImagePlaceholderNodeSchema>
export type TiptapInlineContent = z.infer<typeof TiptapInlineContentSchema>
export type TiptapBlockContent = z.infer<typeof TiptapBlockContentSchema>
export type TiptapDocument = z.infer<typeof TiptapDocumentSchema>
