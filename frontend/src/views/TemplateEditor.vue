<template>
  <div class="min-h-screen bg-slate-50 p-6">
    <div class="max-w-6xl mx-auto">
      <!-- 標題列 -->
      <header class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">
            {{ isEdit ? '編輯模板' : '新增模板' }}
          </h1>
          <p class="mt-1 text-sm text-slate-500">創建可重複使用的 Markdown + LaTeX 內容區塊</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="handleCancel"
            class="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            取消
          </button>
          <button
            @click="handleSave"
            :disabled="saving || !formData.title.trim()"
            class="rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ saving ? '儲存中...' : '儲存' }}
          </button>
        </div>
      </header>

      <!-- 表單內容 -->
      <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <!-- 標題輸入 -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">
            模板標題 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.title"
            type="text"
            placeholder="例如：二次函數標準式"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            required
          />
        </div>

        <!-- Markdown + LaTeX 編輯器 -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">
            內容 (Markdown + LaTeX) <span class="text-red-500">*</span>
          </label>
          <div class="space-y-3">
            <!-- 編輯區域 -->
            <div class="border border-slate-300 rounded-lg overflow-hidden">
              <MarkdownEditor
                v-model="formData.content"
                :placeholder="'輸入模板內容...\n\n支援 Markdown 語法：\n- **粗體**\n- *斜體*\n- `程式碼`\n\n支援 LaTeX 數學公式：\n- 行內公式：$x^2 + y^2 = r^2$\n- 區塊公式：$$\n\\int_0^1 x^2 dx = \\frac{1}{3}\n$$'"
              />
            </div>
            
            <!-- 預覽區域 -->
            <div class="border-t border-slate-200 pt-3">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-semibold text-slate-500 uppercase tracking-wide">即時預覽</span>
              </div>
              <div
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-slate-50 min-h-[200px] max-h-[400px] overflow-y-auto markdown-preview"
                v-html="renderedContent"
              ></div>
            </div>
          </div>
          <p class="mt-1 text-xs text-slate-500">
            提示：使用 $$...$$ 表示區塊公式，使用 $...$ 表示行內公式
          </p>
        </div>

        <!-- 標籤選擇 -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">標籤分類（可選）</label>
          <div class="border border-slate-300 rounded-lg p-3 min-h-[100px] max-h-[200px] overflow-y-auto">
            <div v-if="hashtags.length === 0" class="text-sm text-slate-400 text-center py-4">
              尚無標籤，可在題庫系統中新增標籤
            </div>
            <div v-else class="flex flex-wrap gap-2">
              <button
                v-for="tag in hashtags"
                :key="tag.tag_id"
                type="button"
                @click="toggleTag(tag.tag_id)"
                :class="[
                  'px-3 py-1 rounded-full text-xs font-semibold transition-all',
                  formData.tag_ids.includes(tag.tag_id)
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                ]"
              >
                #{{ tag.tag_name }}
                <span v-if="formData.tag_ids.includes(tag.tag_id)" class="ml-1">✓</span>
              </button>
            </div>
          </div>
          <p class="mt-1 text-xs text-slate-500">
            已選擇 {{ formData.tag_ids.length }} 個標籤
          </p>
        </div>

        <!-- 公開設定 -->
        <div class="flex items-center gap-2">
          <input
            v-model="formData.is_public"
            type="checkbox"
            id="is_public"
            class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label for="is_public" class="text-sm font-semibold text-slate-700">
            公開此模板（其他老師可以使用）
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { contentTemplateAPI, hashtagAPI } from '../services/api'
import MarkdownEditor from '../components/MarkdownEditor.vue'
import { useMarkdownRenderer } from '../composables/useMarkdownRenderer'

const route = useRoute()
const router = useRouter()
const { renderMarkdownWithLatex } = useMarkdownRenderer()

const isEdit = computed(() => !!route.params.id)
const saving = ref(false)
const hashtags = ref([])

const formData = ref({
  title: '',
  content: '',
  tag_ids: [],
  is_public: false
})

// 計算渲染後的內容（用於即時預覽）
const renderedContent = computed(() => renderMarkdownWithLatex(formData.value.content))

const fetchHashtags = async () => {
  try {
    const response = await hashtagAPI.getAll()
    const data = response.data.results || response.data
    hashtags.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.warn('獲取標籤失敗：', error)
  }
}

const fetchTemplate = async () => {
  if (!isEdit.value) return
  
  try {
    const response = await contentTemplateAPI.getById(route.params.id)
    const template = response.data
    
    formData.value.title = template.title || ''
    formData.value.is_public = template.is_public || false
    formData.value.tag_ids = template.tag_ids || []
    
    // 從 structure 中提取內容
    if (template.structure && Array.isArray(template.structure) && template.structure.length > 0) {
      // 合併所有 text 類型的區塊內容
      formData.value.content = template.structure
        .filter(block => block.type === 'text' && block.content)
        .map(block => block.content)
        .join('\n\n')
    }
  } catch (error) {
    console.error('獲取模板失敗：', error)
    alert('載入模板失敗，請稍後再試')
    router.push('/questions')
  }
}

const toggleTag = (tagId) => {
  const index = formData.value.tag_ids.indexOf(tagId)
  if (index > -1) {
    formData.value.tag_ids.splice(index, 1)
  } else {
    formData.value.tag_ids.push(tagId)
  }
}

const handleSave = async () => {
  if (!formData.value.title.trim()) {
    alert('請輸入模板標題')
    return
  }
  
  if (!formData.value.content.trim()) {
    alert('請輸入模板內容')
    return
  }

  saving.value = true
  try {
    // 將內容轉換為 structure 格式
    const structure = [
      {
        id: Date.now(),
        type: 'text',
        content: formData.value.content
      }
    ]
    
    const payload = {
      title: formData.value.title.trim(),
      structure: structure,
      tag_ids_input: formData.value.tag_ids,
      is_public: formData.value.is_public
    }
    
    let response
    if (isEdit.value) {
      response = await contentTemplateAPI.update(route.params.id, payload)
    } else {
      response = await contentTemplateAPI.create(payload)
    }
    
    alert('儲存成功！')
    router.push('/questions')
  } catch (error) {
    console.error('儲存失敗：', error)
    if (error.response?.data) {
      const errorMsg = typeof error.response.data === 'string' 
        ? error.response.data 
        : JSON.stringify(error.response.data)
      alert(`儲存失敗：${errorMsg}`)
    } else {
      alert('儲存失敗，請稍後再試')
    }
  } finally {
    saving.value = false
  }
}

const handleCancel = () => {
  if (confirm('確定要取消嗎？未儲存的變更將會遺失。')) {
    router.push('/questions')
  }
}

onMounted(() => {
  fetchHashtags()
  fetchTemplate()
})
</script>

<style scoped>
.markdown-preview {
  line-height: 1.6;
}
</style>





