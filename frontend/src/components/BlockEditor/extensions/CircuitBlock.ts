import { Node, mergeAttributes, type NodeConfig } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import CircuitBlockComponent from '../components/CircuitBlockComponent.vue'

/**
 * Circuit Block 節點的屬性類型
 */
export interface CircuitBlockAttributes {
  id: string | null
  config: Record<string, unknown>
}

/**
 * Circuit Block 節點的默認屬性
 */
const defaultAttributes: CircuitBlockAttributes = {
  id: null,
  config: {}
}

/**
 * 擴展 Tiptap Commands 類型
 */
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    circuitBlock: {
      /**
       * 插入電路圖區塊
       */
      insertCircuitBlock: (attrs?: Partial<CircuitBlockAttributes>) => ReturnType
    }
  }
}

/**
 * Circuit Block 節點擴展
 */
export const CircuitBlock = Node.create<NodeConfig<CircuitBlockAttributes>, CircuitBlockAttributes>({
  name: 'circuitBlock',

  group: 'block',

  content: 'block*',

  defining: true,

  addAttributes(): Record<keyof CircuitBlockAttributes, any> {
    return {
      id: {
        default: defaultAttributes.id,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-id'),
        renderHTML: (attributes: CircuitBlockAttributes) => {
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
        renderHTML: (attributes: CircuitBlockAttributes) => {
          return { 'data-config': JSON.stringify(attributes.config) }
        }
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="circuit-block"]'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'circuit-block' }), 0]
  },

  addNodeView() {
    return VueNodeViewRenderer(CircuitBlockComponent)
  },

  addCommands() {
    return {
      insertCircuitBlock: (attrs: Partial<CircuitBlockAttributes> = {}) => ({ commands }) => {
        const finalAttrs: CircuitBlockAttributes = {
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
