<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
    @click.self="$emit('close')"
  >
    <div class="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold text-slate-900">
          {{ student?.name }} - 課程報名管理
        </h3>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div v-if="loading" class="text-center py-12 text-slate-500">載入中...</div>

      <div v-else class="space-y-6">
        <!-- 已報名課程列表 -->
        <section v-if="enrollments.length > 0">
          <h4 class="text-lg font-semibold text-slate-900 mb-3">已報名課程</h4>
          <div class="space-y-3">
            <div
              v-for="enrollment in enrollments"
              :key="enrollment.enrollment_id"
              class="rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <div class="flex items-start justify-between mb-2">
                <div class="flex-1">
                  <p class="font-semibold text-slate-900">{{ enrollment.course_name }}</p>
                  <p class="text-sm text-slate-600">報名日期：{{ formatDate(enrollment.enroll_date) }}</p>
                  <p class="text-sm text-slate-600">折扣：{{ enrollment.discount_rate }}%</p>
                  <div v-if="enrollment.periods && enrollment.periods.length > 0" class="mt-2">
                    <p class="text-xs font-semibold text-slate-600 mb-1">上課期間：</p>
                    <div class="space-y-1">
                      <div
                        v-for="(period, idx) in enrollment.periods"
                        :key="idx"
                        class="text-xs text-slate-700"
                      >
                        <span v-if="(period as { is_active?: boolean }).is_active" class="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                        <span v-else class="inline-block w-2 h-2 rounded-full bg-slate-400 mr-1"></span>
                        {{ formatDate((period as { start_date?: string }).start_date) }} ~
                        {{ (period as { end_date?: string }).end_date ? formatDate((period as { end_date?: string }).end_date) : '進行中' }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex gap-2 ml-4">
                  <button
                    @click="$emit('managePeriods', enrollment)"
                    class="rounded-full bg-indigo-500 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-600"
                  >
                    管理期間
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 新增報名表單 -->
        <section class="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h4 class="text-lg font-semibold text-slate-900 mb-4">新增課程報名</h4>
          <form @submit.prevent="$emit('save')" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">學生</label>
              <input
                :value="student?.name"
                type="text"
                disabled
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-slate-100 text-slate-600"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">課程 *</label>
              <select
                :value="enrollmentForm.course"
                @input="updateForm('course', ($event.target as HTMLSelectElement).value)"
                required
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                <option value="">請選擇課程</option>
                <option
                  v-for="course in courses"
                  :key="course.course_id || (course as { id?: number }).id"
                  :value="String(course.course_id || (course as { id?: number }).id || '')"
                >
                  {{ course.course_name }}
                  ({{ getDayDisplay((course as { day_of_week?: string }).day_of_week || '') }}
                  {{ formatTime((course as { start_time?: string }).start_time) }}-{{ formatTime((course as { end_time?: string }).end_time) }})
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">報名日期 *</label>
              <input
                :value="enrollmentForm.enroll_date"
                @input="updateForm('enroll_date', ($event.target as HTMLInputElement).value)"
                type="date"
                required
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">折扣百分比 (%)</label>
              <input
                :value="enrollmentForm.discount_rate"
                @input="updateForm('discount_rate', Number(($event.target as HTMLInputElement).value))"
                type="number"
                step="0.01"
                min="0"
                max="100"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="0.00"
              />
              <p class="mt-1 text-xs text-slate-500">輸入折扣百分比，例如：10 表示 10% 折扣</p>
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button
                type="button"
                @click="$emit('close')"
                class="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                關閉
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50"
              >
                {{ saving ? '處理中...' : '新增報名' }}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate, formatTime, getDayDisplay } from '../utils/studentFormatters'
import type { NormalizedStudent } from '../utils/studentUtils'
import type { Enrollment, EnrollmentForm } from '../composables/useStudentEnrollment'

interface Course {
  course_id?: number
  id?: number
  course_name?: string
  day_of_week?: string
  start_time?: string
  end_time?: string
  [key: string]: unknown
}

interface Props {
  isOpen: boolean
  student: NormalizedStudent | null
  courses: Course[]
  enrollments: Enrollment[]
  loading: boolean
  saving: boolean
  enrollmentForm: EnrollmentForm
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save'): void
  (e: 'managePeriods', enrollment: Enrollment): void
  (e: 'update:enrollmentForm', value: EnrollmentForm): void
}>()

const updateForm = (key: keyof EnrollmentForm, value: string | number) => {
  emit('update:enrollmentForm', { ...props.enrollmentForm, [key]: value })
}
</script>

