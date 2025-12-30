<template>
  <div
    v-if="isOpen && selectedNote"
    class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
    @click.self="$emit('close')"
  >
    <div class="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold text-slate-900">匯入題庫</h3>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="$emit('import')" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1">科目 *</label>
          <select
            :model-value="importFormData.subject_id"
            @update:model-value="updateFormData('subject_id', $event)"
            required
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">請選擇</option>
            <option v-for="subject in subjects" :key="subject.subject_id" :value="subject.subject_id">
              {{ subject.name }}{{ subject.code ? ` (${subject.code})` : '' }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1">適用年級 *</label>
          <select
            :model-value="importFormData.level"
            @update:model-value="updateFormData('level', $event)"
            required
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">請選擇</option>
            <option value="JHS">Junior High School</option>
            <option value="SHS">Senior High School</option>
            <option value="VCS">Vocational School</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1">章節/單元 *</label>
          <input
            :model-value="importFormData.chapter"
            @update:model-value="updateFormData('chapter', $event)"
            type="text"
            required
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="例如：向量與空間"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1">題目內容 *</label>
          <BlockEditor
            :model-value="importFormData.content"
            @update:model-value="updateFormData('content', $event)"
            :templates="[]"
            :questions="[]"
            :auto-page-break="false"
            :show-page-numbers="false"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1">正確答案 *</label>
          <BlockEditor
            :model-value="importFormData.correct_answer"
            @update:model-value="updateFormData('correct_answer', $event)"
            :templates="[]"
            :questions="[]"
            :auto-page-break="false"
            :show-page-numbers="false"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1">難度</label>
          <select
            :model-value="importFormData.difficulty"
            @update:model-value="updateFormData('difficulty', parseInt($event as string))"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option :value="1">1 - 非常簡單</option>
            <option :value="2">2 - 簡單</option>
            <option :value="3">3 - 中等</option>
            <option :value="4">4 - 困難</option>
            <option :value="5">5 - 非常困難</option>
          </select>
        </div>

        <div v-if="selectedNote.images && selectedNote.images.length > 0">
          <label class="block text-sm font-semibold text-slate-700 mb-1">選擇圖片（可選）</label>
          <select
            :model-value="importFormData.image_path"
            @update:model-value="updateFormData('image_path', $event)"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">不使用圖片</option>
            <option v-for="img in selectedNote.images" :key="img.image_id" :value="(img as { image_path?: string }).image_path || ''">
              {{ (img as { caption?: string }).caption || `圖片 ${img.image_id}` }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1">標籤（可選）</label>
          <div class="flex flex-wrap gap-2">
            <label
              v-for="tag in hashtags"
              :key="tag.tag_id"
              class="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                :value="tag.tag_id"
                :checked="importFormData.tag_ids.includes(tag.tag_id)"
                @change="toggleTag(tag.tag_id)"
                class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span class="text-sm text-slate-700">{{ tag.tag_name }}</span>
            </label>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            @click="$emit('close')"
            class="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            取消
          </button>
          <button
            type="submit"
            :disabled="importing"
            class="rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-50"
          >
            {{ importing ? '匯入中...' : '匯入題庫' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StudentNote, ImportFormData } from '../../composables/useStudentNotes'
import BlockEditor from '../BlockEditor/BlockEditor.vue'

interface Props {
  isOpen: boolean
  selectedNote: StudentNote | null
  importFormData: ImportFormData
  subjects: Array<{ subject_id: number; name: string; code?: string; [key: string]: unknown }>
  hashtags: Array<{ tag_id: number; tag_name: string; [key: string]: unknown }>
  importing: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  import: []
  'update:import-form-data': [data: ImportFormData]
}>()

const updateFormData = (key: keyof ImportFormData, value: unknown) => {
  const updated = { ...props.importFormData, [key]: value }
  emit('update:import-form-data', updated)
}

const toggleTag = (tagId: number) => {
  const tagIds = [...props.importFormData.tag_ids]
  const index = tagIds.indexOf(tagId)
  if (index > -1) {
    tagIds.splice(index, 1)
  } else {
    tagIds.push(tagId)
  }
  updateFormData('tag_ids', tagIds)
}
</script>

