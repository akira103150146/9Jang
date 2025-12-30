import { Node, mergeAttributes, type NodeConfig } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import LaTeXBlockComponent from '../components/LaTeXBlockComponent.vue'

/**
 * LaTeX Block 節點的屬性類型
 */
export interface LaTeXBlockAttributes {
  id: string | null
  formula: string
  displayMode: boolean
}

/**
 * LaTeX Block 節點的默認屬性
 */
const defaultAttributes: LaTeXBlockAttributes = {
  id: null,
  formula: '',
  displayMode: true
}

/**
 * 擴展 Tiptap Commands 類型
 * 使用模組擴展 (Module Augmentation) 添加自定義命令類型
 */
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    latexBlock: {
      /**
       * 插入 LaTeX Block
       */
      insertLatexBlock: (attrs?: Partial<LaTeXBlockAttributes>) => ReturnType
      /**
       * 設置 LaTeX Block 屬性
       */
      setLatexBlock: (attrs: Partial<LaTeXBlockAttributes>) => ReturnType
    }
  }
}

/**
 * LaTeX Block 節點擴展
 */
export const LaTeXBlock = Node.create<NodeConfig<LaTeXBlockAttributes>, LaTeXBlockAttributes>({
  name: 'latexBlock',

  group: 'block',

  content: 'block*',

  defining: true,

  addAttributes(): Record<keyof LaTeXBlockAttributes, any> {
    return {
      id: {
        default: defaultAttributes.id,
        parseHTML: (element) => element.getAttribute('data-id'),
        renderHTML: (attributes) => {
          if (!attributes.id) {
            return {}
          }
          return {
            'data-id': attributes.id
          }
        }
      },
      formula: {
        default: defaultAttributes.formula,
        parseHTML: (element) => element.getAttribute('data-formula') || '',
        renderHTML: (attributes) => {
          return {
            'data-formula': attributes.formula
          }
        }
      },
      displayMode: {
        default: defaultAttributes.displayMode,
        parseHTML: (element) => {
          const displayMode = element.getAttribute('data-display-mode')
          return displayMode !== null ? displayMode === 'true' : defaultAttributes.displayMode
        },
        renderHTML: (attributes) => {
          return {
            'data-display-mode': String(attributes.displayMode)
          }
        }
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="latex-block"]'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'latex-block' }), 0]
  },

  addNodeView() {
    return VueNodeViewRenderer(LaTeXBlockComponent)
  },

  addCommands() {
    return {
      insertLatexBlock: (attrs: Partial<LaTeXBlockAttributes> = {}) => ({ commands }) => {
        const finalAttrs: LaTeXBlockAttributes = {
          ...defaultAttributes,
          id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          ...attrs
        }
        return commands.insertContent({
          type: this.name,
          attrs: finalAttrs
        })
      },

      setLatexBlock: (attrs: Partial<LaTeXBlockAttributes>) => ({ commands }) => {
        return commands.setNode(this.name, attrs)
      }
    }
  }
})
