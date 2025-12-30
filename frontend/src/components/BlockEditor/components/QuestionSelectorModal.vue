<template>
  <teleport to="body">
    <div v-if="modelValue" class="modal-overlay" @click.self="close">
      <div class="modal-container">
        <div class="modal-header">
          <h2 class="modal-title">選擇題目</h2>
          <button @click="close" class="btn-close">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 篩選區 -->
        <div class="filter-section">
          <div class="filter-row">
            <div class="filter-item">
              <label class="filter-label">科目</label>
              <select v-model="filters.subject" class="filter-select">
                <option value="">全部科目</option>
                <option v-for="subject in subjects" :key="subject" :value="subject">
                  {{ subject }}
                </option>
              </select>
            </div>
            <div class="filter-item">
              <label class="filter-label">章節</label>
              <input v-model="filters.chapter" type="text" class="filter-input" placeholder="輸入章節..." />
            </div>
            <div class="filter-item">
              <label class="filter-label">難度</label>
              <select v-model="filters.difficulty" class="filter-select">
                <option value="">全部難度</option>
                <option value="1">簡單</option>
                <option value="2">中等</option>
                <option value="3">困難</option>
              </select>
            </div>
          </div>
          
          <!-- 批次選擇數量 -->
          <div class="batch-select-section">
            <div class="batch-info">
              <span class="filtered-count">
                已載入: {{ filteredQuestions.length }} / {{ questionsPagination.totalCount }} 題
              </span>
              <span class="selected-count">已選: {{ selectedQuestionIds.length }} 題</span>
            </div>
            <div class="batch-actions">
              <label class="batch-label">批次選擇:</label>
              <input 
                v-model.number="batchCount" 
                type="number" 
                min="1" 
                :max="Math.min(100, filteredQuestions.length)"
                class="batch-input" 
                placeholder="數量" 
              />
              <button @click="selectBatch" class="btn-batch" :disabled="!batchCount || batchCount > 100 || batchCount > filteredQuestions.length">
                選擇前 {{ batchCount || 0 }} 題
              </button>
              <button @click="clearSelection" class="btn-clear" :disabled="selectedQuestionIds.length === 0">
                清除選擇
              </button>
            </div>
          </div>
        </div>

        <!-- 題目列表 -->
        <div class="question-list" ref="questionListRef" @scroll="handleScroll">
          <div
            v-for="question in filteredQuestions"
            :key="question.question_id"
            class="question-item"
            :class="{ selected: selectedQuestionIds.includes(question.question_id) }"
            @click="toggleQuestion(question.question_id)"
          >
            <div class="question-checkbox">
              <input 
                type="checkbox" 
                :checked="selectedQuestionIds.includes(question.question_id)"
                @click.stop
                @change="toggleQuestion(question.question_id)"
              />
            </div>
            <div class="question-info">
              <div class="question-meta">
                <span class="question-id">Q{{ question.question_id }}</span>
                <span class="question-subject">{{ question.subject_name }}</span>
                <span class="question-chapter">{{ question.chapter }}</span>
              </div>
              <div class="question-preview" v-html="renderPreview(question.content)"></div>
            </div>
          </div>
          
          <!-- 載入中指示器 -->
          <div v-if="questionsPagination.isLoading" class="loading-indicator">
            <div class="spinner"></div>
            <span>載入中...</span>
          </div>
          
          <!-- 已載入全部提示 -->
          <div v-else-if="!questionsPagination.hasNext && filteredQuestions.length > 0" class="end-indicator">
            已載入全部題目（共 {{ questionsPagination.totalCount }} 題）
          </div>
          
          <div v-if="filteredQuestions.length === 0" class="empty-state">
            沒有符合條件的題目
          </div>
        </div>

        <!-- 底部按鈕 -->
        <div class="modal-footer">
          <button @click="close" class="btn-cancel">取消</button>
          <button @click="confirm" class="btn-confirm" :disabled="selectedQuestionIds.length === 0">
            確認選擇 ({{ selectedQuestionIds.length }} 題)
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted, onBeforeUnmount, type Ref, type InjectionKey } from 'vue'
import { useMarkdownRenderer } from '../../../composables/useMarkdownRenderer'
import { useTiptapConverter } from '../../../composables/useTiptapConverter'
import type { TiptapDocument } from '@9jang/shared'

