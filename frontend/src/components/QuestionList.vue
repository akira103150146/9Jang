<template>
  <div>
    <!-- 篩選表單 -->
    <QuestionFilters
      :show-filters="showFilters"
      :is-filtering="isFiltering"
      :filters="filters"
      :subjects="subjects"
      :tags="tags"
      :source-options="sourceOptions"
      :has-active-filters="hasActiveFilters"
      :active-filters="activeFilters"
      @toggle-filters="showFilters = !showFilters"
      @update:subject_id="filters.subject_id = $event"
      @update:level="filters.level = $event"
      @update:chapter="filters.chapter = $event"
      @update:difficulty="filters.difficulty = $event"
      @update:question_type="filters.question_type = $event"
      @update:tag_id="filters.tag_id = $event"
      @update:source="filters.source = $event"
      @reset-filters="resetFilters"
      @remove-filter="removeFilter"
    />

    <!-- 操作按鈕 -->
    <div class="mb-6 flex justify-end gap-2">
      <button
        @click="createQuestion"
        class="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-indigo-600 hover:to-purple-600"
      >
        + 新增題目
      </button>
      <button
        @click="importQuestions"
        class="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-green-600 hover:to-emerald-600"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        匯入外部題本
      </button>
    </div>

    <!-- 題目列表 -->
    <QuestionTable
      :questions="questions"
      :loading="loading"
      :pagination="pagination"
      @show-preview="showQuestionPreview"
      @edit="editQuestion"
      @delete="deleteQuestion"
      @go-to-page="goToPage"
    />

    <!-- 題目預覽 Modal -->
    <QuestionPreviewModal
      :question="previewQuestion"
      @close="closePreview"
      @edit="editQuestion"
      @open-image="openImageModal"
    />

    <!-- 圖片預覽 Modal -->
    <ImagePreviewModal
      :open="imageModal.open"
      :url="imageModal.url"
      :caption="imageModal.caption"
      @close="closeImageModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { questionBankAPI } from '../services/api'
import QuestionFilters from './question-list/QuestionFilters.vue'
import QuestionTable from './question-list/QuestionTable.vue'
import QuestionPreviewModal from './question-list/QuestionPreviewModal.vue'
import ImagePreviewModal from './question-list/ImagePreviewModal.vue'
import { useQuestionList, type QuestionWithExtras } from '../composables/useQuestionList'
import { useQuestionPreview } from '../composables/question-list/useQuestionPreview'
import { useImageModal } from '../composables/question-list/useImageModal'
import { useToast } from '../composables/useToast'

const router = useRouter()
const toast = useToast()

// 使用 composable
const {
  questions,
  subjects,
  tags,
  sourceOptions,
  loading,
  isFiltering,
  pagination,
  filters,
  hasActiveFilters,
  activeFilters,
  fetchQuestions,
  resetFilters,
  removeFilter,
  goToPage,
  initialize,
} = useQuestionList()

const showFilters: Ref<boolean> = ref(true)

// 使用預覽和圖片 modal composables
const { previewQuestion, showQuestionPreview, closePreview } = useQuestionPreview()
const { imageModal, openImageModal, closeImageModal } = useImageModal()

const createQuestion = (): void => {
  router.push({ path: '/questions/new', query: { returnTab: 'questions' } })
}

const importQuestions = (): void => {
  router.push({ path: '/questions/import', query: { returnTab: 'questions' } })
}

const editQuestion = (id: number): void => {
  router.push({ path: `/questions/edit/${id}`, query: { returnTab: 'questions' } })
}

const deleteQuestion = async (id: number): Promise<void> => {
  if (!confirm('確定要刪除此題目嗎？此操作無法復原。')) return
  try {
    await questionBankAPI.delete(id)
    toast.success('刪除成功')
    fetchQuestions()
  } catch (error) {
    console.error('刪除失敗：', error)
    toast.error('刪除失敗')
  }
}

onMounted(() => {
  initialize()
})

// 監聽路由變化，當從其他頁面返回時刷新列表
onActivated(() => {
  fetchQuestions()
})
</script>
