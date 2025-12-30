<template>
  <div class="template-block">
    <div v-if="loading" class="text-sm text-slate-500 py-4 text-center">
      載入模板中...
    </div>
    <div v-else-if="error" class="text-sm text-red-500 py-4 text-center">
      載入模板失敗：{{ error }}
    </div>
    <div v-else-if="template" class="prose max-w-none markdown-preview">
      <div v-html="renderedContent"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, type Ref } from 'vue'
import { contentTemplateAPI } from '../services/api'
import { useMarkdownRenderer } from '../composables/useMarkdownRenderer'
import type { ContentTemplate } from '@9jang/shared'

interface Template {
  template_id: number
  structure?: Array<{ type: string; content?: string }>
  [key: string]: unknown
}

interface Props {
  templateId: number
  template_id?: number
}

const props = defineProps<Props>()

// 支援兩種 prop 名稱：templateId 和 template_id
const actualTemplateId = computed<number>(() => props.templateId || props.template_id || 0)

const { renderMarkdownWithLatex } = useMarkdownRenderer()

const template: Ref<Template | null> = ref(null)
const loading: Ref<boolean> = ref(true)
const error: Ref<string | null> = ref(null)

// 從 template 的 structure 中提取並渲染內容
const renderedContent = computed<string>(() => {
  if (!template.value || !template.value.structure) return ''

  // 合併所有 text 類型的區塊內容
  const content = template.value.structure
    .filter((block) => block.type === 'text' && block.content)
    .map((block) => block.content || '')
    .join('\n\n')

  return renderMarkdownWithLatex(content)
})

const fetchTemplate = async (): Promise<void> => {
  if (!actualTemplateId.value) {
    error.value = '缺少模板 ID'
    loading.value = false
    return
  }

  loading.value = true
  error.value = null

  try {
    const response = await contentTemplateAPI.getById(actualTemplateId.value)
    template.value = response.data as Template
  } catch (err) {
    console.error('載入模板失敗：', err)
    const axiosError = err as { response?: { data?: { detail?: string } }; message?: string }
    error.value = axiosError.response?.data?.detail || axiosError.message || '未知錯誤'
  } finally {
    loading.value = false
  }
}

// 監聽 templateId 變化
watch(
  actualTemplateId,
  () => {
    if (actualTemplateId.value) {
      fetchTemplate()
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (actualTemplateId.value) {
    fetchTemplate()
  }
})
</script>

<style scoped>
.template-block {
  min-height: 20px;
}

.markdown-preview {
  line-height: 1.6;
}
</style>

