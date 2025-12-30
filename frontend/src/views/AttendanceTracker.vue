<template>
  <div class="space-y-6">
    <header class="rounded-3xl border border-blue-100 bg-gradient-to-r from-white to-sky-50 p-6 shadow-sm">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-semibold text-slate-500">請假管理</p>
          <h2 class="text-2xl font-bold text-slate-900">請假記錄與審核</h2>
          <p class="mt-2 text-sm text-slate-500">管理學生請假申請與審核狀態</p>
        </div>
        <router-link
          to="/attendance/leaves/add"
          class="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-md hover:from-sky-600 hover:to-indigo-600"
        >
          新增請假記錄
        </router-link>
      </div>
      <p v-if="usingMock" class="mt-3 text-sm text-amber-600">
        目前顯示示意資料（mock data），待後端欄位完善後即可串接。
      </p>
    </header>

    <section class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <h3 class="text-lg font-semibold text-slate-900 mb-4">請假紀錄</h3>
      <p class="text-sm text-slate-500 mb-4">審核狀態與請假原因</p>

      <div v-if="loading" class="text-center py-12 text-slate-500">載入中...</div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">學生</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">課程</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">請假日期</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">原因</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">審核狀態</th>
              <th class="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr 
              v-for="leave in leaveRequests" 
              :key="leave.leave_id" 
              class="transition hover:bg-slate-50/70"
            >
              <td class="whitespace-nowrap px-4 py-4">
                <p class="text-sm font-semibold text-slate-900">{{ leave.student_name }}</p>
                <p class="text-xs text-slate-500">ID: {{ leave.leave_id ?? '—' }}</p>
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-slate-700">{{ leave.course_name }}</td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-slate-700">{{ formatDate(leave.leave_date) }}</td>
              <td class="px-4 py-4 text-sm text-slate-700">{{ leave.reason }}</td>
              <td class="whitespace-nowrap px-4 py-4">
                <span 
                  class="rounded-full px-3 py-1 text-xs font-semibold" 
                  :class="statusColor(leave.approval_status)"
                >
                  {{ getStatusDisplay(leave.approval_status) }}
                </span>
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-center">
                <div class="flex justify-center gap-2">
                  <router-link
                    :to="`/attendance/leaves/edit/${leave.leave_id || leave.id}`"
                    class="rounded-full bg-sky-500 px-3 py-1 text-xs font-semibold text-white hover:bg-sky-600"
                  >
                    編輯
                  </router-link>
                  <button
                    @click="deleteLeave(leave.leave_id || leave.id, leave.student_name)"
                    class="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-600"
                  >
                    刪除
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="leaveRequests.length === 0">
              <td colspan="6" class="py-4 px-4 text-center text-slate-500">目前沒有請假記錄。</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { leaveAPI } from '../services/api'
import { mockLeaveRequests } from '../data/mockData'

const leaveRequests = ref([])
const loading = ref(false)
const usingMock = ref(false)

const statusMap = {
  'Pending': '待審核',
  'Approved': '已核准',
  'Rejected': '已拒絕',
}

const normalizeLeave = (leave) => ({
  leave_id: leave.leave_id || leave.id,
  student: leave.student,
  student_name: leave.student_name || leave.student?.name || '',
  course: leave.course,
  course_name: leave.course_name || leave.course?.course_name || '',
  leave_date: leave.leave_date,
  reason: leave.reason || '',
  approval_status: leave.approval_status || 'Pending',
})

const formatDate = (date) => {
  if (!date) return ''
  return typeof date === 'string' ? date.replace(/-/g, '/') : date
}

const getStatusDisplay = (status) => {
  return statusMap[status] || status
}

const statusColor = (status) => {
  const map = {
    Approved: 'bg-emerald-50 text-emerald-600',
    Pending: 'bg-amber-50 text-amber-600',
    Rejected: 'bg-rose-50 text-rose-600',
  }
  return map[status] ?? 'bg-slate-100 text-slate-700'
}

const fetchLeaves = async () => {
  loading.value = true
  try {
    const response = await leaveAPI.getAll()
    const data = response.data.results || response.data
    leaveRequests.value = data.map((item) => normalizeLeave(item))
    usingMock.value = false
  } catch (error) {
    console.warn('獲取請假記錄失敗，使用 mock 資料：', error)
    leaveRequests.value = mockLeaveRequests.map((item) => normalizeLeave(item))
    usingMock.value = true
  } finally {
    loading.value = false
  }
}

const deleteLeave = async (id, studentName) => {
  if (!id) {
    alert('示意資料無法刪除，請於 API 可用後再操作。')
    return
  }

  if (!confirm(`確定要刪除「${studentName}」的請假記錄嗎？`)) {
    return
  }

  try {
    await leaveAPI.delete(id)
    alert('刪除成功')
    fetchLeaves()
  } catch (error) {
    console.error('刪除失敗:', error)
    alert('刪除失敗，請稍後再試')
  }
}

onMounted(() => {
  fetchLeaves()
})
</script>

