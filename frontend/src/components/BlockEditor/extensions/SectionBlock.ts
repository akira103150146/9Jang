import { Node, mergeAttributes, type NodeConfig } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import SectionBlockComponent from '../components/SectionBlockComponent.vue'

/**
 * Section Block 節點的屬性類型
 */
export interface SectionBlockAttributes {
  id: string | null
  title: string
}

/**
 * Section Block 節點的默認屬性
 */
const defaultAttributes: SectionBlockAttributes = {
  id: null,
  title: ''
}

/**
 * 擴展 Tiptap Commands 類型
 */
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    sectionBlock: {
      /**
       * 插入區塊區塊
       */
      insertSectionBlock: (attrs?: Partial<SectionBlockAttributes>) => ReturnType
    }
  }
}

/**
 * Section Block 節點擴展
 */
export const SectionBlock = Node.create<NodeConfig<SectionBlockAttributes>, SectionBlockAttributes>({
  name: 'sectionBlock',

  group: 'block',

  content: 'block*',

  defining: true,

  addAttributes(): Record<keyof SectionBlockAttributes, any> {
    return {
      id: {
        default: defaultAttributes.id,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-id'),
        renderHTML: (attributes: SectionBlockAttributes) => {
          if (!attributes.id) {
            return {}
          }
          return {
            'data-id': attributes.id
          }
        }
      },
      title: {
        default: defaultAttributes.title,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-title') || '',
        renderHTML: (attributes: SectionBlockAttributes) => {
          return {
            'data-title': attributes.title
          }
        }
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="section-block"]'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'section-block' }), 0]
  },

  addNodeView() {
    return VueNodeViewRenderer(SectionBlockComponent)
  },

  addCommands() {
    return {
      insertSectionBlock: (attrs: Partial<SectionBlockAttributes> = {}) => ({ commands }) => {
        const finalAttrs: SectionBlockAttributes = {
          ...defaultAttributes,
          id: `section-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          ...attrs
        }
        return commands.insertContent({
          type: this.name,
          attrs: finalAttrs
        })
      }
    }
  }
})
