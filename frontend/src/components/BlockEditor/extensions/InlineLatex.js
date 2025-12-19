import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import InlineLatexComponent from '../components/InlineLatexComponent.vue'

/**
 * 行內 LaTeX Node
 * 用於在段落中顯示行內數學公式
 */
export const InlineLatex = Node.create({
  name: 'inlineLatex',

  group: 'inline',

  inline: true,

  atom: true,

  // 添加屬性
  addAttributes() {
    return {
      formula: {
        default: '',
        parseHTML: element => element.getAttribute('data-formula'),
        renderHTML: attributes => {
          return {
            'data-formula': attributes.formula,
          }
        },
      },
    }
  },

  // 解析 HTML
  parseHTML() {
    return [
      {
        tag: 'span[data-type="inline-latex"]',
      },
    ]
  },

  // 渲染為 HTML
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'inline-latex', class: 'inline-latex' }), 0]
  },

  // 使用 Vue 組件渲染
  addNodeView() {
    return VueNodeViewRenderer(InlineLatexComponent)
  },
})