/**
 * 問題類型
 */
interface Question {
  question_id: number
  subject_name?: string
  chapter?: string
  difficulty?: number
  content?: TiptapDocument | string
  [key: string]: unknown
}

/**
 * 問題分頁配置
 */
interface QuestionsPagination {
  currentPage: number
  pageSize: number
  totalCount: number
  hasNext: boolean
  isLoading: boolean
}

interface Props {
  modelValue?: boolean
  questions?: Question[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  questions: () => []
})

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'select', questionIds: number | number[]): void
}

const emit = defineEmits<Emits>()

// 注入分頁狀態和載入更多的函數
const QuestionsPaginationInjectionKey: InjectionKey<Ref<QuestionsPagination>> = Symbol('questionsPagination')
const LoadMoreQuestionsInjectionKey: InjectionKey<() => void> = Symbol('loadMoreQuestions')

const questionsPagination: Ref<QuestionsPagination> = inject(
  QuestionsPaginationInjectionKey,
  ref({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    hasNext: false,
    isLoading: false
  })
)
const loadMoreQuestions = inject(LoadMoreQuestionsInjectionKey, () => {})

const { renderMarkdownWithLatex } = useMarkdownRenderer()
const { contentToMarkdown } = useTiptapConverter()

interface Filters {
  subject: string
  chapter: string
  difficulty: string
}

const filters: Ref<Filters> = ref({
  subject: '',
  chapter: '',
  difficulty: ''
})

const selectedQuestionIds: Ref<number[]> = ref([])
const batchCount: Ref<number | null> = ref(null)

// 取得所有科目
const subjects = computed<string[]>(() => {
  const subjectSet = new Set<string>()
  props.questions.forEach((q) => {
    if (q.subject_name) subjectSet.add(q.subject_name)
  })
  return Array.from(subjectSet).sort()
})

// 篩選後的題目列表
const filteredQuestions = computed<Question[]>(() => {
  const filtered = props.questions.filter((q) => {
    if (filters.value.subject && q.subject_name !== filters.value.subject) {
      return false
    }
    if (filters.value.chapter && !q.chapter?.includes(filters.value.chapter)) {
      return false
    }
    if (filters.value.difficulty && q.difficulty !== parseInt(filters.value.difficulty)) {
      return false
    }
    return true
  })

  return filtered
})

const renderPreview = (content: TiptapDocument | string | unknown): string => {
  if (!content) return ''

  // 處理 TipTap JSON 格式，保留 LaTeX 標記
  let markdownContent = ''
  if (typeof content === 'object' && content !== null && (content as { type?: string }).type === 'doc') {
    // 使用 contentToMarkdown 保留 LaTeX 標記
    markdownContent = contentToMarkdown(content as TiptapDocument)
  } else if (typeof content === 'string') {
    markdownContent = content
  } else {
    markdownContent = String(content)
  }

  // 只顯示前 200 個字元（因為包含 LaTeX 標記會比較長）
  const text = markdownContent.substring(0, 200)

  return renderMarkdownWithLatex(text + (markdownContent.length > 200 ? '...' : ''))
}

const toggleQuestion = (questionId: number): void => {
  const index = selectedQuestionIds.value.indexOf(questionId)
  if (index > -1) {
    selectedQuestionIds.value.splice(index, 1)
  } else {
    if (selectedQuestionIds.value.length < 100) {
      selectedQuestionIds.value.push(questionId)
    }
  }
}

const selectBatch = (): void => {
  if (!batchCount.value || batchCount.value < 1) return

  const count = Math.min(batchCount.value, 100, filteredQuestions.value.length)
  selectedQuestionIds.value = filteredQuestions.value.slice(0, count).map((q) => q.question_id)
}

const clearSelection = (): void => {
  selectedQuestionIds.value = []
}

const confirm = (): void => {
  if (selectedQuestionIds.value.length > 0) {
    emit('select', selectedQuestionIds.value)
    close()
  }
}

const close = (): void => {
  emit('update:modelValue', false)
  selectedQuestionIds.value = []
  batchCount.value = null
}

