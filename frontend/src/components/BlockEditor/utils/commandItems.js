export const commandItems = [
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
    description: '插入模板區塊',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTemplateBlock()
        .run()
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
  },
]
