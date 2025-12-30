import { Node, mergeAttributes, type NodeConfig } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import QuestionBlockComponent from '../components/QuestionBlockComponent.vue'

/**
 * Question Block 節點的屬性類型
 */
export interface QuestionBlockAttributes {
  id: string | null
  questionId: number | null
}

/**
 * Question Block 節點的默認屬性
 */
const defaultAttributes: QuestionBlockAttributes = {
  id: null,
  questionId: null
}

/**
 * 擴展 Tiptap Commands 類型
 */
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    questionBlock: {
      /**
       * 插入問題區塊
       */
      insertQuestionBlock: (attrs?: Partial<QuestionBlockAttributes>) => ReturnType
    }
  }
}

/**
 * Question Block 節點擴展
 */
export const QuestionBlock = Node.create<NodeConfig<QuestionBlockAttributes>, QuestionBlockAttributes>({
  name: 'questionBlock',

  group: 'block',

  content: 'block*',

  defining: true,

  addAttributes(): Record<keyof QuestionBlockAttributes, any> {
    return {
      id: {
        default: defaultAttributes.id,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-id'),
        renderHTML: (attributes: QuestionBlockAttributes) => {
          if (!attributes.id) {
            return {}
          }
          return {
            'data-id': attributes.id
          }
        }
      },
      questionId: {
        default: defaultAttributes.questionId,
        parseHTML: (element: HTMLElement) => {
          const questionId = element.getAttribute('data-question-id')
          return questionId ? parseInt(questionId, 10) : null
        },
        renderHTML: (attributes: QuestionBlockAttributes) => {
          if (!attributes.questionId) {
            return {}
          }
          return {
            'data-question-id': String(attributes.questionId)
          }
        }
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="question-block"]'
      }
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
      insertQuestionBlock: (attrs: Partial<QuestionBlockAttributes> = {}) => ({ commands }) => {
        const finalAttrs: QuestionBlockAttributes = {
          ...defaultAttributes,
          id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          ...attrs
        }
        return commands.insertContent({
          type: this.name,
          attrs: finalAttrs
        })
      }
    }
  }
})
