<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
    @click.self="$emit('close')"
  >
    <div class="w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold text-slate-900">
          {{ student?.name }} - 請假記錄
        </h3>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div v-if="loading" class="text-center py-12 text-slate-500">載入中...</div>

      <div v-else class="space-y-6">
        <!-- 請假記錄列表 -->
        <section>
          <h4 class="text-lg font-semibold text-slate-900 mb-3">請假記錄</h4>

          <div v-if="leaves.length === 0" class="text-center py-8 text-slate-500">
            目前沒有請假記錄
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="leave in leaves"
              :key="leave.leave_id"
              :class="{ 'opacity-50 bg-slate-100': leave.is_deleted }"
              class="rounded-lg border border-slate-200 bg-white p-4"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <p class="font-semibold text-slate-900">{{ leave.course_name }}</p>
                    <span
                      :class="getLeaveStatusColor(leave.approval_status)"
                      class="rounded-full px-3 py-1 text-xs font-semibold"
                    >
                      {{ getLeaveStatusDisplay(leave.approval_status) }}
                    </span>
                  </div>
                  <p class="text-sm text-slate-600">請假日期：{{ formatDate(leave.leave_date) }}</p>
                  <p v-if="leave.reason" class="text-sm text-slate-600 mt-1">原因：{{ leave.reason }}</p>
                </div>
                <div class="flex gap-2 ml-4">
                  <button
                    v-if="!leave.is_deleted"
                    @click="$emit('delete', leave.leave_id, leave.student_name)"
                    class="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-600"
                  >
                    刪除
                  </button>
                  <button
                    v-else
                    @click="$emit('restore', leave.leave_id, leave.student_name)"
                    class="rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white hover:bg-green-600"
                  >
                    恢復
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 新增請假表單 -->
        <section class="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h4 class="text-lg font-semibold text-slate-900 mb-4">新增請假記錄</h4>
          <form @submit.prevent="$emit('submit')" class="space-y-4">
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
                :value="leaveForm.course"
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
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">請假日期 *</label>
              <input
                :value="leaveForm.leave_date"
                @input="updateForm('leave_date', ($event.target as HTMLInputElement).value)"
                type="date"
                required
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">原因 *</label>
              <textarea
                :value="leaveForm.reason"
                @input="updateForm('reason', ($event.target as HTMLTextAreaElement).value)"
                rows="3"
                required
                placeholder="請輸入請假原因"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">審核狀態</label>
              <select
                :value="leaveForm.approval_status"
                @input="updateForm('approval_status', ($event.target as HTMLSelectElement).value as 'Pending' | 'Approved' | 'Rejected')"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                <option value="Pending">待審核</option>
                <option value="Approved">已核准</option>
                <option value="Rejected">已拒絕</option>
              </select>
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button
                type="submit"
                :disabled="saving"
                class="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50"
              >
                {{ saving ? '處理中...' : '新增請假' }}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '../utils/studentFormatters'
import type { NormalizedStudent } from '../utils/studentUtils'
import type { Leave, LeaveForm } from '../composables/useStudentLeave'

interface Course {
  course_id?: number
  id?: number
  course_name?: string
  [key: string]: unknown
}

interface Props {
  isOpen: boolean
  student: NormalizedStudent | null
  courses: Course[]
  leaves: Leave[]
  loading: boolean
  saving: boolean
  leaveForm: LeaveForm
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit'): void
  (e: 'delete', leaveId: number, studentName: string): void
  (e: 'restore', leaveId: number, studentName: string): void
  (e: 'update:leaveForm', value: LeaveForm): void
}>()

const getLeaveStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    Pending: 'bg-amber-50 text-amber-600',
    Approved: 'bg-green-50 text-green-600',
    Rejected: 'bg-rose-50 text-rose-600',
  }
  return colorMap[status] || 'bg-slate-50 text-slate-600'
}

const getLeaveStatusDisplay = (status: string): string => {
  const statusMap: Record<string, string> = {
    Pending: '待審核',
    Approved: '已核准',
    Rejected: '已拒絕',
  }
  return statusMap[status] || status
}

const updateForm = (key: keyof LeaveForm, value: string) => {
  emit('update:leaveForm', { ...props.leaveForm, [key]: value })
}
</script>

