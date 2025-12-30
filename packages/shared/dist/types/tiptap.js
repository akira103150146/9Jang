"use strict";
/**
 * Tiptap JSON 結構類型定義
 * 定義 Tiptap 編輯器使用的 JSON 文檔結構
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TiptapDocumentSchema = exports.TiptapBlockContentSchema = exports.TiptapInlineContentSchema = exports.TiptapImagePlaceholderNodeSchema = exports.TiptapPageBreakNodeSchema = exports.TiptapSectionBlockNodeSchema = exports.TiptapTemplateBlockNodeSchema = exports.TiptapDiagram3DBlockNodeSchema = exports.TiptapDiagram2DBlockNodeSchema = exports.TiptapCircuitBlockNodeSchema = exports.TiptapQuestionBlockNodeSchema = exports.TiptapImageNodeSchema = exports.TiptapInlineLatexNodeSchema = exports.TiptapLatexBlockNodeSchema = exports.TiptapHeadingNodeSchema = exports.TiptapParagraphNodeSchema = exports.TiptapAttrsSchema = exports.TiptapTextNodeSchema = void 0;
const zod_1 = require("zod");
/**
 * Tiptap 文本節點 Schema
 */
exports.TiptapTextNodeSchema = zod_1.z.object({
    type: zod_1.z.literal('text'),
    text: zod_1.z.string(),
    marks: zod_1.z.array(zod_1.z.any()).optional()
});
/**
 * Tiptap 屬性類型（用於所有節點）
 */
exports.TiptapAttrsSchema = zod_1.z.record(zod_1.z.any()).optional();
/**
 * Tiptap 段落節點 Schema
 */
exports.TiptapParagraphNodeSchema = zod_1.z.lazy(() => zod_1.z.object({
    type: zod_1.z.literal('paragraph'),
    attrs: exports.TiptapAttrsSchema,
    content: zod_1.z.array(exports.TiptapInlineContentSchema).optional()
}));
/**
 * Tiptap 標題節點 Schema
 */
exports.TiptapHeadingNodeSchema = zod_1.z.lazy(() => zod_1.z.object({
    type: zod_1.z.literal('heading'),
    attrs: zod_1.z.object({
        level: zod_1.z.number().int().min(1).max(6).optional()
    }).optional(),
    content: zod_1.z.array(exports.TiptapInlineContentSchema).optional()
}));
/**
 * Tiptap LaTeX Block 節點 Schema
 */
exports.TiptapLatexBlockNodeSchema = zod_1.z.lazy(() => zod_1.z.object({
    type: zod_1.z.literal('latexBlock'),
    attrs: zod_1.z.object({
        id: zod_1.z.string().nullable().optional(),
        formula: zod_1.z.string().optional().default(''),
        displayMode: zod_1.z.boolean().optional().default(true)
    }).optional(),
    content: zod_1.z.array(exports.TiptapBlockContentSchema).optional()
}));
/**
 * Tiptap Inline LaTeX 節點 Schema
 */
exports.TiptapInlineLatexNodeSchema = zod_1.z.object({
    type: zod_1.z.literal('inlineLatex'),
    attrs: zod_1.z.object({
        formula: zod_1.z.string().optional().default('')
    }).optional()
});
/**
 * Tiptap Image 節點 Schema
 */
exports.TiptapImageNodeSchema = zod_1.z.object({
    type: zod_1.z.literal('image'),
    attrs: zod_1.z.object({
        src: zod_1.z.string().optional(),
        alt: zod_1.z.string().optional(),
        title: zod_1.z.string().optional(),
        width: zod_1.z.number().optional(),
        height: zod_1.z.number().optional()
    }).optional()
});
/**
 * Tiptap Question Block 節點 Schema
 */
exports.TiptapQuestionBlockNodeSchema = zod_1.z.lazy(() => zod_1.z.object({
    type: zod_1.z.literal('questionBlock'),
    attrs: zod_1.z.object({
        questionId: zod_1.z.number().int().positive().optional(),
        questionNumber: zod_1.z.number().int().positive().optional()
    }).optional(),
    content: zod_1.z.array(exports.TiptapBlockContentSchema).optional()
}));
/**
 * Tiptap Circuit Block 節點 Schema（電路圖）
 */
exports.TiptapCircuitBlockNodeSchema = zod_1.z.lazy(() => zod_1.z.object({
    type: zod_1.z.literal('circuitBlock'),
    attrs: zod_1.z.object({
        id: zod_1.z.string().nullable().optional(),
        circuitData: zod_1.z.record(zod_1.z.any()).optional() // 電路圖的 JSON 數據結構
    }).optional(),
    content: zod_1.z.array(exports.TiptapBlockContentSchema).optional()
}));
/**
 * Tiptap Diagram 2D Block 節點 Schema
 */
