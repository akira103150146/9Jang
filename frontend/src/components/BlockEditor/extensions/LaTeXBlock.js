import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import LaTeXBlockComponent from '../components/LaTeXBlockComponent.vue'

export const LaTeXBlock = Node.create({
  name: 'latexBlock',

  group: 'block',

  content: 'block*',

  defining: true,

  addAttributes() {
    return {
      id: {
        default: null,
      },
      formula: {
        default: '',
      },
      displayMode: {
        default: true,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="latex-block"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'latex-block' }), 0]
  },

  addNodeView() {
    return VueNodeViewRenderer(LaTeXBlockComponent)
  },

  addCommands() {
    return {
      insertLatexBlock: (attrs = {}) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            formula: '',
            displayMode: true,
            ...attrs
          },
        })
      },

      setLatexBlock: (attrs) => ({ commands }) => {
        return commands.setNode(this.name, attrs)
      },
    }
  },
})
