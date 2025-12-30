<template>
  <div>
    <!-- 篩選表單 -->
    <div class="mb-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-slate-900">篩選條件</h3>
        <button 
          @click="showFilters = !showFilters" 
          class="text-sm text-indigo-600 hover:text-indigo-800 font-semibold"
        >
          {{ showFilters ? '收起' : '展開' }}篩選
        </button>
      </div>
      
      <!-- 載入指示器 -->
      <div v-if="isFiltering" class="mb-2 text-xs text-slate-500 flex items-center gap-2">
        <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        搜尋中...
      </div>
      
      <!-- 篩選面板 -->
      <div v-show="showFilters" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- 科目篩選 -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">科目</label>
          <select
            v-model="filters.subject_id"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">全部</option>
            <option v-for="subject in subjects" :key="subject.subject_id" :value="subject.subject_id">
              {{ subject.name }}
            </option>
          </select>
        </div>

        <!-- 年級篩選 -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">年級</label>
          <select
            v-model="filters.level"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">全部</option>
            <option value="JHS">國中</option>
            <option value="SHS">高中</option>
            <option value="VCS">高職</option>
          </select>
        </div>

        <!-- 章節篩選 -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">章節</label>
          <input
            v-model="filters.chapter"
            type="text"
            placeholder="輸入章節名稱..."
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <!-- 難度篩選 -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">難度</label>
          <select
            v-model="filters.difficulty"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">全部</option>
            <option value="1">1 星</option>
            <option value="2">2 星</option>
            <option value="3">3 星</option>
            <option value="4">4 星</option>
            <option value="5">5 星</option>
          </select>
        </div>

        <!-- 題目類型篩選 -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">題目類型</label>
          <select
            v-model="filters.question_type"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">全部</option>
            <option value="SINGLE_CHOICE">單選題</option>
            <option value="MULTIPLE_CHOICE">多選題</option>
            <option value="FILL_IN_BLANK">填充題</option>
            <option value="PROGRAMMING">程式題</option>
            <option value="LISTENING">聽力題</option>
          </select>
        </div>

        <!-- 標籤篩選 -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">標籤</label>
          <select
            v-model="filters.tag_id"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">全部</option>
            <option v-for="tag in tags" :key="tag.tag_id" :value="tag.tag_id">
              #{{ tag.tag_name }}
            </option>
          </select>
        </div>

        <!-- 來源篩選 -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">來源</label>
          <select
            v-model="filters.source"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">全部</option>
            <option v-for="source in sourceOptions" :key="source" :value="source">
              {{ source }}
            </option>
          </select>
        </div>
      </div>

      <div v-show="showFilters" class="mt-4 flex justify-end gap-2">
        <button
          @click="resetFilters"
          class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          重置篩選
        </button>
      </div>
      
      <!-- 已套用的篩選標籤 -->
      <div v-if="hasActiveFilters" class="flex flex-wrap gap-2 pt-3 mt-3 border-t border-slate-200">
        <span class="text-xs text-slate-500">已套用：</span>
        <span
          v-for="(filter, key) in activeFilters"
          :key="key"
          class="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700"
        >
          {{ filter.label }}
          <button @click="removeFilter(key)" class="text-indigo-600 hover:text-indigo-800">×</button>
        </span>
      </div>
    </div>

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
            @click="showQuestionPreview(question)"
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
                <button @click.stop="editQuestion(question.question_id)" class="p-1 text-slate-400 hover:text-indigo-600" title="編輯">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button @click.stop="deleteQuestion(question.question_id)" class="p-1 text-slate-400 hover:text-rose-600" title="刪除">
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
          @click.prevent="goToPage(pagination.currentPage - 1)"
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
          @click.prevent="goToPage(pagination.currentPage + 1)"
          :disabled="pagination.currentPage === pagination.totalPages"
          class="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          下一頁
        </button>
      </div>
    </div>

    <!-- 題目預覽 Modal -->
    <div
      v-if="previewQuestion"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      @click.self="closePreview"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-slate-200">
          <div class="flex items-center gap-3">
            <span
              class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset"
              :class="getTypeColor(previewQuestion.question_type)"
            >
              {{ getTypeName(previewQuestion.question_type) }}
            </span>
            <h2 class="text-xl font-bold text-slate-900">Q{{ previewQuestion.question_id }}</h2>
            <div class="text-sm text-slate-500">
              {{ previewQuestion.subject_name || '無科目' }} • {{ getLevelName(previewQuestion.level) }} • {{ previewQuestion.chapter || '無章節' }}
            </div>
          </div>
          <button
            @click="closePreview"
            class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="flex-1 overflow-y-auto p-6">
          <!-- 題目內容 -->
          <div class="mb-6">
            <h3 class="text-sm font-semibold text-slate-700 mb-2">題目內容</h3>
            <div class="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <RichTextPreview :content="getQuestionContent(previewQuestion)" />
              
              <!-- 錯題本圖片（如果題目是從錯題本匯入的） -->
              <div v-if="previewQuestion.error_log_images && previewQuestion.error_log_images.length > 0" class="mt-4">
                <div class="text-xs font-semibold text-slate-600 mb-2">學生上傳的錯題圖片：</div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div
                    v-for="img in previewQuestion.error_log_images"
                    :key="img.image_id"
                    class="relative border border-slate-300 rounded-lg overflow-hidden bg-white"
                  >
                    <img
                      :src="img.image_url"
                      :alt="img.caption || '錯題圖片'"
                      class="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                      @click="openImageModal(img.image_url, img.caption)"
                    />
                    <div v-if="img.caption" class="p-2 text-xs text-slate-600 bg-slate-50 border-t border-slate-200">
                      {{ img.caption }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 選項（如果是選擇題） -->
          <div v-if="previewQuestion.question_type === 'SINGLE_CHOICE' || previewQuestion.question_type === 'MULTIPLE_CHOICE'" class="mb-6">
            <h3 class="text-sm font-semibold text-slate-700 mb-2">選項</h3>
            <div class="space-y-2">
              <div
                v-for="(option, index) in (previewQuestion.options || [])"
                :key="index"
                class="flex items-start gap-3 p-3 border border-slate-200 rounded-lg bg-white"
              >
                <span class="text-sm font-medium text-slate-600 w-6">{{ String.fromCharCode(65 + index) }}.</span>
                <div class="flex-1">
                  <RichTextPreview :content="getOptionContent(option)" />
                </div>
              </div>
            </div>
          </div>

          <!-- 正確答案 -->
          <div class="mb-6">
            <h3 class="text-sm font-semibold text-slate-700 mb-2">正確答案</h3>
            <div class="border border-slate-200 rounded-lg p-4 bg-green-50">
              <RichTextPreview :content="getQuestionAnswer(previewQuestion)" />
            </div>
          </div>

          <!-- 詳解 -->
          <div v-if="previewQuestion.solution_content" class="mb-6">
            <h3 class="text-sm font-semibold text-slate-700 mb-2">詳解</h3>
            <div class="border border-slate-200 rounded-lg p-4 bg-blue-50">
              <RichTextPreview :content="getQuestionSolution(previewQuestion)" />
            </div>
          </div>

          <!-- 其他資訊 -->
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="font-semibold text-slate-700">難度：</span>
              <div class="flex mt-1">
                <span v-for="i in 5" :key="i" class="text-sm" :class="i <= previewQuestion.difficulty ? 'text-yellow-500' : 'text-slate-300'">★</span>
              </div>
            </div>
            <div>
              <span class="font-semibold text-slate-700">標籤：</span>
              <div class="flex flex-wrap gap-1 mt-1">
                <span
                  v-for="tag in (previewQuestion.tags || [])"
                  :key="tag"
                  class="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded"
                >
                  #{{ tag }}
                </span>
                <span v-if="!previewQuestion.tags || previewQuestion.tags.length === 0" class="text-xs text-slate-400">無標籤</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
          <button
            @click="closePreview"
            class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            關閉
          </button>
          <button
            @click="editQuestion(previewQuestion.question_id)"
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            編輯題目
          </button>
        </div>
      </div>
    </div>

    <!-- 圖片預覽 Modal -->
    <div
      v-if="imageModal.open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      @click.self="closeImageModal"
    >
      <div class="relative max-w-5xl max-h-[90vh] mx-4">
        <button
          @click="closeImageModal"
          class="absolute top-4 right-4 z-10 p-2 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
        <img
          :src="imageModal.url"
          :alt="imageModal.caption || '圖片預覽'"
          class="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
        />
        <div v-if="imageModal.caption" class="mt-2 text-center text-white text-sm bg-black bg-opacity-50 rounded-lg p-2">
          {{ imageModal.caption }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, onActivated, nextTick, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { questionBankAPI, subjectAPI, hashtagAPI } from '../services/api'
import RichTextPreview from './RichTextPreview.vue'
import type { Question, Subject, Tag, TiptapDocument } from '@9jang/shared'

type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'FILL_IN_BLANK' | 'PROGRAMMING' | 'LISTENING'
type Level = 'JHS' | 'SHS' | 'VCS'

interface QuestionWithExtras extends Question {
  question_id: number
  subject_name?: string
  level: Level
  chapter?: string
  difficulty: number
  question_type: QuestionType
  content: TiptapDocument | string | unknown
  correct_answer: TiptapDocument | string | unknown
  solution_content?: TiptapDocument | string | unknown
  options?: (TiptapDocument | string | unknown)[]
  tags?: string[]
  source?: string
  source_display?: string
  error_log_images?: Array<{ image_id: number; image_url: string; caption?: string }>
  [key: string]: unknown
}

interface Pagination {
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
}

interface Filters {
  subject_id: string
  level: string
  chapter: string
  difficulty: string
  question_type: string
  tag_id: string
  source: string
}

interface ImageModal {
  open: boolean
  url: string
  caption: string
}

interface TiptapNode {
  type: string
  text?: string
  content?: TiptapNode[]
  marks?: Array<{ type: string }>
  attrs?: Record<string, unknown>
}

const router = useRouter()

const questions: Ref<QuestionWithExtras[]> = ref([])
const subjects: Ref<Subject[]> = ref([])
const tags: Ref<Tag[]> = ref([])
const sourceOptions: Ref<string[]> = ref([])
const loading: Ref<boolean> = ref(false)
const isFiltering: Ref<boolean> = ref(false)
const showFilters: Ref<boolean> = ref(true)
const previewQuestion: Ref<QuestionWithExtras | null> = ref(null)
const imageModal: Ref<ImageModal> = ref({ open: false, url: '', caption: '' })
const questionsContainer: Ref<HTMLElement | null> = ref(null)
let savedScrollPosition = 0
let filterTimeout: ReturnType<typeof setTimeout> | null = null

const pagination = reactive<Pagination>({
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  pageSize: 10
})

const filters = reactive<Filters>({
  subject_id: '',
  level: '',
  chapter: '',
  difficulty: '',
  question_type: '',
  tag_id: '',
  source: ''
})

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

const fetchQuestions = async (): Promise<void> => {
  // 保存當前滾動位置
  const mainElement = document.querySelector('main')
  const mainScroll = mainElement ? mainElement.scrollTop : 0
  const windowScroll = window.pageYOffset || document.documentElement.scrollTop
  savedScrollPosition = mainScroll || windowScroll
  
  // 在設置 loading 之前，先保存滾動位置到 main 元素的 data 屬性
  if (mainElement) {
    mainElement.dataset.savedScrollTop = savedScrollPosition.toString()
  }
  
  loading.value = true
  isFiltering.value = true
  try {
    const params: Record<string, string | number | number[]> = {}
    if (filters.subject_id) params.subject = filters.subject_id
    if (filters.level) params.level = filters.level
    if (filters.chapter) params.chapter = filters.chapter
    if (filters.difficulty) params.difficulty = filters.difficulty
    if (filters.question_type) params.question_type = filters.question_type
    if (filters.tag_id) params.tags = [parseInt(filters.tag_id, 10)]
    if (filters.source) params.source = filters.source

    // 添加分頁參數
    // 注意：DRF 的 PageNumberPagination 不支援 page_size 查詢參數
    // 使用默認的 PAGE_SIZE (10)，由後端設定
    params.page = pagination.currentPage

    const response = await questionBankAPI.getAll({ params })
    const questionsData = ((response.data as { results?: QuestionWithExtras[] }) | QuestionWithExtras[]).results || (response.data as QuestionWithExtras[]) || []

    // 更新分頁資訊
    const data = response.data as { count?: number }
    if (data.count !== undefined) {
      pagination.totalCount = data.count
      pagination.totalPages = Math.ceil(data.count / pagination.pageSize)
    } else {
      // 如果沒有分頁資訊，假設只有一頁
      pagination.totalCount = questionsData.length
      pagination.totalPages = 1
    }

    // 確保每個題目都有必要的欄位
    questions.value = questionsData.map((q) => ({
      ...q,
      question_type: (q.question_type as QuestionType) || 'SINGLE_CHOICE',
      options: q.options || [],
      tags: q.tags || []
    })) as QuestionWithExtras[]
  } catch (error) {
    console.error('獲取題目失敗：', error)
    questions.value = []
  } finally {
    // 先更新 loading 狀態，但保持內容可見以避免高度變化
    loading.value = false
    isFiltering.value = false
    
    // 由於現在使用遮罩而不是替換內容，內容高度不會改變，所以不需要恢復滾動位置
    // 但為了保險起見，如果滾動位置被改變了，我們還是要恢復
    await nextTick()
    
    const mainElement = document.querySelector('main')
    const mainScroll = mainElement ? mainElement.scrollTop : 0
    
    // 只有在滾動位置被意外改變時才恢復（差異超過 10px）
    if (mainElement && savedScrollPosition > 0 && Math.abs(mainScroll - savedScrollPosition) > 10) {
      requestAnimationFrame(() => {
        const targetScroll = mainElement.dataset.savedScrollTop ? parseFloat(mainElement.dataset.savedScrollTop) : savedScrollPosition
        mainElement.scrollTop = targetScroll
        delete mainElement.dataset.savedScrollTop
      })
    } else if (mainElement && mainElement.dataset.savedScrollTop) {
      // 清除保存的滾動位置
      delete mainElement.dataset.savedScrollTop
    }
  }
}

const fetchSubjects = async (): Promise<void> => {
  try {
    const response = await subjectAPI.getAll()
    subjects.value = ((response.data as { results?: Subject[] }) | Subject[]).results || (response.data as Subject[]) || []
  } catch (error) {
    console.warn('獲取科目失敗：', error)
    subjects.value = []
  }
}

const fetchTags = async (): Promise<void> => {
  try {
    const response = await hashtagAPI.getAll()
    tags.value = ((response.data as { results?: Tag[] }) | Tag[]).results || (response.data as Tag[]) || []
  } catch (error) {
    console.warn('獲取標籤失敗：', error)
    tags.value = []
  }
}

const fetchSourceOptions = async (): Promise<void> => {
  try {
    const response = await questionBankAPI.getSourceOptions()
    sourceOptions.value = (response.data as { options?: string[] }).options || []
  } catch (error) {
    console.warn('獲取來源選項失敗：', error)
    // 如果 API 失敗，使用預設選項
    sourceOptions.value = ['九章自命題', '學生錯題', '學測', '會考', '統測', '模擬考', '基測']
  }
}

const resetFilters = (): void => {
  filters.subject_id = ''
  filters.level = ''
  filters.chapter = ''
  filters.difficulty = ''
  filters.question_type = ''
  filters.tag_id = ''
  filters.source = ''
  pagination.currentPage = 1
  fetchQuestions()
}

// 移除單個篩選條件
const removeFilter = (key: keyof Filters): void => {
  filters[key] = '' as never
  pagination.currentPage = 1
  fetchQuestions()
}

// 檢查是否有活躍的篩選
const hasActiveFilters = computed<boolean>(() => {
  return Object.values(filters).some((value) => value !== '')
})

// 獲取活躍篩選的顯示標籤
const activeFilters = computed<Record<string, { label: string }>>(() => {
  const result: Record<string, { label: string }> = {}

  if (filters.subject_id) {
    const subject = subjects.value.find((s) => String(s.subject_id) === filters.subject_id)
    result.subject_id = { label: `科目：${subject?.name || filters.subject_id}` }
  }

  if (filters.level) {
    const levelMap: Record<string, string> = {
      JHS: '國中',
      SHS: '高中',
      VCS: '高職'
    }
    result.level = { label: `年級：${levelMap[filters.level] || filters.level}` }
  }

  if (filters.chapter) {
    result.chapter = { label: `章節：${filters.chapter}` }
  }

  if (filters.difficulty) {
    result.difficulty = { label: `難度：${filters.difficulty} 星` }
  }

  if (filters.question_type) {
    const typeMap: Record<string, string> = {
      SINGLE_CHOICE: '單選題',
      MULTIPLE_CHOICE: '多選題',
      FILL_IN_BLANK: '填充題',
      PROGRAMMING: '程式題',
      LISTENING: '聽力題'
    }
    result.question_type = { label: `類型：${typeMap[filters.question_type] || filters.question_type}` }
  }

  if (filters.tag_id) {
    const tag = tags.value.find((t) => String(t.tag_id) === filters.tag_id)
    result.tag_id = { label: `標籤：#${tag?.tag_name || filters.tag_id}` }
  }

  if (filters.source) {
    result.source = { label: `來源：${filters.source}` }
  }

  return result
})

// 防抖函數
const debouncedFetchQuestions = (): void => {
  if (filterTimeout) {
    clearTimeout(filterTimeout)
  }
  filterTimeout = setTimeout(() => {
    pagination.currentPage = 1
    fetchQuestions()
  }, 500)
}

// 監聽章節篩選（文字輸入，使用防抖）
watch(
  () => filters.chapter,
  () => {
    debouncedFetchQuestions()
  }
)

// 監聽其他篩選條件（下拉選單，立即執行）
watch(
  () => [filters.subject_id, filters.level, filters.difficulty, filters.question_type, filters.tag_id, filters.source],
  () => {
    pagination.currentPage = 1
    fetchQuestions()
  }
)

const goToPage = async (page: number): Promise<void> => {
  if (page >= 1 && page <= pagination.totalPages) {
    pagination.currentPage = page
    await fetchQuestions()
  }
}

const showQuestionPreview = async (question: QuestionWithExtras): Promise<void> => {
  // 如果只有基本信息，需要獲取完整題目詳情
  if (!question.content || !question.correct_answer) {
    try {
      const response = await questionBankAPI.getById(question.question_id)
      previewQuestion.value = response.data as QuestionWithExtras
    } catch (error) {
      console.error('獲取題目詳情失敗：', error)
      previewQuestion.value = question
    }
  } else {
    previewQuestion.value = question
  }
}

const closePreview = (): void => {
  previewQuestion.value = null
}

const openImageModal = (url: string, caption = ''): void => {
  imageModal.value = { open: true, url, caption }
}

const closeImageModal = (): void => {
  imageModal.value = { open: false, url: '', caption: '' }
}

// 將 Tiptap JSON 轉換為 Markdown 字串
const tiptapToMarkdown = (node: TiptapNode | unknown): string => {
  if (!node || typeof node !== 'object') return ''

  const n = node as TiptapNode
  let markdown = ''

  // 處理文字節點
  if (n.type === 'text') {
    let text = n.text || ''
    // 處理文字標記
    if (n.marks) {
      for (const mark of n.marks) {
        if (mark.type === 'bold') {
          text = `**${text}**`
        } else if (mark.type === 'italic') {
          text = `*${text}*`
        } else if (mark.type === 'code') {
          text = `\`${text}\``
        }
      }
    }
    return text
  }

  // 處理不同類型的節點
  if (n.type === 'paragraph') {
    if (n.content && Array.isArray(n.content)) {
      const paraText = n.content.map((child) => tiptapToMarkdown(child)).join('')
      markdown += paraText + '\n\n'
    } else {
      markdown += '\n\n'
    }
  } else if (n.type === 'heading') {
    const level = ((n.attrs as { level?: number })?.level) || 1
    const headingText = n.content ? n.content.map((child) => tiptapToMarkdown(child)).join('') : ''
    markdown += '#'.repeat(level) + ' ' + headingText + '\n\n'
  } else if (n.type === 'codeBlock') {
    const codeText = n.content ? n.content.map((child) => tiptapToMarkdown(child)).join('') : ''
    const language = ((n.attrs as { language?: string })?.language) || 'text'
    markdown += '```' + language + '\n' + codeText + '\n```\n\n'
  } else if (n.type === 'hardBreak') {
    markdown += '\n'
  } else if (n.type === 'bulletList' || n.type === 'orderedList') {
    if (n.content && Array.isArray(n.content)) {
      n.content.forEach((item, index) => {
        const itemText = item.content ? item.content.map((child) => tiptapToMarkdown(child)).join('').trim() : ''
        const prefix = n.type === 'orderedList' ? `${index + 1}. ` : '- '
        markdown += prefix + itemText + '\n'
      })
      markdown += '\n'
    }
  } else if (n.type === 'blockquote') {
    const quoteText = n.content ? n.content.map((child) => tiptapToMarkdown(child)).join('').trim() : ''
    markdown += '> ' + quoteText.split('\n').join('\n> ') + '\n\n'
  } else if (n.type === 'latexBlock') {
    const latex = ((n.attrs as { latex?: string })?.latex) || ''
    // LaTeX 中的反斜線需要保留，直接使用字串拼接避免模板字串轉義問題
    markdown += '$$\n' + latex + '\n$$\n\n'
  } else if (n.type === 'inlineLatex') {
    const latex = ((n.attrs as { latex?: string })?.latex) || ''
    // LaTeX 中的反斜線需要保留，直接使用字串拼接避免模板字串轉義問題
    markdown += '$' + latex + '$'
  } else if (n.type === 'image') {
    const src = ((n.attrs as { src?: string })?.src) || ''
    const alt = ((n.attrs as { alt?: string })?.alt) || ''
    markdown += `![${alt}](${src})\n\n`
  } else if (n.type === 'questionBlock') {
    // 題目區塊：顯示為佔位符
    const questionId = ((n.attrs as { questionId?: string })?.questionId) || ''
    markdown += `\n[題目區塊: ${questionId || '未指定'}]\n\n`
  } else if (n.type === 'templateBlock') {
    // 模板區塊：顯示為佔位符
    const templateId = ((n.attrs as { templateId?: string })?.templateId) || ''
    markdown += `\n[模板區塊: ${templateId || '未指定'}]\n\n`
  } else if (n.type === 'diagram2DBlock' || n.type === 'diagram2D') {
    // 2D 圖表：顯示為佔位符
    markdown += `\n[2D 圖表]\n\n`
  } else if (n.type === 'diagram3DBlock' || n.type === 'diagram3D') {
    // 3D 圖表：顯示為佔位符
    markdown += `\n[3D 圖表]\n\n`
  } else if (n.type === 'circuitBlock' || n.type === 'circuit') {
    // 電路圖：顯示為佔位符
    markdown += `\n[電路圖]\n\n`
  } else if (n.type === 'imagePlaceholder') {
    // 圖片佔位符
    const alt = ((n.attrs as { alt?: string })?.alt) || '圖片'
    markdown += `\n[圖片: ${alt}]\n\n`
  } else if (n.type === 'pageBreak') {
    // 分頁符
    markdown += `\n---\n\n`
  } else if (n.content && Array.isArray(n.content)) {
    // 遞迴處理子節點
    markdown += n.content.map((child) => tiptapToMarkdown(child)).join('')
  }

  return markdown
}

const getQuestionContent = (question: QuestionWithExtras | null): string => {
  if (!question) return ''
  // 如果是字串（舊格式，向後相容）
  if (typeof question.content === 'string') return question.content
  // 如果是舊的物件格式 {format: 'markdown', text: '...'}
  if (question.content && typeof question.content === 'object' && (question.content as { text?: string }).text) {
    return (question.content as { text: string }).text
  }
  // 如果是 Tiptap JSON 格式
  if (question.content && typeof question.content === 'object' && (question.content as TiptapDocument).type === 'doc') {
    return tiptapToMarkdown(question.content as unknown as TiptapNode).trim()
  }
  return ''
}

const getQuestionAnswer = (question: QuestionWithExtras | null): string => {
  if (!question) return ''
  // 如果是字串（舊格式，向後相容）
  if (typeof question.correct_answer === 'string') return question.correct_answer
  // 如果是舊的物件格式 {format: 'markdown', text: '...'}
  if (question.correct_answer && typeof question.correct_answer === 'object' && (question.correct_answer as { text?: string }).text) {
    return (question.correct_answer as { text: string }).text
  }
  // 如果是 Tiptap JSON 格式
  if (question.correct_answer && typeof question.correct_answer === 'object' && (question.correct_answer as TiptapDocument).type === 'doc') {
    return tiptapToMarkdown(question.correct_answer as unknown as TiptapNode).trim()
  }
  return ''
}

const getQuestionSolution = (question: QuestionWithExtras | null): string => {
  if (!question || !question.solution_content) return ''
  // 如果是字串（舊格式，向後相容）
  if (typeof question.solution_content === 'string') return question.solution_content
  // 如果是舊的物件格式 {format: 'markdown', text: '...'}
  if (question.solution_content && typeof question.solution_content === 'object' && (question.solution_content as { text?: string }).text) {
    return (question.solution_content as { text: string }).text
  }
  // 如果是 Tiptap JSON 格式
  if (question.solution_content && typeof question.solution_content === 'object' && (question.solution_content as TiptapDocument).type === 'doc') {
    return tiptapToMarkdown(question.solution_content as unknown as TiptapNode).trim()
  }
  return ''
}

const getOptionContent = (option: TiptapDocument | string | unknown): string => {
  if (!option) return ''
  // 如果是字串（舊格式，向後相容）
  if (typeof option === 'string') return option
  // 如果是 Tiptap JSON 格式
  if (option && typeof option === 'object' && (option as TiptapDocument).type === 'doc') {
    return tiptapToMarkdown(option as unknown as TiptapNode).trim()
  }
  // 如果是其他物件格式，嘗試轉換
  if (option && typeof option === 'object') {
    return tiptapToMarkdown(option as unknown as TiptapNode).trim()
  }
  return ''
}

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
    fetchQuestions()
  } catch (error) {
    console.error('刪除失敗：', error)
    alert('刪除失敗')
  }
}

onMounted(() => {
  fetchSubjects()
  fetchTags()
  fetchSourceOptions()
  fetchQuestions()
})

// 監聽路由變化，當從其他頁面返回時刷新列表
onActivated(() => {
  fetchQuestions()
})
</script>
