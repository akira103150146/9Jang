import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import TemplateBlockComponent from '../components/TemplateBlockComponent.vue'

export const TemplateBlock = Node.create({
  name: 'templateBlock',

  group: 'block',

  content: 'block*',

  defining: true,

  addAttributes() {
    return {
      id: {
        default: null,
      },
      templateId: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="template-block"]',
      },
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
      insertTemplateBlock: (attrs = {}) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            templateId: null,
            ...attrs
          },
        })
      },
    }
  },
})
