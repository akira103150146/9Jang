import { Node, mergeAttributes, type NodeConfig } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import InlineLatexComponent from '../components/InlineLatexComponent.vue'

/**
 * 行內 LaTeX 節點的屬性類型
 */
export interface InlineLatexAttributes {
  formula: string
}

/**
 * 行內 LaTeX 節點的默認屬性
 */
const defaultAttributes: InlineLatexAttributes = {
  formula: ''
}

/**
 * 擴展 Tiptap Commands 類型
 */
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    inlineLatex: {
      /**
       * 插入行內 LaTeX
       */
      insertInlineLatex: (attrs?: Partial<InlineLatexAttributes>) => ReturnType
    }
  }
}

/**
 * 行內 LaTeX Node
 * 用於在段落中顯示行內數學公式
 */
export const InlineLatex = Node.create<NodeConfig<InlineLatexAttributes>, InlineLatexAttributes>({
  name: 'inlineLatex',

  group: 'inline',

  inline: true,

  atom: true,

  // 添加屬性
  addAttributes(): Record<keyof InlineLatexAttributes, any> {
    return {
      formula: {
        default: defaultAttributes.formula,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-formula') || '',
        renderHTML: (attributes: InlineLatexAttributes) => {
          return {
            'data-formula': attributes.formula
          }
        }
      }
    }
  },

  // 解析 HTML
  parseHTML() {
    return [
      {
        tag: 'span[data-type="inline-latex"]'
      }
    ]
  },

  // 渲染為 HTML
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'inline-latex', class: 'inline-latex' }), 0]
  },

  // 使用 Vue 組件渲染
  addNodeView() {
    return VueNodeViewRenderer(InlineLatexComponent)
  }
})
