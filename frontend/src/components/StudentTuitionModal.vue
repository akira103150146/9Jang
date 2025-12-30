<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
    @click.self="$emit('close')"
  >
    <div class="w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold text-slate-900">
          {{ student?.name }} - 學費生成
        </h3>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div v-if="loading" class="text-center py-12 text-slate-500">載入中...</div>

      <div v-else class="space-y-4">
        <div v-if="tuitionStatus.length === 0" class="text-center py-8 text-slate-500">
          該學生沒有需要生成的學費
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="(item, index) in tuitionStatus"
            :key="index"
            class="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4"
          >
            <div class="flex items-center gap-3">
              <input
                :checked="item.selected"
                @change="toggleSelection(index, ($event.target as HTMLInputElement).checked)"
                type="checkbox"
                class="rounded border-slate-300 text-sky-500 focus:ring-sky-500"
              />
              <div>
                <p class="font-semibold text-slate-900">
                  {{ item.year }}年 {{ item.month }}月
                </p>
                <p v-if="item.course_name" class="text-sm text-slate-600">{{ item.course_name }}</p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-right">
                <p class="text-sm text-slate-600">週數</p>
                <input
                  :value="item.weeks || 4"
                  @input="updateWeeks(index, Number(($event.target as HTMLInputElement).value))"
                  type="number"
                  min="1"
                  class="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm text-center focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>
              <div v-if="item.weekly_fee" class="text-right">
                <p class="text-sm text-slate-600">每週費用</p>
                <p class="font-semibold text-slate-900">${{ formatAmount(item.weekly_fee) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="tuitionStatus.length > 0" class="rounded-lg border border-sky-200 bg-sky-50 p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-600">已選中 {{ selectedCount }} 項</p>
            </div>
            <button
              @click="$emit('generate')"
              :disabled="!hasSelectedTuitions || saving"
              class="rounded-lg bg-sky-500 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ saving ? '生成中...' : `生成 ${selectedCount} 項學費` }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatAmount } from '../utils/studentFormatters'
import type { NormalizedStudent } from '../utils/studentUtils'
import type { TuitionStatusItem } from '../composables/useStudentTuition'

interface Props {
  isOpen: boolean
  student: NormalizedStudent | null
  tuitionStatus: TuitionStatusItem[]
  loading: boolean
  saving: boolean
  hasSelectedTuitions: boolean
  selectedCount: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'generate'): void
  (e: 'update:tuitionStatus', status: TuitionStatusItem[]): void
}>()

const toggleSelection = (index: number, selected: boolean) => {
  const updated = [...props.tuitionStatus]
  updated[index] = { ...updated[index], selected }
  emit('update:tuitionStatus', updated)
}

const updateWeeks = (index: number, weeks: number) => {
  const updated = [...props.tuitionStatus]
  updated[index] = { ...updated[index], weeks }
  emit('update:tuitionStatus', updated)
}
</script>

