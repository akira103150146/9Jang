<template>
  <div
    v-if="question"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    @click.self="close"
  >
    <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6 border-b border-slate-200">
        <div class="flex items-center gap-3">
          <span
            class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset"
            :class="getTypeColor(question.question_type)"
          >
            {{ getTypeName(question.question_type) }}
          </span>
          <h2 class="text-xl font-bold text-slate-900">Q{{ question.question_id }}</h2>
          <div class="text-sm text-slate-500">
            {{ question.subject_name || '無科目' }} • {{ getLevelName(question.level) }} • {{ question.chapter || '無章節' }}
          </div>
        </div>
        <button
          @click="close"
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
            <RichTextPreview :content="getQuestionContent(question)" />
            
            <!-- 錯題本圖片（如果題目是從錯題本匯入的） -->
            <div v-if="question.error_log_images && question.error_log_images.length > 0" class="mt-4">
              <div class="text-xs font-semibold text-slate-600 mb-2">學生上傳的錯題圖片：</div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div
                  v-for="img in question.error_log_images"
                  :key="img.image_id"
                  class="relative border border-slate-300 rounded-lg overflow-hidden bg-white"
                >
                  <img
                    :src="img.image_url"
                    :alt="img.caption || '錯題圖片'"
                    class="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                    @click="openImage(img.image_url, img.caption)"
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
        <div v-if="question.question_type === 'SINGLE_CHOICE' || question.question_type === 'MULTIPLE_CHOICE'" class="mb-6">
          <h3 class="text-sm font-semibold text-slate-700 mb-2">選項</h3>
          <div class="space-y-2">
            <div
              v-for="(option, index) in (question.options || [])"
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
            <RichTextPreview :content="getQuestionAnswer(question)" />
          </div>
        </div>

        <!-- 詳解 -->
        <div v-if="question.solution_content" class="mb-6">
          <h3 class="text-sm font-semibold text-slate-700 mb-2">詳解</h3>
          <div class="border border-slate-200 rounded-lg p-4 bg-blue-50">
            <RichTextPreview :content="getQuestionSolution(question)" />
          </div>
        </div>

        <!-- 其他資訊 -->
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="font-semibold text-slate-700">難度：</span>
            <div class="flex mt-1">
              <span v-for="i in 5" :key="i" class="text-sm" :class="i <= question.difficulty ? 'text-yellow-500' : 'text-slate-300'">★</span>
            </div>
          </div>
          <div>
            <span class="font-semibold text-slate-700">標籤：</span>
            <div class="flex flex-wrap gap-1 mt-1">
              <span
                v-for="tag in (question.tags || [])"
                :key="tag"
                class="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded"
              >
                #{{ tag }}
              </span>
              <span v-if="!question.tags || question.tags.length === 0" class="text-xs text-slate-400">無標籤</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
        <button
          @click="close"
          class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          關閉
        </button>
        <button
          @click="edit"
          class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          編輯題目
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import RichTextPreview from '../RichTextPreview.vue'
import { useTiptapConverter } from '../../composables/question-list/useTiptapConverter'
import { useQuestionFormatters } from '../../composables/question-list/useQuestionFormatters'
import type { QuestionWithExtras } from '../../composables/useQuestionList'

interface Props {
  question: QuestionWithExtras | null
}

interface Emits {
  (e: 'close'): void
  (e: 'edit', id: number): void
  (e: 'open-image', url: string, caption: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { getQuestionContent, getQuestionAnswer, getQuestionSolution, getOptionContent } = useTiptapConverter()
const { getTypeColor, getTypeName, getLevelName } = useQuestionFormatters()

const close = (): void => {
  emit('close')
}

const edit = (): void => {
  if (props.question) {
    emit('edit', props.question.question_id)
  }
}

const openImage = (url: string, caption = ''): void => {
  emit('open-image', url, caption)
}
</script>
