import type { Editor } from '@tiptap/core'
import type { Range } from '@tiptap/core'

/**
 * 命令項類型
 */
export interface CommandItem {
  title: string
  icon: string
  description: string
  command: (options: { editor: Editor; range: Range }) => void | Promise<void>
  keywords: string[]
}

/**
 * 命令項列表
 */
export const commandItems: CommandItem[] = [
  {
    title: '文字',
    icon: '📝',
    description: '插入段落區塊',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('paragraph')
        .run()
    },
    keywords: ['text', 'paragraph', '文字', '段落', 'p']
  },
  {
    title: '標題 1',
    icon: 'H1',
    description: '大標題',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 1 })
        .run()
    },
    keywords: ['h1', 'heading', '標題', 'title']
  },
  {
    title: '標題 2',
    icon: 'H2',
    description: '中標題',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 2 })
        .run()
    },
    keywords: ['h2', 'heading', '標題']
  },
  {
    title: '標題 3',
    icon: 'H3',
    description: '小標題',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 3 })
        .run()
    },
    keywords: ['h3', 'heading', '標題']
  },
  {
    title: 'LaTeX 公式',
    icon: '∑',
    description: '插入數學公式',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertLatexBlock()
        .run()
    },
    keywords: ['latex', 'math', '公式', '數學', 'formula']
  },
  {
    title: '模板',
    icon: '📄',
    description: '插入模板內容',
    command: async ({ editor, range }) => {
      // 刪除 /template 文字
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .run()

      // 觸發打開模板選擇器事件
      const event = new CustomEvent('openTemplateSelector', {
        detail: {
          onSelect: async (templateId: number) => {
            // 載入模板並插入內容
            try {
              const { contentTemplateAPI } = await import('../../../services/api')
              const response = await contentTemplateAPI.getById(templateId)
              const template = response.data

              if (template.tiptap_structure && template.tiptap_structure.type === 'doc' && template.tiptap_structure.content) {
                // 將模板的 content 插入到編輯器中
                editor.chain().focus().insertContent(template.tiptap_structure.content).run()

                // 等待 DOM 更新完成，確保 AutoPageBreak 能正確計算位置
                await new Promise((resolve) => setTimeout(resolve, 100))

                // 將游標移到插入內容的末尾
                const { state } = editor
                const docSize = state.doc.content.size
                editor.chain().focus().setTextSelection(docSize).run()
              } else {
                console.warn('模板沒有有效的 tiptap_structure 內容')
              }
            } catch (error) {
              console.error('載入模板失敗:', error)
            }
          }
        }
      })
      window.dispatchEvent(event)
    },
    keywords: ['template', '模板']
  },
  {
    title: '2D 圖形',
    icon: '📊',
    description: '插入 2D 圖形',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertDiagram2DBlock()
        .run()
    },
    keywords: ['diagram', '2d', '圖形', '圖表', 'graph']
  },
  {
    title: '3D 圖形',
    icon: '🎲',
    description: '插入 3D 圖形',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertDiagram3DBlock()
        .run()
    },
    keywords: ['diagram', '3d', '立體', '3D']
  },
  {
    title: '電路圖',
    icon: '⚡',
    description: '插入電路圖',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertCircuitBlock()
        .run()
    },
    keywords: ['circuit', '電路', 'electronics']
  },
  {
    title: '無序列表',
    icon: '•',
    description: '插入列表',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleBulletList()
        .run()
    },
    keywords: ['ul', 'list', '列表', 'bullet']
  },
  {
    title: '有序列表',
    icon: '1.',
    description: '插入編號列表',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleOrderedList()
        .run()
    },
    keywords: ['ol', 'list', '列表', 'number', '編號']
  },
  {
    title: '引用',
    icon: '❝',
    description: '插入引用區塊',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleBlockquote()
        .run()
    },
    keywords: ['quote', '引用', 'blockquote']
  },
  {
    title: '程式碼',
    icon: '</>',
    description: '插入程式碼區塊',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleCodeBlock()
        .run()
    },
    keywords: ['code', '程式碼', 'codeblock']
  },
  {
    title: '題目',
    icon: '❓',
    description: '插入題目區塊',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertQuestionBlock()
        .run()
    },
    keywords: ['question', '題目', 'q']
  },
  {
    title: '大題標題',
    icon: '📋',
    description: '插入大題分組標題',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertSectionBlock()
        .run()
    },
    keywords: ['section', '大題', '標題', '分組', 'group']
  },
  {
    title: '圖片',
    icon: '🖼️',
    description: '插入圖片',
    command: ({ editor, range }) => {
      // 刪除 /image 文字
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .run()

      // 觸發打開圖片選擇器事件
      const event = new CustomEvent('openImageSelector', {
        detail: {
          placeholderNode: null,
          onSelect: (selectedUrl: string) => {
            // 在當前游標位置插入圖片
            const imageNode = {
              type: 'image',
              attrs: {
                src: selectedUrl,
                alt: '',
                title: ''
              }
            }
            editor.chain().focus().insertContent(imageNode).run()
          }
        }
      })
      window.dispatchEvent(event)
    },
    keywords: ['image', 'img', '圖片', 'photo', 'picture']
  },
  {
    title: '分頁',
    icon: '📄',
    description: '插入分頁符號',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertPageBreak()
        .run()
    },
    keywords: ['page', 'break', '分頁', 'pagebreak']
  }
]

