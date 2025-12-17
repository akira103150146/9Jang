import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import LatexFormulaNode from './LatexFormulaNode.vue'

export const LatexFormulaExtension = Node.create({
  name: 'latexFormula',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      latex: {
        default: '',
      },
      displayMode: {
        default: true, // true = block, false = inline
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="latex-formula"]',
        getAttrs: (node) => {
          return {
            latex: node.getAttribute('data-latex') || '',
            displayMode: node.getAttribute('data-display-mode') === 'true',
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, {
      'data-type': 'latex-formula',
      'data-latex': HTMLAttributes.latex,
      'data-display-mode': HTMLAttributes.displayMode,
    }), 0]
  },

  addNodeView() {
    return VueNodeViewRenderer(LatexFormulaNode)
  },

  addCommands() {
    return {
      setLatexFormula: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        })
      },
    }
  },
})
