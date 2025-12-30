<template>
  <div class="min-h-screen bg-slate-50 p-6">
    <div class="max-w-6xl mx-auto">
      <!-- 頂部工具列 -->
      <header class="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm mb-6 rounded-lg">
        <div class="flex items-center gap-4">
          <button @click="handleCancel" class="text-slate-500 hover:text-indigo-600 transition-colors" title="返回">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div class="flex flex-col">
            <h1 class="text-lg font-bold text-slate-800 leading-tight">
              {{ isEdit ? '編輯模板' : '新增模板' }}
            </h1>
            <p class="text-sm text-slate-500 mt-1">創建可重複使用的 Markdown + LaTeX 內容區塊</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            @click="handleCancel"
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            取消
          </button>
          <button
            @click="handleSave"
            :disabled="saving || !formData.title.trim()"
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
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

        <!-- Block Editor -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">
            內容 <span class="text-red-500">*</span>
          </label>
          <div class="space-y-3">
            <div class="border border-slate-300 rounded-lg overflow-hidden">
              <BlockEditor
                :model-value="tiptapStructure"
                @update:model-value="handleBlockEditorUpdate"
                :templates="[]"
                :questions="[]"
                :auto-page-break="false"
                paper-size="A4"
              />
            </div>
          </div>
          <p class="mt-1 text-xs text-slate-500">
            提示：輸入 / 查看所有可用的區塊類型
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
import BlockEditor from '../components/BlockEditor/BlockEditor.vue'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => !!route.params.id)
const saving = ref(false)
const hashtags = ref([])

const formData = ref({
  title: '',
  tag_ids: [],
  is_public: false
})

// Tiptap 格式的 structure（直接存儲，不轉換）
const tiptapStructure = ref({
  type: 'doc',
  content: [{ type: 'paragraph', content: [] }]
})

// 處理 BlockEditor 更新
const handleBlockEditorUpdate = (newStructure) => {
  tiptapStructure.value = newStructure
}

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
    
    // 統一使用 tiptap_structure
    if (template.tiptap_structure && template.tiptap_structure.type === 'doc') {
      tiptapStructure.value = template.tiptap_structure
    } else {
      // 如果沒有 tiptap_structure，使用空結構
      tiptapStructure.value = {
        type: 'doc',
        content: [{ type: 'paragraph', content: [] }]
      }
    }
  } catch (error) {
    console.error('獲取模板失敗：', error)
    alert('載入模板失敗，請稍後再試')
    const returnTab = route.query.returnTab || 'questions'
    router.push({ path: '/questions', query: { tab: returnTab } })
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
  
  // 檢查是否有內容
  const hasContent = tiptapStructure.value && 
                     tiptapStructure.value.content && 
                     tiptapStructure.value.content.length > 0 &&
                     tiptapStructure.value.content.some(node => {
                       // 原子節點（如 image, imagePlaceholder, questionBlock 等）沒有 content，但本身就有意義
                       const isAtomNode = ['image', 'imagePlaceholder', 'questionBlock', 'templateBlock', 'latexBlock', 'diagram2DBlock', 'diagram3DBlock', 'circuitBlock', 'pageBreak'].includes(node.type)
                       // 有內容的節點（如 paragraph, heading 等）
                       const hasNodeContent = node.content && node.content.length > 0
                       return isAtomNode || hasNodeContent
                     })
  
  if (!hasContent) {
    alert('請輸入模板內容')
    return
  }

  saving.value = true
  try {
    const payload = {
      title: formData.value.title.trim(),
      tiptap_structure: tiptapStructure.value,
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
    const returnTab = route.query.returnTab || 'questions'
    router.push({ path: '/questions', query: { tab: returnTab } })
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
    const returnTab = route.query.returnTab || 'questions'
    router.push({ path: '/questions', query: { tab: returnTab } })
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