exports.TiptapDiagram2DBlockNodeSchema = zod_1.z.lazy(() => zod_1.z.object({
    type: zod_1.z.literal('diagram2DBlock'),
    attrs: zod_1.z.object({
        id: zod_1.z.string().nullable().optional(),
        diagramData: zod_1.z.record(zod_1.z.any()).optional() // 2D 圖形的 JSON 數據
    }).optional(),
    content: zod_1.z.array(exports.TiptapBlockContentSchema).optional()
}));
/**
 * Tiptap Diagram 3D Block 節點 Schema
 */
exports.TiptapDiagram3DBlockNodeSchema = zod_1.z.lazy(() => zod_1.z.object({
    type: zod_1.z.literal('diagram3DBlock'),
    attrs: zod_1.z.object({
        id: zod_1.z.string().nullable().optional(),
        diagramData: zod_1.z.record(zod_1.z.any()).optional() // 3D 圖形的 JSON 數據
    }).optional(),
    content: zod_1.z.array(exports.TiptapBlockContentSchema).optional()
}));
/**
 * Tiptap Template Block 節點 Schema
 */
exports.TiptapTemplateBlockNodeSchema = zod_1.z.lazy(() => zod_1.z.object({
    type: zod_1.z.literal('templateBlock'),
    attrs: zod_1.z.object({
        templateId: zod_1.z.number().int().positive().optional()
    }).optional(),
    content: zod_1.z.array(exports.TiptapBlockContentSchema).optional()
}));
/**
 * Tiptap Section Block 節點 Schema
 */
exports.TiptapSectionBlockNodeSchema = zod_1.z.lazy(() => zod_1.z.object({
    type: zod_1.z.literal('sectionBlock'),
    attrs: exports.TiptapAttrsSchema,
    content: zod_1.z.array(exports.TiptapBlockContentSchema).optional()
}));
/**
 * Tiptap Page Break 節點 Schema
 */
exports.TiptapPageBreakNodeSchema = zod_1.z.object({
    type: zod_1.z.literal('pageBreak'),
    attrs: exports.TiptapAttrsSchema
});
/**
 * Tiptap Image Placeholder 節點 Schema
 */
exports.TiptapImagePlaceholderNodeSchema = zod_1.z.lazy(() => zod_1.z.object({
    type: zod_1.z.literal('imagePlaceholder'),
    attrs: zod_1.z.object({
        id: zod_1.z.string().nullable().optional(),
        placeholderId: zod_1.z.string().optional()
    }).optional(),
    content: zod_1.z.array(exports.TiptapBlockContentSchema).optional()
}));
/**
 * Tiptap 行內內容 Schema（文本、行內 LaTeX、行內圖片等）
 */
exports.TiptapInlineContentSchema = zod_1.z.union([
    exports.TiptapTextNodeSchema,
    exports.TiptapInlineLatexNodeSchema,
    exports.TiptapImageNodeSchema
]);
/**
 * Tiptap 區塊內容 Schema（段落、標題、LaTeX Block、Question Block 等）
 */
exports.TiptapBlockContentSchema = zod_1.z.lazy(() => zod_1.z.union([
    exports.TiptapParagraphNodeSchema,
    exports.TiptapHeadingNodeSchema,
    exports.TiptapLatexBlockNodeSchema,
    exports.TiptapQuestionBlockNodeSchema,
    exports.TiptapCircuitBlockNodeSchema,
    exports.TiptapDiagram2DBlockNodeSchema,
    exports.TiptapDiagram3DBlockNodeSchema,
    exports.TiptapTemplateBlockNodeSchema,
    exports.TiptapSectionBlockNodeSchema,
    exports.TiptapPageBreakNodeSchema,
    exports.TiptapImagePlaceholderNodeSchema,
    // 允許其他未知節點類型（向後兼容）
    zod_1.z.object({
        type: zod_1.z.string(),
        attrs: zod_1.z.any().optional(),
        content: zod_1.z.array(exports.TiptapBlockContentSchema).optional()
    })
]));
/**
 * Tiptap 文檔 Schema（最頂層）
 */
exports.TiptapDocumentSchema = zod_1.z.object({
    type: zod_1.z.literal('doc'),
    content: zod_1.z.array(exports.TiptapBlockContentSchema).optional().default([])
});
