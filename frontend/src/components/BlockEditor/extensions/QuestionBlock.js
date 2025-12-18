import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import QuestionBlockComponent from '../components/QuestionBlockComponent.vue'

export const QuestionBlock = Node.create({
  name: 'questionBlock',

  group: 'block',

  content: 'block*',

  defining: true,

  addAttributes() {
    return {
      id: {
        default: null,
      },
      questionId: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="question-block"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'question-block' }), 0]
  },

  addNodeView() {
    return VueNodeViewRenderer(QuestionBlockComponent)
  },

  addCommands() {
    return {
      insertQuestionBlock: (attrs = {}) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            questionId: null,
            ...attrs
          },
        })
      },
    }
  },
})
