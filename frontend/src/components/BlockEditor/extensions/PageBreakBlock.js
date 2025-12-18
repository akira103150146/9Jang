import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import PageBreakBlockComponent from '../components/PageBreakBlockComponent.vue'

export const PageBreakBlock = Node.create({
  name: 'pageBreak',

  group: 'block',

  content: '',

  defining: true,

  parseHTML() {
    return [
      {
        tag: 'div[data-type="page-break"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'page-break' }), 0]
  },

  addNodeView() {
    return VueNodeViewRenderer(PageBreakBlockComponent)
  },

  addCommands() {
    return {
      insertPageBreak: () => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
        })
      },
    }
  },
})
