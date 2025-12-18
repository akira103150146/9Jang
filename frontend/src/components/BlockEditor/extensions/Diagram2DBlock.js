import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import Diagram2DBlockComponent from '../components/Diagram2DBlockComponent.vue'

export const Diagram2DBlock = Node.create({
  name: 'diagram2dBlock',

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
        tag: 'div[data-type="diagram2d-block"]',
      },
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
      insertDiagram2DBlock: (attrs = {}) => ({ commands }) => {
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