// 無限滾動處理
const questionListRef: Ref<HTMLElement | null> = ref(null)

const handleScroll = (): void => {
  if (!questionListRef.value) return

  const { scrollTop, scrollHeight, clientHeight } = questionListRef.value

  // 當滾動到距離底部 100px 時觸發載入
  const threshold = 100
  const isNearBottom = scrollTop + clientHeight >= scrollHeight - threshold

  if (isNearBottom && questionsPagination.value.hasNext && !questionsPagination.value.isLoading) {
    loadMoreQuestions()
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 2rem;
}

.modal-container {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 900px;
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgb(226, 232, 240);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgb(30, 41, 59);
}

.btn-close {
  padding: 0.5rem;
  border-radius: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: rgb(100, 116, 139);
  transition: all 0.2s;
}

.btn-close:hover {
  background: rgb(241, 245, 249);
  color: rgb(30, 41, 59);
}

.filter-section {
  padding: 1.5rem;
  border-bottom: 1px solid rgb(226, 232, 240);
  background: rgb(248, 250, 252);
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(71, 85, 105);
}

.filter-select,
.filter-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid rgb(203, 213, 225);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: white;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: rgb(99, 102, 241);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.question-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.batch-select-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgb(226, 232, 240);
}

.batch-info {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
}

.filtered-count {
  color: rgb(71, 85, 105);
  font-weight: 600;
}

.selected-count {
  color: rgb(99, 102, 241);
  font-weight: 600;
}

.batch-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.batch-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(71, 85, 105);
}

.batch-input {
  width: 100px;
  padding: 0.5rem 0.75rem;
  border: 1px solid rgb(203, 213, 225);
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.batch-input:focus {
  outline: none;
  border-color: rgb(99, 102, 241);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.btn-batch,
.btn-clear {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-batch {
  background: rgb(99, 102, 241);
  color: white;
}

.btn-batch:hover:not(:disabled) {
  background: rgb(79, 70, 229);
}

.btn-batch:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-clear {
  background: rgb(239, 68, 68);
  color: white;
}

.btn-clear:hover:not(:disabled) {
  background: rgb(220, 38, 38);
}

.btn-clear:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.question-item {
  display: flex;
  gap: 0.75rem;
  align-items: start;
  padding: 1rem;
  border: 2px solid rgb(226, 232, 240);
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.question-checkbox {
  flex-shrink: 0;
  padding-top: 0.125rem;
}

.question-checkbox input[type="checkbox"] {
  width: 1.125rem;
  height: 1.125rem;
  cursor: pointer;
}

.question-item:hover {
  border-color: rgb(99, 102, 241);
  background: rgb(238, 242, 255);
}

.question-item.selected {
  border-color: rgb(99, 102, 241);
  background: rgb(224, 231, 255);
}

.question-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.question-meta {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.question-id {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  background: rgb(99, 102, 241);
  color: white;
  border-radius: 0.25rem;
}

.question-subject {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgb(100, 116, 139);
}

.question-chapter {
  font-size: 0.75rem;
  color: rgb(148, 163, 184);
}

.question-preview {
  font-size: 0.875rem;
  color: rgb(51, 65, 85);
  line-height: 1.5;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: rgb(148, 163, 184);
  font-size: 0.875rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid rgb(226, 232, 240);
}

.btn-cancel,
.btn-confirm {
  padding: 0.5rem 1.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: white;
  border: 1px solid rgb(203, 213, 225);
  color: rgb(71, 85, 105);
}

.btn-cancel:hover {
  background: rgb(241, 245, 249);
}

.btn-confirm {
  background: rgb(99, 102, 241);
  border: none;
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  background: rgb(79, 70, 229);
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 載入中指示器 */
.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  color: rgb(100, 116, 139);
  font-size: 0.875rem;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgb(226, 232, 240);
  border-top-color: rgb(99, 102, 241);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 已載入全部提示 */
.end-indicator {
  text-align: center;
  padding: 1.5rem;
  color: rgb(148, 163, 184);
  font-size: 0.875rem;
  border-top: 1px solid rgb(226, 232, 240);
}
</style>
