import { Node, mergeAttributes, type NodeConfig } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import TemplateBlockComponent from '../components/TemplateBlockComponent.vue'

/**
 * Template Block 節點的屬性類型
 */
export interface TemplateBlockAttributes {
  id: string | null
  templateId: number | null
}

/**
 * Template Block 節點的默認屬性
 */
const defaultAttributes: TemplateBlockAttributes = {
  id: null,
  templateId: null
}

/**
 * 擴展 Tiptap Commands 類型
 */
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    templateBlock: {
      /**
       * 插入模板區塊
       */
      insertTemplateBlock: (attrs?: Partial<TemplateBlockAttributes>) => ReturnType
    }
  }
}

/**
 * Template Block 節點擴展
 */
export const TemplateBlock = Node.create<NodeConfig<TemplateBlockAttributes>, TemplateBlockAttributes>({
  name: 'templateBlock',

  group: 'block',

  content: 'block*',

  defining: true,

  addAttributes(): Record<keyof TemplateBlockAttributes, any> {
    return {
      id: {
        default: defaultAttributes.id,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-id'),
        renderHTML: (attributes: TemplateBlockAttributes) => {
          if (!attributes.id) {
            return {}
          }
          return {
            'data-id': attributes.id
          }
        }
      },
      templateId: {
        default: defaultAttributes.templateId,
        parseHTML: (element: HTMLElement) => {
          const templateId = element.getAttribute('data-template-id')
          return templateId ? parseInt(templateId, 10) : null
        },
        renderHTML: (attributes: TemplateBlockAttributes) => {
          if (!attributes.templateId) {
            return {}
          }
          return {
            'data-template-id': String(attributes.templateId)
          }
        }
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="template-block"]'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'template-block' }), 0]
  },

  addNodeView() {
    return VueNodeViewRenderer(TemplateBlockComponent)
  },

  addCommands() {
    return {
      insertTemplateBlock: (attrs: Partial<TemplateBlockAttributes> = {}) => ({ commands }) => {
        const finalAttrs: TemplateBlockAttributes = {
          ...defaultAttributes,
          id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
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
