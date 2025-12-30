<template>
  <section class="rounded-3xl border border-slate-100 bg-white shadow-sm">
    <div class="p-5 border-b border-slate-100">
      <h3 class="text-lg font-semibold text-slate-900">學生筆記列表</h3>
      <p class="text-sm text-slate-500">點擊筆記查看詳情，可匯入題庫</p>
    </div>

    <div v-if="loading" class="p-12 text-center">
      <p class="text-slate-500">載入中...</p>
    </div>

    <div v-else-if="studentNotes.length === 0" class="p-12 text-center">
      <p class="text-slate-500">目前沒有學生筆記。</p>
    </div>

    <div v-else class="divide-y divide-slate-100">
      <div
        v-for="note in studentNotes"
        :key="note.note_id"
        class="p-5 transition hover:bg-slate-50/70 cursor-pointer"
        @click="$emit('view-detail', note)"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <span v-if="note.subject" class="text-xs text-slate-500">
                {{ note.subject }}
              </span>
              <span class="text-xs text-slate-500">
                {{ formatDateTime(note.created_at) }}
              </span>
              <span v-if="note.images && note.images.length > 0" class="text-xs text-slate-500">
                📷 {{ note.images.length }} 張照片
              </span>
            </div>
            <h4 class="text-lg font-semibold text-slate-900 mb-1">
              {{ (note as { title?: string }).title || '無標題' }}
            </h4>
            <div v-if="note.content" class="text-sm text-slate-600 mb-3 line-clamp-2 markdown-preview" v-html="getNoteContentDisplay(note)"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { StudentNote } from '../../composables/useStudentNotes'
import { useMarkdownRenderer } from '../../composables/useMarkdownRenderer'
import { useTiptapConverter } from '../../composables/useTiptapConverter'

interface Props {
  studentNotes: StudentNote[]
  loading: boolean
}

const props = defineProps<Props>()

defineEmits<{
  'view-detail': [note: StudentNote]
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

