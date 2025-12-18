import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import CircuitBlockComponent from '../components/CircuitBlockComponent.vue'

export const CircuitBlock = Node.create({
  name: 'circuitBlock',

  group: 'block',

  content: 'block*',

  defining: true,

  addAttributes() {
    return {
      id: {
        default: null,
      },
      config: {
        default: {},
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="circuit-block"]',
      },
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
      insertCircuitBlock: (attrs = {}) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            config: {},
            ...attrs
          },
        })
      },
    }
  },
})
