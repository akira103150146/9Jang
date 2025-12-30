import { Node, mergeAttributes, type NodeConfig } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import Diagram2DBlockComponent from '../components/Diagram2DBlockComponent.vue'

/**
 * Diagram 2D Block 節點的屬性類型
 */
export interface Diagram2DBlockAttributes {
  id: string | null
  config: Record<string, unknown>
}

/**
 * Diagram 2D Block 節點的默認屬性
 */
const defaultAttributes: Diagram2DBlockAttributes = {
  id: null,
  config: {}
}

/**
 * 擴展 Tiptap Commands 類型
 */
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    diagram2dBlock: {
      /**
       * 插入 2D 圖表區塊
       */
      insertDiagram2DBlock: (attrs?: Partial<Diagram2DBlockAttributes>) => ReturnType
    }
  }
}

/**
 * Diagram 2D Block 節點擴展
 */
export const Diagram2DBlock = Node.create<NodeConfig<Diagram2DBlockAttributes>, Diagram2DBlockAttributes>({
  name: 'diagram2dBlock',

  group: 'block',

  content: 'block*',

  defining: true,

  addAttributes(): Record<keyof Diagram2DBlockAttributes, any> {
    return {
      id: {
        default: defaultAttributes.id,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-id'),
        renderHTML: (attributes: Diagram2DBlockAttributes) => {
          return attributes.id ? { 'data-id': attributes.id } : {}
        }
      },
      config: {
        default: defaultAttributes.config,
        parseHTML: (element: HTMLElement) => {
          const configAttr = element.getAttribute('data-config')
          if (configAttr) {
            try {
              return JSON.parse(configAttr)
            } catch {
              return {}
            }
          }
          return {}
        },
        renderHTML: (attributes: Diagram2DBlockAttributes) => {
          return { 'data-config': JSON.stringify(attributes.config) }
        }
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="diagram2d-block"]'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'diagram2d-block' }), 0]
  },

  addNodeView() {
    return VueNodeViewRenderer(Diagram2DBlockComponent)
  },

  addCommands() {
    return {
      insertDiagram2DBlock: (attrs: Partial<Diagram2DBlockAttributes> = {}) => ({ commands }) => {
        const finalAttrs: Diagram2DBlockAttributes = {
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
