import { Node, mergeAttributes, type NodeConfig } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import PageBreakBlockComponent from '../components/PageBreakBlockComponent.vue'

/**
 * Page Break Block 節點的屬性類型
 */
export interface PageBreakBlockAttributes {
  [key: string]: unknown
}

/**
 * 擴展 Tiptap Commands 類型
 */
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pageBreak: {
      /**
       * 插入換頁符
       */
      insertPageBreak: () => ReturnType
    }
  }
}

/**
 * Page Break Block 節點擴展
 */
export const PageBreakBlock = Node.create<NodeConfig<PageBreakBlockAttributes>, PageBreakBlockAttributes>({
  name: 'pageBreak',

  group: 'block',

  content: '',

  defining: true,

  addAttributes(): Record<string, any> {
    return {}
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="page-break"]'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'page-break' }), 0]
  },

  addNodeView() {
    return VueNodeViewRenderer(PageBreakBlockComponent)
  },

  addCommands() {
    return {
      insertPageBreak: () => ({ commands }) => {
        return commands.insertContent({
          type: this.name
        })
      }
    }
  }
})
