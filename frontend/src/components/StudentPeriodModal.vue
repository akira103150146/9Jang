<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
    @click.self="$emit('close')"
  >
    <div class="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold text-slate-900">
          管理上課期間 - {{ enrollment?.course_name }}
        </h3>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div v-if="loading" class="text-center py-12 text-slate-500">載入中...</div>

      <div v-else class="space-y-4">
        <div class="space-y-3">
          <div
            v-for="(period, index) in periods"
            :key="index"
            class="rounded-lg border border-slate-200 bg-slate-50 p-4"
          >
            <div class="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1">開始日期 *</label>
                <input
                  :value="period.start_date"
                  @input="updatePeriod(index, 'start_date', ($event.target as HTMLInputElement).value)"
                  type="date"
                  required
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1">結束日期</label>
                <input
                  :value="period.end_date"
                  @input="updatePeriod(index, 'end_date', ($event.target as HTMLInputElement).value)"
                  type="date"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>
            </div>
            <div class="mb-3">
              <label class="block text-sm font-semibold text-slate-700 mb-1">備註</label>
              <input
                :value="period.notes"
                @input="updatePeriod(index, 'notes', ($event.target as HTMLInputElement).value)"
                type="text"
                placeholder="輸入備註（選填）"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>
            <div class="flex items-center justify-between">
              <label class="flex items-center">
                <input
                  :checked="period.is_active"
                  @change="updatePeriod(index, 'is_active', ($event.target as HTMLInputElement).checked)"
                  type="checkbox"
                  class="rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                />
                <span class="ml-2 text-sm text-slate-700">啟用</span>
              </label>
              <button
                v-if="periods.length > 1"
                @click="$emit('removePeriod', index)"
                class="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-700 hover:bg-rose-100"
              >
                刪除
              </button>
            </div>
          </div>
        </div>

        <div class="flex justify-between gap-3 pt-4 border-t border-slate-200">
          <button
            @click="$emit('addPeriod')"
            class="rounded-lg border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
          >
            + 新增期間
          </button>
          <div class="flex gap-3">
            <button
              @click="$emit('close')"
              class="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              取消
            </button>
            <button
              @click="$emit('save')"
              :disabled="saving"
              class="rounded-lg bg-sky-500 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50"
            >
              {{ saving ? '儲存中...' : '儲存' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Enrollment, Period } from '../composables/useStudentEnrollment'

interface Props {
  isOpen: boolean
  enrollment: Enrollment | null
  periods: Period[]
  loading: boolean
  saving: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save'): void
  (e: 'addPeriod'): void
  (e: 'removePeriod', index: number): void
  (e: 'update:periods', periods: Period[]): void
}>()

const updatePeriod = (index: number, key: keyof Period, value: string | boolean) => {
  const updatedPeriods = [...props.periods]
  updatedPeriods[index] = { ...updatedPeriods[index], [key]: value }
  emit('update:periods', updatedPeriods)
}
</script>

