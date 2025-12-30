<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    @click.self="$emit('close')"
  >
    <div class="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl max-h-[80vh] overflow-y-auto">
      <div class="mb-6 flex items-center justify-between">
        <h3 class="text-xl font-bold text-slate-900">
          {{ editingTag ? '編輯標籤' : '標籤管理' }}
        </h3>
        <div class="flex gap-2">
          <button
            v-if="editingTag || isCreatingTag"
            @click="$emit('cancel')"
            class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {{ editingTag ? '返回列表' : '取消' }}
          </button>
          <button
            v-if="!editingTag && !isCreatingTag"
            @click="$emit('create')"
            class="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600"
          >
            新增標籤
          </button>
          <button
            @click="$emit('close')"
            class="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 編輯/新增表單 -->
      <div v-if="editingTag || isCreatingTag" class="mb-6 space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1">標籤名稱 *</label>
          <input
            v-model="tagFormModel.name"
            type="text"
            placeholder="請輸入標籤名稱"
            class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        </div>
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1">描述</label>
          <textarea
            v-model="tagFormModel.description"
            rows="3"
            placeholder="請輸入標籤描述（選填）"
            class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          ></textarea>
        </div>
        <div class="flex justify-end gap-3">
          <button
            @click="$emit('cancel')"
            class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            取消
          </button>
          <button
            @click="$emit('save')"
            :disabled="savingTag"
            class="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ savingTag ? '儲存中...' : (editingTag ? '更新' : '創建') }}
          </button>
        </div>
      </div>

      <!-- 標籤列表 -->
      <div v-if="!editingTag && !isCreatingTag">
        <div v-if="availableTags.length === 0" class="text-center py-8 text-slate-500">
          目前沒有標籤，點擊「新增標籤」開始創建
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="tag in availableTags"
            :key="tag.group_id"
            class="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 hover:bg-slate-50"
          >
            <div class="flex-1">
              <h4 class="font-semibold text-slate-900">{{ tag.name }}</h4>
              <p v-if="tag.description" class="mt-1 text-sm text-slate-500">{{ tag.description }}</p>
              <p class="mt-1 text-xs text-slate-400">學生數：{{ tag.students_count || 0 }}</p>
            </div>
            <div class="flex gap-2">
              <button
                @click="$emit('edit', tag)"
                class="rounded-lg border border-sky-300 bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700 hover:bg-sky-100"
              >
                編輯
              </button>
              <button
                @click="$emit('delete', tag.group_id)"
                class="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-700 hover:bg-rose-100"
              >
                刪除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Tag, TagForm } from '../composables/useStudentTags'

interface Props {
  isOpen: boolean
  availableTags: Tag[]
  editingTag: Tag | null
  isCreatingTag: boolean
  tagForm: TagForm
  savingTag: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'create'): void
  (e: 'save'): void
  (e: 'cancel'): void
  (e: 'edit', tag: Tag): void
  (e: 'delete', tagId: number): void
  (e: 'update:tagForm', value: TagForm): void
}>()

const tagFormModel = computed({
  get: () => props.tagForm,
  set: (value) => emit('update:tagForm', value),
})
</script>

