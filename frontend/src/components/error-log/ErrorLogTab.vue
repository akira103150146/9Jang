<template>
  <div>
    <!-- 統計卡片 -->
    <section class="grid gap-4 md:grid-cols-4">
      <div class="rounded-3xl border border-purple-100 bg-white p-5 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">總錯題數</p>
        <p class="mt-2 text-3xl font-bold text-slate-900">{{ errorLogs.length }}</p>
      </div>
      <div class="rounded-3xl border border-rose-100 bg-white p-5 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">新錯題</p>
        <p class="mt-2 text-3xl font-bold text-rose-600">
          {{ errorLogs.filter(e => e.review_status === 'New').length }}
        </p>
      </div>
      <div class="rounded-3xl border border-amber-100 bg-white p-5 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">複習中</p>
        <p class="mt-2 text-3xl font-bold text-amber-600">
          {{ errorLogs.filter(e => e.review_status === 'Reviewing').length }}
        </p>
      </div>
      <div class="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">已掌握</p>
        <p class="mt-2 text-3xl font-bold text-emerald-600">
          {{ errorLogs.filter(e => e.review_status === 'Mastered').length }}
        </p>
      </div>
    </section>

    <!-- 錯題列表 -->
    <section class="rounded-3xl border border-slate-100 bg-white shadow-sm mt-6">
      <div class="p-5 border-b border-slate-100">
        <h3 class="text-lg font-semibold text-slate-900">錯題列表</h3>
        <p class="text-sm text-slate-500">點擊題目查看詳情，點擊狀態更新複習進度</p>
      </div>

      <div v-if="loading" class="p-12 text-center">
        <p class="text-slate-500">載入中...</p>
      </div>

      <div v-else-if="errorLogs.length === 0" class="p-12 text-center">
        <p class="text-slate-500">目前沒有錯題記錄。</p>
        <button
          @click="$emit('open-add-modal')"
          class="mt-4 rounded-full bg-purple-500 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-600"
        >
          新增錯題
        </button>
      </div>

      <div v-else class="divide-y divide-slate-100">
        <div
          v-for="errorLog in errorLogs"
          :key="errorLog.error_log_id"
          class="p-5 transition hover:bg-slate-50/70 cursor-pointer"
          @click="$emit('view-detail', errorLog)"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <span
                  class="rounded-full px-3 py-1 text-xs font-semibold"
                  :class="getStatusColor(errorLog.review_status)"
                >
                  {{ getReviewStatusDisplay(errorLog.review_status) }}
                </span>
                <span class="text-xs text-slate-500">
                  {{ errorLog.question_subject }} / {{ errorLog.question_level }}
                </span>
              </div>
              <h4 class="text-lg font-semibold text-slate-900 mb-1">
                {{ errorLog.question_chapter || `題目 #${errorLog.question}` }}
              </h4>
              <div class="text-sm text-slate-600 mb-3 line-clamp-2 markdown-preview" v-html="getQuestionContentDisplay(errorLog)"></div>
              <div class="flex items-center gap-4 text-xs text-slate-500">
                <span>錯誤次數：<strong class="text-slate-900">{{ errorLog.error_count }}</strong></span>
              </div>
            </div>
            <div class="ml-4 flex gap-2">
              <button
                @click.stop="$emit('update-status', errorLog)"
                class="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-600"
              >
                更新狀態
              </button>
              <button
                @click.stop="$emit('increment-count', errorLog)"
                class="rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600"
              >
                +1 次錯誤
              </button>
              <button
                @click.stop="$emit('delete', errorLog)"
                class="rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-600"
              >
                刪除
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { ErrorLog } from '../../composables/useErrorLog'
import { useMarkdownRenderer } from '../../composables/useMarkdownRenderer'
import { useTiptapConverter } from '../../composables/useTiptapConverter'

interface Props {
  errorLogs: ErrorLog[]
  loading: boolean
  questions: Array<{ question_id: number; [key: string]: unknown }>
}

const props = defineProps<Props>()

defineEmits<{
  'open-add-modal': []
  'view-detail': [errorLog: ErrorLog]
  'update-status': [errorLog: ErrorLog]
  'increment-count': [errorLog: ErrorLog]
  'delete': [errorLog: ErrorLog]
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

const getQuestionContent = (questionId: number) => {
  const question = props.questions.find(q => q.question_id === questionId)
  if (!question) return '載入中...'
  return contentToMarkdown(question.content as never)
}

const getQuestionContentDisplay = (errorLog: ErrorLog) => {
  if (errorLog.question_content) {
    return renderMarkdownWithLatex(errorLog.question_content as string)
  }
  return renderMarkdownWithLatex(getQuestionContent(errorLog.question))
}
</script>

<style scoped>
.markdown-preview {
  line-height: 1.6;
}
</style>

