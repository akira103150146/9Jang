<template>
  <div
    v-if="isOpen && selectedNote"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
    @click.self="$emit('close')"
  >
    <div class="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold text-slate-900">筆記詳情</h3>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="space-y-4">
        <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div class="flex items-center gap-3 mb-3">
            <span v-if="selectedNote.subject" class="text-sm text-slate-600">
              {{ selectedNote.subject }}
            </span>
            <span class="text-sm text-slate-600">
              {{ formatDateTime(selectedNote.created_at) }}
            </span>
          </div>
          <h4 class="text-lg font-semibold text-slate-900 mb-2">{{ (selectedNote as { title?: string }).title || '無標題' }}</h4>
          <div v-if="selectedNote.content" class="text-sm text-slate-700 mb-3 markdown-preview" v-html="getNoteContentDisplay(selectedNote)"></div>
        </div>

        <div v-if="selectedNote.images && selectedNote.images.length > 0" class="rounded-lg border border-slate-200 bg-white p-4">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-semibold text-slate-700">筆記照片</h4>
            <span class="text-xs text-slate-500">{{ selectedNote.images.length }} 張</span>
          </div>
          <div class="grid grid-cols-1 gap-4">
            <div v-for="img in selectedNote.images" :key="img.image_id" class="flex justify-center">
              <ImageRotator 
                :image-url="(img as { image_url?: string; image_path?: string }).image_url || (img as { image_path?: string }).image_path || ''" 
                :alt="(img as { caption?: string }).caption || '筆記圖片'" 
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
            @click="$emit('open-import', selectedNote)"
            class="rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-600"
          >
            匯入題庫
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StudentNote } from '../../composables/useStudentNotes'
import ImageRotator from '../ImageRotator.vue'
import { useMarkdownRenderer } from '../../composables/useMarkdownRenderer'
import { useTiptapConverter } from '../../composables/useTiptapConverter'

interface Props {
  isOpen: boolean
  selectedNote: StudentNote | null
  canImportToQuestionBank: boolean
}

const props = defineProps<Props>()

defineEmits<{
  close: []
  'open-import': [note: StudentNote]
}>()

const { renderMarkdownWithLatex } = useMarkdownRenderer()
const { contentToMarkdown } = useTiptapConverter()

const formatDateTime = (datetime?: string) => {
  if (!datetime) return ''
  const d = new Date(datetime)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const getNoteContentDisplay = (note: StudentNote) => {
  if (typeof note.content === 'string') {
    return renderMarkdownWithLatex(note.content)
  }
  return renderMarkdownWithLatex(contentToMarkdown(note.content as never))
}
</script>

<style scoped>
.markdown-preview {
  line-height: 1.6;
}
</style>

