<template>
  <div class="space-y-6">
    <header class="rounded-3xl border border-blue-100 bg-gradient-to-r from-white to-sky-50 p-6 shadow-sm">
      <p class="text-sm font-semibold text-slate-500">出缺勤模組</p>
      <h2 class="text-2xl font-bold text-slate-900">課程場次與出席追蹤</h2>
      <p class="mt-2 text-sm text-slate-500">包含上課記錄、出席狀態與請假資訊</p>
    </header>

    <section class="grid gap-6 lg:grid-cols-2">
      <article class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <h3 class="text-lg font-semibold text-slate-900">課程場次 Session</h3>
        <p class="text-sm text-slate-500">依照日期排列的最近三堂課</p>
        <ul class="mt-4 divide-y divide-slate-100">
          <li
            v-for="session in sessionRecords"
            :key="session.session_id"
            class="flex items-center justify-between py-3"
          >
            <div>
              <p class="text-sm font-semibold text-slate-900">{{ session.course_name }}</p>
              <p class="text-xs text-slate-500">{{ session.session_date }}</p>
            </div>
            <span
              class="rounded-full px-3 py-1 text-xs font-semibold"
              :class="session.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'"
            >
              {{ session.status }}
            </span>
          </li>
        </ul>
      </article>

      <article class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <h3 class="text-lg font-semibold text-slate-900">出席狀態 Attendance</h3>
        <p class="text-sm text-slate-500">最新一堂課的點名結果</p>
        <ul class="mt-4 divide-y divide-slate-100">
          <li
            v-for="record in attendanceRecords"
            :key="record.attendance_id"
            class="flex items-center justify-between py-3"
          >
            <div>
              <p class="text-sm font-semibold text-slate-900">{{ record.student_name }}</p>
              <p class="text-xs text-slate-500">Session #{{ record.session_id }}</p>
            </div>
            <span
              class="rounded-full px-3 py-1 text-xs font-semibold"
              :class="statusColor(record.status)"
            >
              {{ record.status }}
            </span>
          </li>
        </ul>
      </article>
    </section>

    <section class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <h3 class="text-lg font-semibold text-slate-900">請假紀錄 Leave</h3>
      <p class="text-sm text-slate-500">審核狀態與請假原因</p>

      <div class="mt-4 overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">學生</th>
              <th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">課程</th>
              <th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">日期</th>
              <th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">原因</th>
              <th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">狀態</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="leave in leaveRequests" :key="leave.leave_id" class="transition hover:bg-slate-50/70">
              <td class="px-3 py-3 text-sm font-semibold text-slate-900">{{ leave.student_name }}</td>
              <td class="px-3 py-3 text-sm text-slate-600">{{ leave.course_name }}</td>
              <td class="px-3 py-3 text-sm text-slate-600">{{ leave.leave_date }}</td>
              <td class="px-3 py-3 text-sm text-slate-600">{{ leave.reason }}</td>
              <td class="px-3 py-3">
                <span class="rounded-full px-3 py-1 text-xs font-semibold" :class="statusColor(leave.approval_status)">
                  {{ leave.approval_status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import {
  mockSessionRecords,
  mockAttendanceRecords,
  mockLeaveRequests,
} from '../data/mockData'

const sessionRecords = mockSessionRecords
const attendanceRecords = mockAttendanceRecords
const leaveRequests = mockLeaveRequests

const statusColor = (status) => {
  const map = {
    Present: 'bg-emerald-50 text-emerald-600',
    Absent: 'bg-rose-50 text-rose-600',
    Late: 'bg-amber-50 text-amber-600',
    Leave: 'bg-indigo-50 text-indigo-600',
    Approved: 'bg-emerald-50 text-emerald-600',
    Pending: 'bg-amber-50 text-amber-600',
    Rejected: 'bg-rose-50 text-rose-600',
    Scheduled: 'bg-indigo-50 text-indigo-600',
    Completed: 'bg-slate-100 text-slate-700',
  }
  return map[status] ?? 'bg-slate-100 text-slate-700'
}
</script>

