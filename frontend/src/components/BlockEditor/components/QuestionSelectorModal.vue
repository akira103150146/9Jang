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
        </div>

        <!-- 題目列表 -->
        <div class="question-list">
          <div
            v-for="question in filteredQuestions"
            :key="question.question_id"
            class="question-item"
            :class="{ selected: selectedQuestionId === question.question_id }"
            @click="selectQuestion(question.question_id)"
          >
            <div class="question-info">
              <div class="question-meta">
                <span class="question-id">Q{{ question.question_id }}</span>
                <span class="question-subject">{{ question.subject_name }}</span>
                <span class="question-chapter">{{ question.chapter }}</span>
              </div>
              <div class="question-preview" v-html="renderPreview(question.content)"></div>
            </div>
          </div>
          <div v-if="filteredQuestions.length === 0" class="empty-state">
            沒有符合條件的題目
          </div>
        </div>

        <!-- 底部按鈕 -->
        <div class="modal-footer">
          <button @click="close" class="btn-cancel">取消</button>
          <button @click="confirm" class="btn-confirm" :disabled="!selectedQuestionId">
            確認選擇
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMarkdownRenderer } from '../../../composables/useMarkdownRenderer'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  questions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'select'])

const { renderMarkdownWithLatex } = useMarkdownRenderer()

const filters = ref({
  subject: '',
  chapter: '',
  difficulty: ''
})

const selectedQuestionId = ref(null)

// 取得所有科目
const subjects = computed(() => {
  const subjectSet = new Set()
  props.questions.forEach(q => {
    if (q.subject_name) subjectSet.add(q.subject_name)
  })
  return Array.from(subjectSet).sort()
})

// 篩選後的題目列表
const filteredQuestions = computed(() => {
  return props.questions.filter(q => {
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
})

const renderPreview = (content) => {
  if (!content) return ''
  // 只顯示前100個字元
  const text = content.replace(/[#*>\[\]!]/g, '').substring(0, 100)
  return renderMarkdownWithLatex(text + (content.length > 100 ? '...' : ''))
}

const selectQuestion = (questionId) => {
  selectedQuestionId.value = questionId
}

const confirm = () => {
  if (selectedQuestionId.value) {
    emit('select', selectedQuestionId.value)
    close()
  }
}

const close = () => {
  emit('update:modelValue', false)
  selectedQuestionId.value = null
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

.question-item {
  padding: 1rem;
  border: 2px solid rgb(226, 232, 240);
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
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
</style>
