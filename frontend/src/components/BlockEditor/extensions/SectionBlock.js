import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import SectionBlockComponent from '../components/SectionBlockComponent.vue'

export const SectionBlock = Node.create({
  name: 'sectionBlock',

  group: 'block',

  content: 'block*',

  defining: true,

  addAttributes() {
    return {
      id: {
        default: null,
      },
      title: {
        default: '',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="section-block"]',
      },
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
      insertSectionBlock: (attrs = {}) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: '',
            ...attrs
          },
        })
      },
    }
  },
})
