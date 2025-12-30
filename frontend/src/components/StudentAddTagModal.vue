<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    @click.self="$emit('close')"
  >
    <div class="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
      <div class="mb-6 flex items-center justify-between">
        <h3 class="text-xl font-bold text-slate-900">
          為「{{ student?.name }}」添加標籤
        </h3>
        <button
          @click="$emit('close')"
          class="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div v-if="availableTags.length === 0" class="text-center py-8">
        <p class="text-slate-500 mb-4">目前沒有標籤</p>
        <button
          @click="$emit('openTagManager')"
          class="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600"
        >
          新增標籤
        </button>
      </div>
      <div v-else class="space-y-2 max-h-96 overflow-y-auto">
        <div
          v-for="tag in availableTags"
          :key="tag.group_id"
          class="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 hover:bg-slate-50"
        >
          <div class="flex-1">
            <h4 class="font-semibold text-slate-900">{{ tag.name }}</h4>
            <p v-if="tag.description" class="mt-1 text-sm text-slate-500">{{ tag.description }}</p>
          </div>
          <div>
            <button
              v-if="student && student.student_groups && student.student_groups.some(g => g.group_id === tag.group_id)"
              disabled
              class="rounded-lg border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-400 cursor-not-allowed"
            >
              已添加
            </button>
            <button
              v-else
              @click="$emit('add', tag.group_id)"
              :disabled="isAdding"
              class="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isAdding ? '添加中...' : '添加' }}
            </button>
          </div>
        </div>
      </div>
      <div v-if="availableTags.length > 0" class="mt-4 pt-4 border-t border-slate-200">
        <button
          @click="$emit('openTagManager')"
          class="w-full rounded-lg border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
        >
          管理標籤
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NormalizedStudent } from '../utils/studentUtils'
import type { Tag } from '../composables/useStudentTags'

interface Props {
  isOpen: boolean
  student: NormalizedStudent | null
  availableTags: Tag[]
  isAdding: boolean
}

defineProps<Props>()

defineEmits<{
  (e: 'close'): void
  (e: 'add', tagId: number): void
  (e: 'openTagManager'): void
}>()
</script>

