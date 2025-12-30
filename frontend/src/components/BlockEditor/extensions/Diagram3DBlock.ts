import { Node, mergeAttributes, type NodeConfig } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import Diagram3DBlockComponent from '../components/Diagram3DBlockComponent.vue'

/**
 * Diagram 3D Block 節點的屬性類型
 */
export interface Diagram3DBlockAttributes {
  id: string | null
  config: Record<string, unknown>
}

/**
 * Diagram 3D Block 節點的默認屬性
 */
const defaultAttributes: Diagram3DBlockAttributes = {
  id: null,
  config: {}
}

/**
 * 擴展 Tiptap Commands 類型
 */
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    diagram3dBlock: {
      /**
       * 插入 3D 圖表區塊
       */
      insertDiagram3DBlock: (attrs?: Partial<Diagram3DBlockAttributes>) => ReturnType
    }
  }
}

/**
 * Diagram 3D Block 節點擴展
 */
export const Diagram3DBlock = Node.create<NodeConfig<Diagram3DBlockAttributes>, Diagram3DBlockAttributes>({
  name: 'diagram3dBlock',

  group: 'block',

  content: 'block*',

  defining: true,

  addAttributes(): Record<keyof Diagram3DBlockAttributes, any> {
    return {
      id: {
        default: defaultAttributes.id,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-id'),
        renderHTML: (attributes: Diagram3DBlockAttributes) => {
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
        renderHTML: (attributes: Diagram3DBlockAttributes) => {
          return { 'data-config': JSON.stringify(attributes.config) }
        }
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="diagram3d-block"]'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'diagram3d-block' }), 0]
  },

  addNodeView() {
    return VueNodeViewRenderer(Diagram3DBlockComponent)
  },

  addCommands() {
    return {
      insertDiagram3DBlock: (attrs: Partial<Diagram3DBlockAttributes> = {}) => ({ commands }) => {
        const finalAttrs: Diagram3DBlockAttributes = {
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
