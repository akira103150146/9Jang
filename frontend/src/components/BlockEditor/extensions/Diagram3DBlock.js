import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import Diagram3DBlockComponent from '../components/Diagram3DBlockComponent.vue'

export const Diagram3DBlock = Node.create({
  name: 'diagram3dBlock',

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
        tag: 'div[data-type="diagram3d-block"]',
      },
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
      insertDiagram3DBlock: (attrs = {}) => ({ commands }) => {
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
