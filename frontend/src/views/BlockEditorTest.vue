<template>
  <div class="min-h-screen bg-slate-50 p-6">
    <div class="max-w-4xl mx-auto">
      <header class="mb-6">
        <h1 class="text-2xl font-bold text-slate-900">Block Editor 測試</h1>
        <p class="mt-1 text-sm text-slate-500">測試 Notion-like 樹狀編輯器功能</p>
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
</script>
