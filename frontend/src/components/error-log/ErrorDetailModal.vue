<template>
  <div
    v-if="isOpen && selectedError"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
    @click.self="$emit('close')"
  >
    <div class="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold text-slate-900">錯題詳情</h3>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div v-if="questionDetail" class="space-y-4">
        <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div class="flex items-center gap-3 mb-3">
            <span
              class="rounded-full px-3 py-1 text-xs font-semibold"
              :class="getStatusColor(selectedError.review_status)"
            >
              {{ getReviewStatusDisplay(selectedError.review_status) }}
            </span>
            <span class="text-sm text-slate-600">
              {{ (questionDetail as { subject_name?: string }).subject_name }} / {{ getLevelDisplay((questionDetail as { level?: string }).level) }}
            </span>
            <span class="text-sm text-slate-600">錯誤次數：<strong>{{ selectedError.error_count }}</strong></span>
          </div>
          <h4 class="text-lg font-semibold text-slate-900 mb-2">{{ (questionDetail as { chapter?: string }).chapter }}</h4>
          <div class="text-sm text-slate-700 mb-3 markdown-preview" v-html="getQuestionContentDisplay(questionDetail)"></div>
          <div v-if="(questionDetail as { correct_answer?: unknown }).correct_answer" class="text-sm text-slate-600 markdown-preview">
            <span class="font-semibold">正確答案：</span>
            <span v-html="getAnswerContentDisplay(questionDetail)"></span>
          </div>
        </div>

        <div v-if="selectedError.images && selectedError.images.length > 0" class="rounded-lg border border-slate-200 bg-white p-4">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-semibold text-slate-700">錯題照片</h4>
            <span class="text-xs text-slate-500">{{ selectedError.images.length }} 張</span>
          </div>
          <div class="grid grid-cols-1 gap-4">
            <div v-for="img in selectedError.images" :key="img.image_id" class="flex justify-center">
              <ImageRotator 
                :image-url="(img as { image_url?: string; image_path?: string }).image_url || (img as { image_path?: string }).image_path || ''" 
                :alt="(img as { caption?: string }).caption || '錯題圖片'" 
              />
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            @click="$emit('close')"
            class="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            關閉
          </button>
          <button
            v-if="canImportToQuestionBank"
            @click="$emit('import-to-question-bank')"
            class="rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-600"
          >
            匯入題庫
          </button>
          <button
            @click="$emit('update-status', selectedError)"
            class="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-600"
          >
            更新狀態
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ErrorLog } from '../../composables/useErrorLog'
import ImageRotator from '../ImageRotator.vue'
import { useMarkdownRenderer } from '../../composables/useMarkdownRenderer'
import { useTiptapConverter } from '../../composables/useTiptapConverter'

interface Props {
  isOpen: boolean
  selectedError: ErrorLog | null
  questionDetail: unknown
  canImportToQuestionBank: boolean
}

const props = defineProps<Props>()

defineEmits<{
  close: []
  'import-to-question-bank': []
  'update-status': [errorLog: ErrorLog]
}>()

const { renderMarkdownWithLatex } = useMarkdownRenderer()
const { contentToMarkdown } = useTiptapConverter()

const getStatusColor = (status: string) => {
  const map: Record<string, string> = {
    New: 'bg-rose-50 text-rose-600',
    Reviewing: 'bg-amber-50 text-amber-600',
    Mastered: 'bg-emerald-50 text-emerald-600',
  }
  return map[status] ?? 'bg-slate-100 text-slate-700'
}

const getReviewStatusDisplay = (status: string) => {
  const map: Record<string, string> = {
    'New': '新錯題',
    'Reviewing': '複習中',
    'Mastered': '已掌握'
  }
  return map[status] || status
}

const getLevelDisplay = (level?: string) => {
  const map: Record<string, string> = {
    'JHS': '國中',
    'SHS': '高中',
    'VCS': '高職'
  }
  return level ? (map[level] || level) : ''
}

const getQuestionContentDisplay = (questionDetail: unknown) => {
  const detail = questionDetail as { content?: unknown }
  if (!detail.content) return ''
  return renderMarkdownWithLatex(contentToMarkdown(detail.content as never))
}

const getAnswerContentDisplay = (questionDetail: unknown) => {
  const detail = questionDetail as { correct_answer?: unknown }
  if (!detail.correct_answer) return ''
  return renderMarkdownWithLatex(contentToMarkdown(detail.correct_answer as never))
}
</script>

<style scoped>
.markdown-preview {
  line-height: 1.6;
}
</style>

