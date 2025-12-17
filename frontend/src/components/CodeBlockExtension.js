import { CodeBlock } from '@tiptap/extension-code-block'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import CodeBlockComponent from './CodeBlockComponent.vue'

export const CodeBlockExtension = CodeBlock.extend({
  addNodeView() {
    return VueNodeViewRenderer(CodeBlockComponent)
  },

  addAttributes() {
    return {
      ...(this.parent?.() || {}),
      language: {
        default: 'javascript',
        parseHTML: element => element.getAttribute('data-language'),
        renderHTML: attributes => {
          if (!attributes.language) {
            return {}
          }
          return {
            'data-language': attributes.language,
          }
        },
      },
    }
  },
})
