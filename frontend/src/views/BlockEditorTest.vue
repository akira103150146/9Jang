<template>
  <div class="min-h-screen bg-slate-50 p-6">
    <div class="max-w-4xl mx-auto">
      <header class="mb-6">
        <h1 class="text-2xl font-bold text-slate-900">Block Editor 測試</h1>
        <p class="mt-1 text-sm text-slate-500">測試 Notion-like 樹狀編輯器功能</p>
        
        <!-- 智能貼上測試按鈕 -->
        <div class="mt-4 flex gap-2 flex-wrap">
          <button 
            @click="testSmartPaste('latex')"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
          >
            測試：純 LaTeX
          </button>
          <button 
            @click="testSmartPaste('mixed')"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
          >
            測試：混合內容
          </button>
          <button 
            @click="testSmartPaste('markdown')"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
          >
            測試：Markdown
          </button>
          <button 
            @click="testSmartPaste('question')"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
          >
            測試：題目格式
          </button>
        </div>
      </header>

      <div class="bg-white rounded-lg shadow-lg p-6">
        <BlockEditor
          v-model="content"
          :templates="templates"
          :questions="questions"
        />
      </div>

      <div class="mt-6 bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-lg font-bold mb-4">JSON 輸出</h2>
        <pre class="bg-slate-100 p-4 rounded text-xs overflow-auto max-h-96">{{ JSON.stringify(content, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BlockEditor from '../components/BlockEditor/BlockEditor.vue'
import { contentTemplateAPI, questionBankAPI } from '../services/api'

const content = ref({
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: []
    }
  ]
})

// 載入題目和模板
const questions = ref([])
const templates = ref([])

onMounted(async () => {
  try {
    // 載入題目
    const questionsResponse = await questionBankAPI.getAll()
    questions.value = questionsResponse.data.results || questionsResponse.data || []
    
    // 載入模板
    const templatesResponse = await contentTemplateAPI.getAll()
    templates.value = templatesResponse.data.results || templatesResponse.data || []
  } catch (error) {
    console.error('Failed to load questions/templates:', error)
  }
})

// 智能貼上測試功能
const testSmartPaste = (type) => {
  let testContent = ''
  
  switch (type) {
    case 'latex':
      // 純 LaTeX 測試
      testContent = `$$E = mc^2$$

這是一個區塊公式。

行內公式：$x^2 + y^2 = r^2$ 在文字中。

另一個區塊公式：
$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$`
      break
      
    case 'mixed':
      // 混合內容測試
      testContent = `# 第一章：三角函數

這是一個段落，包含行內公式 $\\sin^2\\theta + \\cos^2\\theta = 1$。

## 第一節：基本概念

另一個段落，公式 $x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$ 在文字中。

$$\\lim_{n \\to \\infty} \\sum_{i=1}^{n} \\frac{1}{i^2} = \\frac{\\pi^2}{6}$$

- 列表項目一
- 列表項目二包含公式 $f(x) = x^2$
- 列表項目三

1. 有序列表一
2. 有序列表二
3. 有序列表三`
      break
      
    case 'markdown':
      // Markdown 格式測試
      testContent = `# 一級標題

## 二級標題

### 三級標題

這是一個**粗體文字**和*斜體文字*的段落。

- 無序列表項目一
- 無序列表項目二
- 無序列表項目三

1. 有序列表項目一
2. 有序列表項目二
3. 有序列表項目三

**粗體**和*斜體*可以**組合**使用。`
      break
      
    case 'question':
      // 題目格式測試
      testContent = `**題型：單選題**

1. **【題號】：07107467 　　【難易度】：中**

> （　　）已知$\\frac{\\pi}{2} < \\theta < \\pi$，$\\cos\\theta = - \\frac{3}{5}$，則下列大小關係何者正確？
> (A)$\\cos\\theta < \\sin 2\\theta < \\cos 2\\theta < \\sin\\theta$
> (B)$\\sin 2\\theta < \\cos 2\\theta < \\cos\\theta < \\sin\\theta$
> (C)$\\sin 2\\theta < \\cos\\theta < \\cos 2\\theta < \\sin\\theta$
> (D)$\\cos\\theta < \\cos 2\\theta < \\sin 2\\theta < \\sin\\theta$

《答案》C

《解析》
$$\\sin 2\\theta = 2\\sin\\theta\\cos\\theta = 2 \\times \\frac{4}{5} \\times (- \\frac{3}{5}) = - \\frac{24}{25}$$
$$\\cos 2\\theta = \\cos^{2}\\theta - \\sin^{2}\\theta = (- \\frac{3}{5})^{2} - (\\frac{4}{5})^{2} = - \\frac{7}{25}$$
∴$\\sin 2\\theta < \\cos\\theta < \\cos 2\\theta < \\sin\\theta$`
      break
  }
  
  // 模擬貼上事件
  if (testContent) {
    // 創建一個臨時的 textarea 來模擬貼上
    const textarea = document.createElement('textarea')
    textarea.value = testContent
    document.body.appendChild(textarea)
    textarea.select()
    
    // 觸發貼上事件
    const pasteEvent = new ClipboardEvent('paste', {
      clipboardData: new DataTransfer()
    })
    pasteEvent.clipboardData.setData('text/plain', testContent)
    
    // 手動觸發編輯器的貼上處理
    // 注意：這需要編輯器實例，實際使用時應該通過編輯器 API
    document.execCommand('paste')
    
    document.body.removeChild(textarea)
    
    // 提示用戶手動貼上
    alert(`請將以下內容複製並貼上到編輯器中測試：\n\n${testContent}`)
  }
}
</script>
