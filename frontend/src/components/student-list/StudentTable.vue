<template>
  <div class="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-100">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">姓名</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">學校 / 年級</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">手機</th>
            <th v-if="isAdmin" class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">帳號 / 密碼</th>
            <th v-if="canSeeAccountingFeatures || isTeacher" class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">報名課程</th>
            <th v-if="canSeeAccountingFeatures || isTeacher" class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">標籤</th>
            <th v-if="canSeeAccountingFeatures" class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">總費用 / 待繳</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">緊急聯絡人</th>
            <th class="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="student in students" :key="student.id" :class="{'opacity-50 bg-slate-50': student.is_deleted}" class="transition hover:bg-slate-50/70">
            <td class="px-4 py-4">
              <p class="font-semibold text-slate-900">{{ student.name }}</p>
              <p class="text-xs text-slate-500">ID: {{ student.id ?? '—' }}</p>
            </td>
            <td class="px-4 py-4 text-sm text-slate-700">{{ student.school }} / {{ student.grade }}</td>
            <td class="px-4 py-4 text-sm text-slate-700">{{ student.phone || '—' }}</td>
            <td v-if="isAdmin" class="px-4 py-4 text-sm">
              <div v-if="student.username" class="space-y-2">
                <div>
                  <p class="text-xs text-slate-500">帳號</p>
                  <p class="font-semibold text-slate-900">{{ student.username }}</p>
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <p class="text-xs text-slate-500">密碼</p>
                    <button
                      @click="$emit('toggle-password-visibility', student.id)"
                      class="text-xs text-sky-600 hover:text-sky-800 font-semibold"
                    >
                      {{ visiblePasswords[student.id] ? '隱藏' : '顯示' }}
                    </button>
                  </div>
                  <div v-if="editingPasswords[student.id]" class="mt-1 flex items-center gap-2">
                    <input
                      :value="passwordForms[student.id]?.password || ''"
                      @input="$emit('update:password-form', { id: student.id, password: ($event.target as HTMLInputElement).value })"
                      type="text"
                      class="flex-1 rounded border border-slate-300 px-2 py-1 text-xs focus:border-sky-500 focus:outline-none"
                      placeholder="輸入新密碼"
                    />
                    <button
                      @click="$emit('save-password', student)"
                      class="rounded bg-green-500 px-2 py-1 text-xs font-semibold text-white hover:bg-green-600"
                    >
                      儲存
                    </button>
                    <button
                      @click="$emit('cancel-edit-password', student.id)"
                      class="rounded bg-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-400"
                    >
                      取消
                    </button>
                  </div>
                  <div v-else class="mt-1">
                    <p class="font-mono text-sm text-slate-900">
                      {{ visiblePasswords[student.id] ? (student.password || '—') : '••••••' }}
                    </p>
                    <button
                      @click="$emit('start-edit-password', student)"
                      class="mt-1 text-xs text-sky-600 hover:text-sky-800 font-semibold"
                    >
                      編輯
                    </button>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span
                    class="rounded-full px-2 py-1 text-xs font-semibold"
                    :class="student.is_account_active ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'"
                  >
                    {{ student.is_account_active ? '啟用' : '停用' }}
                  </span>
                  <span
                    v-if="student.must_change_password"
                    class="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-600"
                  >
                    需修改密碼
                  </span>
                  <button
                    @click="$emit('toggle-account-status', student)"
                    class="text-xs text-slate-600 hover:text-slate-800 font-semibold"
                  >
                    {{ student.is_account_active ? '停用' : '啟用' }}
                  </button>
                </div>
              </div>
              <p v-else class="text-xs text-slate-400">尚未創建帳號</p>
            </td>
            <td v-if="canSeeAccountingFeatures || isTeacher" class="px-4 py-4 text-sm">
              <div v-if="student.enrollments && student.enrollments.length > 0" class="space-y-1">
                <div
                  v-for="enrollment in student.enrollments"
                  :key="enrollment.enrollment_id"
                  class="flex items-center gap-2"
                >
                  <span
                    class="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold"
                    :class="enrollment.is_active ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'"
                  >
                    {{ enrollment.course_name }}
                  </span>
                  <span v-if="!enrollment.is_active" class="text-xs text-slate-400">(已暫停)</span>
                </div>
              </div>
              <p v-else class="text-xs text-slate-400">尚未報名課程</p>
            </td>
            <td v-if="canSeeAccountingFeatures || isTeacher" class="px-4 py-4 text-sm">
              <div v-if="student.student_groups && student.student_groups.length > 0" class="flex flex-wrap gap-1">
                <span
                  v-for="group in student.student_groups"
                  :key="group.group_id"
                  class="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700"
                >
                  {{ group.name }}
                  <button
                    v-if="canSeeAccountingFeatures || isTeacher"
                    @click="$emit('remove-student-from-tag', student, group)"
                    class="text-indigo-600 hover:text-indigo-800"
                    title="移除標籤"
                  >
                    ×
                  </button>
                </span>
              </div>
              <div class="flex items-center gap-2">
                <p v-if="!student.student_groups || student.student_groups.length === 0" class="text-xs text-slate-400">無標籤</p>
                <button
                  v-if="canSeeAccountingFeatures || isTeacher"
                  @click="$emit('open-add-tag-modal', student)"
                  class="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline"
                >
                  {{ student.student_groups && student.student_groups.length > 0 ? '添加' : '添加標籤' }}
                </button>
              </div>
            </td>
            <td v-if="canSeeAccountingFeatures" class="px-4 py-4 text-sm">
              <div>
                <p class="text-slate-900 font-semibold">總：$<span class="font-mono">{{ formatAmount(student.total_fees || 0) }}</span></p>
                <p class="text-amber-600" :class="{'font-semibold': student.unpaid_fees > 0}">
                  待繳：$<span class="font-mono">{{ formatAmount(student.unpaid_fees || 0) }}</span>
                </p>
                <div class="mt-1 space-y-1">
                  <button
                    v-if="student.has_tuition_needed"
                    @click="$emit('open-tuition-modal', student)"
                    class="block w-full text-xs text-red-600 hover:text-red-800 font-semibold underline text-left"
                  >
                    生成學費
                  </button>
                  <router-link
                    v-if="student.total_fees > 0"
                    :to="`/fees?student=${student.id}`"
                    class="block w-full text-xs text-blue-600 hover:text-blue-800 font-semibold underline text-left"
                  >
                    費用明細
                  </router-link>
                </div>
              </div>
            </td>
            <td class="px-4 py-4 text-sm text-slate-700">
              <p>{{ student.emergency_contact_name || '—' }}</p>
              <p class="text-xs text-slate-500">{{ student.emergency_contact_phone || '' }}</p>
            </td>
            <td class="px-4 py-4 text-center">
              <div class="flex justify-center gap-2 flex-wrap">
                <button
                  v-if="canSeeAccountingFeatures"
                  @click="$emit('open-enrollment-modal', student)"
                  class="rounded-full bg-indigo-500 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-600"
                >
                  報名課程
                </button>
                <router-link
                  v-if="!isAccountant"
                  :to="`/students/${student.id}/errors`"
                  class="rounded-full bg-purple-500 px-3 py-1 text-xs font-semibold text-white hover:bg-purple-600"
                >
                  錯題本
                </router-link>
                <button
                  @click="$emit('open-leave-modal', student)"
                  class="rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white hover:bg-orange-600"
                >
                  請假
                </button>
                <router-link
                  v-if="canSeeAccountingFeatures"
                  :to="`/students/edit/${student.id}`"
                  class="rounded-full bg-sky-500 px-3 py-1 text-xs font-semibold text-white hover:bg-sky-600"
                >
                  編輯
                </router-link>
              </div>
            </td>
          </tr>
          <tr v-if="students.length === 0">
            <td :colspan="tableColspan" class="py-4 px-4 text-center text-slate-500">目前沒有學生資料。</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatAmount } from '../../utils/studentFormatters'
import type { NormalizedStudent } from '../../utils/studentUtils'

interface Props {
  students: NormalizedStudent[]
  isAdmin: boolean
  isTeacher: boolean
  isAccountant: boolean
  canSeeAccountingFeatures: boolean
  tableColspan: number
  visiblePasswords: Record<number, boolean>
  editingPasswords: Record<number, boolean>
  passwordForms: Record<number, { password: string }>
}

defineProps<Props>()

defineEmits<{
  'toggle-password-visibility': [id: number]
  'update:password-form': [value: { id: number; password: string }]
  'save-password': [student: NormalizedStudent]
  'cancel-edit-password': [id: number]
  'start-edit-password': [student: NormalizedStudent]
  'toggle-account-status': [student: NormalizedStudent]
  'remove-student-from-tag': [student: NormalizedStudent, group: { group_id: number; name: string }]
  'open-add-tag-modal': [student: NormalizedStudent]
  'open-tuition-modal': [student: NormalizedStudent]
  'open-enrollment-modal': [student: NormalizedStudent]
  'open-leave-modal': [student: NormalizedStudent]
}>()
</script>
