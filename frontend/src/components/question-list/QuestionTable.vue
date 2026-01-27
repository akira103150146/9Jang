<template>
  <div ref="questionsContainer">
    <!-- 空狀態 -->
    <div v-if="!loading && questions.length === 0" class="text-center py-12 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
      尚無題目，點擊右上角新增
    </div>
    
    <!-- 題目列表（始終渲染，loading 時顯示遮罩） -->
    <div v-if="questions.length > 0" class="relative">
      <!-- 加載遮罩（覆蓋在內容上方，不改變內容高度） -->
      <div
        v-if="loading"
        class="absolute inset-0 z-10 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-lg pointer-events-none"
      >
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
          <p class="text-sm text-slate-600">載入中...</p>
        </div>
      </div>
      
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6" :class="{ 'opacity-60': loading }">
        <div
          v-for="question in questions"
          :key="question.question_id"
          @click="$emit('show-preview', question)"
          class="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
        >
          <div class="flex items-start justify-between mb-2">
            <span
              class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset"
              :class="getTypeColor(question.question_type)"
            >
              {{ getTypeName(question.question_type) }}
            </span>
            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button @click.stop="$emit('edit', question.question_id)" class="p-1 text-slate-400 hover:text-indigo-600" title="編輯">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <button @click.stop="$emit('delete', question.question_id)" class="p-1 text-slate-400 hover:text-rose-600" title="刪除">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          <h3 class="text-base font-bold text-slate-900 mb-1 line-clamp-1">
            Q{{ question.question_id }}
          </h3>

          <div class="text-xs text-slate-500 mb-2 flex items-center gap-2 flex-wrap">
            <span>{{ question.subject_name || '無科目' }}</span>
            <span>•</span>
            <span>{{ getLevelName(question.level) }}</span>
            <span>•</span>
            <span>{{ question.chapter || '無章節' }}</span>
            <span v-if="question.source_display || question.source">•</span>
            <span v-if="question.source_display || question.source" class="text-indigo-600 font-medium">
              {{ question.source_display || question.source || '九章自命題' }}
            </span>
          </div>

          <div class="text-sm text-slate-700 mb-3 line-clamp-3">
            {{ getContentPreview(question.content) }}
          </div>

          <div class="flex items-center justify-between mt-auto">
            <div class="flex items-center gap-2">
              <div class="flex items-center">
                <span class="text-xs text-slate-500">難度：</span>
                <div class="flex ml-1">
                  <span v-for="i in 5" :key="i" class="text-xs" :class="i <= question.difficulty ? 'text-yellow-500' : 'text-slate-300'">★</span>
                </div>
              </div>
            </div>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="tag in (question.tags || []).slice(0, 3)"
                :key="tag"
                class="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded"
              >
                #{{ tag }}
              </span>
              <span v-if="(question.tags || []).length > 3" class="text-xs text-slate-400">
                +{{ (question.tags || []).length - 3 }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分頁控件 -->
    <div v-if="pagination.totalPages > 1 && questions.length > 0" class="flex items-center justify-center gap-2 mt-6">
      <button
        @click.prevent="$emit('go-to-page', pagination.currentPage - 1)"
        :disabled="pagination.currentPage === 1"
        class="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        type="button"
      >
        上一頁
      </button>
      <span class="text-sm text-slate-600">
        第 {{ pagination.currentPage }} / {{ pagination.totalPages }} 頁（共 {{ pagination.totalCount }} 題）
      </span>
      <button
        @click.prevent="$emit('go-to-page', pagination.currentPage + 1)"
        :disabled="pagination.currentPage === pagination.totalPages"
        class="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        type="button"
      >
        下一頁
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue'
import type { TiptapDocument } from '@9jang/shared'
import type { QuestionWithExtras, Pagination } from '../../composables/useQuestionList'

interface Props {
  questions: QuestionWithExtras[]
  loading: boolean
  pagination: Pagination
}

defineProps<Props>()

defineEmits<{
  'show-preview': [question: QuestionWithExtras]
  'edit': [id: number]
  'delete': [id: number]
  'go-to-page': [page: number]
}>()

const questionsContainer: Ref<HTMLElement | null> = ref(null)

const getTypeColor = (type: string): string => {
  const map: Record<string, string> = {
    SINGLE_CHOICE: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    MULTIPLE_CHOICE: 'bg-purple-50 text-purple-700 ring-purple-600/20',
    FILL_IN_BLANK: 'bg-green-50 text-green-700 ring-green-600/20',
    PROGRAMMING: 'bg-orange-50 text-orange-700 ring-orange-600/20',
    LISTENING: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20'
  }
  return map[type] || 'bg-slate-50 text-slate-700 ring-slate-600/20'
}

const getTypeName = (type: string): string => {
  const map: Record<string, string> = {
    SINGLE_CHOICE: '單選題',
    MULTIPLE_CHOICE: '多選題',
    FILL_IN_BLANK: '填充題',
    PROGRAMMING: '程式題',
    LISTENING: '聽力題'
  }
  return map[type] || type
}

const getLevelName = (level: string): string => {
  const map: Record<string, string> = {
    JHS: '國中',
    SHS: '高中',
    VCS: '高職'
  }
  return map[level] || level
}

interface TiptapNode {
  type: string
  text?: string
  content?: TiptapNode[]
  marks?: Array<{ type: string }>
  attrs?: Record<string, unknown>
}

// 從 Tiptap JSON 提取純文字的輔助函式
const extractTextFromTiptapJSON = (node: TiptapNode | unknown): string => {
  if (!node || typeof node !== 'object') return ''

  const n = node as TiptapNode
  let text = ''
  if (n.type === 'text' && n.text) {
    text = n.text
  }

  if (n.content && Array.isArray(n.content)) {
    for (const child of n.content) {
      text += extractTextFromTiptapJSON(child)
    }
  }

  return text
}

const getContentPreview = (content: TiptapDocument | string | unknown): string => {
  if (!content) return '無內容'

  // 如果是 Tiptap JSON 格式
  if (typeof content === 'object' && content !== null) {
    const c = content as TiptapDocument & { type?: string }
    // 檢查是否為 Tiptap JSON 格式
    if (c.type === 'doc') {
      const text = extractTextFromTiptapJSON(c as unknown as TiptapNode).trim()
      return text.length > 100 ? text.substring(0, 100) + '...' : text || '無內容'
    }
    // 如果是空物件或其他物件格式
    if (Object.keys(c).length === 0) {
      return '無內容'
    }
    // 嘗試提取文字（可能是其他格式的物件）
    try {
      const text = extractTextFromTiptapJSON(c as unknown as TiptapNode).trim()
      return text.length > 100 ? text.substring(0, 100) + '...' : text || '無內容'
    } catch (e) {
      return '無內容'
    }
  }

  // 如果是字串（舊格式，向後相容）
  if (typeof content === 'string') {
    // 移除 Markdown 格式標記
    const text = content
      .replace(/#{1,6}\s+/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/`/g, '')
      .replace(/\$/g, '')
      .trim()
    return text.length > 100 ? text.substring(0, 100) + '...' : text
  }

  return '無內容'
}
</script>
