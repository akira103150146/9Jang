<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
    @click.self="$emit('close')"
  >
    <div class="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold text-slate-900">新增錯題記錄</h3>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="$emit('save')" class="space-y-4">
        <!-- 從題庫選擇或新增題目 -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="block text-sm font-semibold text-slate-700">題目來源</label>
            <button
              type="button"
              @click="$emit('toggle-question-source')"
              class="text-xs text-purple-600 hover:text-purple-700 font-semibold"
            >
              {{ errorFormData.useExistingQuestion ? '改為新增題目' : '從題庫選擇' }}
            </button>
          </div>
          
          <!-- 從題庫選擇 -->
          <select
            v-if="errorFormData.useExistingQuestion"
            :model-value="errorFormData.selectedQuestionId"
            @update:model-value="updateFormData('selectedQuestionId', $event)"
            @change="$emit('load-question')"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
          >
            <option value="">請選擇題庫中的題目</option>
            <option
              v-for="question in questions"
              :key="question.question_id"
              :value="question.question_id"
            >
              {{ (question as { subject_name?: string }).subject_name }} - {{ question.chapter }} (Q{{ question.question_id }})
            </option>
          </select>
          
          <!-- 或新增題目 -->
          <div v-else class="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">
            將在題庫中新增此題目，並自動標記為錯題
          </div>
        </div>

        <!-- 科目 -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="block text-sm font-semibold text-slate-700">科目 *</label>
            <button
              type="button"
              @click="$emit('open-subject-form')"
              class="text-xs text-purple-600 hover:text-purple-700 font-semibold"
            >
              + 新增科目
            </button>
          </div>
          <select
            :model-value="errorFormData.subject"
            @update:model-value="updateFormData('subject', $event)"
            required
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
          >
            <option value="">請選擇科目</option>
            <option
              v-for="subject in subjects"
              :key="subject.subject_id"
              :value="subject.subject_id"
            >
              {{ subject.name }}{{ subject.code ? ` (${subject.code})` : '' }}
            </option>
          </select>
        </div>

        <!-- 適用年級 -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1">適用年級 *</label>
          <select
            :model-value="errorFormData.level"
            @update:model-value="updateFormData('level', $event)"
            required
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
          >
            <option value="">請選擇</option>
            <option value="JHS">Junior High School</option>
            <option value="SHS">Senior High School</option>
            <option value="VCS">Vocational School</option>
          </select>
        </div>

        <!-- 章節/單元 -->
        <div class="relative">
          <label class="block text-sm font-semibold text-slate-700 mb-1">章節/單元 *</label>
          <input
            :model-value="errorFormData.chapter"
            @update:model-value="updateFormData('chapter', $event)"
            @input="$emit('search-chapters')"
            @focus="$emit('search-chapters')"
            @blur="$emit('handle-chapter-blur')"
            type="text"
            required
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            placeholder="例如：向量與空間（輸入關鍵字自動搜尋）"
          />
          <!-- 章節候選列表 -->
          <div
            v-if="chapterSuggestions.length > 0 && showChapterSuggestions"
            class="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            <div
              v-for="(suggestion, index) in chapterSuggestions"
              :key="index"
              @mousedown.prevent="$emit('select-chapter', suggestion.chapter)"
              class="px-3 py-2 hover:bg-purple-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors"
            >
              <div class="flex items-center justify-between">
                <span class="text-sm text-slate-900">{{ suggestion.chapter }}</span>
                <div class="flex items-center gap-2">
                  <span
                    v-if="suggestion.relevance === 2"
                    class="text-xs text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded"
                  >
                    精確匹配
                  </span>
                  <span class="text-xs text-slate-500">
                    {{ suggestion.count }} 題
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 題目內容 -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1">題目內容 (Markdown + LaTeX) *</label>
          <div class="space-y-3">
            <div class="relative">
              <BlockEditor
                :model-value="errorFormData.content"
                @update:model-value="updateFormData('content', $event)"
                :templates="[]"
                :questions="[]"
                :auto-page-break="false"
                :show-page-numbers="false"
              />
            </div>
          </div>
          <p class="mt-1 text-xs text-slate-500">
            提示：使用 $$...$$ 表示區塊公式，使用 $...$ 表示行內公式
          </p>
        </div>

        <!-- 正確答案 -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1">正確答案 (Markdown + LaTeX) *</label>
          <div class="space-y-3">
            <div class="relative">
              <BlockEditor
                :model-value="errorFormData.correct_answer"
                @update:model-value="updateFormData('correct_answer', $event)"
                :templates="[]"
                :questions="[]"
                :auto-page-break="false"
                :show-page-numbers="false"
              />
            </div>
          </div>
          <p class="mt-1 text-xs text-slate-500">
            提示：使用 $$...$$ 表示區塊公式，使用 $...$ 表示行內公式
          </p>
        </div>

        <!-- 難度 -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1">難度 (1-5) *</label>
          <input
            :model-value="errorFormData.difficulty"
            @update:model-value="updateFormData('difficulty', parseInt($event as string))"
            type="number"
            min="1"
            max="5"
            required
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
        </div>

        <!-- 標籤選擇區域 -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="block text-sm font-semibold text-slate-700">標籤分類</label>
            <button
              type="button"
              @click.prevent.stop="$emit('open-tag-form')"
              class="text-xs text-purple-600 hover:text-purple-700 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-200 rounded px-2 py-1 transition-colors"
            >
              + 新增標籤
            </button>
          </div>
          <div class="border border-slate-300 rounded-lg p-3 min-h-[100px] max-h-[200px] overflow-y-auto">
            <div v-if="hashtags.length === 0" class="text-sm text-slate-400 text-center py-4">
              尚無標籤，點擊「新增標籤」開始建立
            </div>
            <div v-else class="flex flex-wrap gap-2">
              <button
                v-for="tag in hashtags"
                :key="tag.tag_id"
                type="button"
                @click="$emit('toggle-tag', tag.tag_id)"
                :class="[
                  'px-3 py-1 rounded-full text-xs font-semibold transition-all',
                  errorFormData.tag_ids.includes(tag.tag_id)
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                ]"
              >
                #{{ tag.tag_name }}
                <span v-if="errorFormData.tag_ids.includes(tag.tag_id)" class="ml-1">✓</span>
              </button>
            </div>
          </div>
          <p class="mt-1 text-xs text-slate-500">
            已選擇 {{ errorFormData.tag_ids.length }} 個標籤
          </p>
        </div>

        <!-- 錯題照片（手機拍照/相簿） -->
        <div class="border-t border-slate-200 pt-4">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-sm font-semibold text-slate-700">錯題照片</h4>
            <label class="inline-flex items-center justify-center rounded-full bg-purple-50 px-4 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-100 cursor-pointer">
              + 拍照/選照片
              <input
                class="hidden"
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                @change="$emit('pick-images', $event)"
              />
            </label>
          </div>
          <p class="text-xs text-slate-500 mb-3">可一次上傳多張；系統會自動壓縮以加快速度。</p>

          <div v-if="localImages.length > 0" class="grid grid-cols-3 gap-3 sm:grid-cols-4">
            <div v-for="(img, idx) in localImages" :key="img.url" class="relative">
              <img :src="img.url" class="h-24 w-full rounded-xl object-cover border border-slate-200" />
              <button
                type="button"
                class="absolute top-2 right-2 rounded-full bg-slate-900/85 text-white text-xs px-2 py-1 hover:bg-slate-900"
                @click="$emit('remove-image', idx)"
              >
                移除
              </button>
            </div>
          </div>
        </div>

        <!-- 錯題相關資訊 -->
        <div class="border-t border-slate-200 pt-4">
          <h4 class="text-sm font-semibold text-slate-700 mb-3">錯題資訊</h4>
          
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">錯誤次數 *</label>
            <input
              :model-value="errorFormData.error_count"
              @update:model-value="updateFormData('error_count', parseInt($event as string))"
              type="number"
              min="1"
              required
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
          </div>

          <div class="mt-4">
            <label class="block text-sm font-semibold text-slate-700 mb-1">複習狀態 *</label>
            <select
              :model-value="errorFormData.review_status"
              @update:model-value="updateFormData('review_status', $event)"
              required
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            >
              <option value="New">新錯題</option>
              <option value="Reviewing">複習中</option>
              <option value="Mastered">已掌握</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <button
            type="button"
            @click="$emit('close')"
            class="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            取消
          </button>
          <button
            type="submit"
            :disabled="saving || uploadingImages"
            class="rounded-full bg-purple-500 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-600 disabled:opacity-50"
          >
            {{ saving || uploadingImages ? '儲存中...' : '儲存' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ErrorFormData, LocalImage } from '../../composables/useErrorLog'
import BlockEditor from '../BlockEditor/BlockEditor.vue'

interface Props {
  isOpen: boolean
  errorFormData: ErrorFormData
  questions: Array<{ question_id: number; chapter?: string; subject_name?: string; [key: string]: unknown }>
  subjects: Array<{ subject_id: number; name: string; code?: string; [key: string]: unknown }>
  hashtags: Array<{ tag_id: number; tag_name: string; [key: string]: unknown }>
  chapterSuggestions: Array<{ chapter: string; count: number; relevance?: number; [key: string]: unknown }>
  showChapterSuggestions: boolean
  localImages: LocalImage[]
  saving: boolean
  uploadingImages: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: []
  'toggle-question-source': []
  'load-question': []
  'open-subject-form': []
  'open-tag-form': []
  'search-chapters': []
  'handle-chapter-blur': []
  'select-chapter': [chapter: string]
  'toggle-tag': [tagId: number]
  'pick-images': [event: Event]
  'remove-image': [index: number]
  'update:error-form-data': [data: ErrorFormData]
}>()

const updateFormData = (key: keyof ErrorFormData, value: unknown) => {
  const updated = { ...props.errorFormData, [key]: value }
  emit('update:error-form-data', updated)
}
</script>

