<template>
  <div class="space-y-8">
    <section class="rounded-3xl border border-blue-100 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 p-6 shadow-sm">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-widest text-sky-500">今日概況</p>
          <h2 class="mt-2 text-2xl font-bold text-slate-900">補習班營運儀表板</h2>
          <p class="mt-1 text-slate-600">快速掌握學生、課程與費用狀態</p>
        </div>
        <div class="flex flex-wrap gap-3">
          <button class="rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur hover:bg-white">
            本週課程 {{ sessionRecords.length }} 堂
          </button>
          <button class="rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur hover:bg-white">
            未付費用 {{ pendingFeesList.length }} 筆
          </button>
        </div>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="metric in metrics"
        :key="metric.label"
        class="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <p class="text-sm font-semibold text-slate-500">{{ metric.label }}</p>
        <div class="mt-2 flex items-baseline gap-2">
          <p class="text-3xl font-bold text-slate-900">{{ metric.value }}</p>
          <span class="text-xs font-semibold text-sky-500">{{ metric.badge }}</span>
        </div>
        <p class="mt-2 text-sm text-slate-500">{{ metric.desc }}</p>
      </div>
    </section>

    <section class="grid gap-6 lg:grid-cols-2">
      <div class="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-semibold text-slate-500">本週行程</p>
            <h3 class="text-xl font-semibold text-slate-900">課程排程</h3>
          </div>
          <span class="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-600">即時更新</span>
        </div>
        <ul class="mt-6 space-y-4">
          <li
            v-for="session in upcomingSessions"
            :key="session.session_id"
            class="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3"
          >
            <div>
              <p class="text-sm font-semibold text-slate-500">{{ session.session_date }}</p>
              <p class="text-base font-semibold text-slate-900">{{ session.course_name }}</p>
            </div>
            <span
              class="rounded-full px-3 py-1 text-xs font-semibold"
              :class="session.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'"
            >
              {{ session.status }}
            </span>
          </li>
        </ul>
      </div>
      <div class="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-semibold text-slate-500">費用追蹤</p>
            <h3 class="text-xl font-semibold text-slate-900">待處理款項</h3>
          </div>
          <span class="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">提醒</span>
        </div>
        <ul class="mt-6 space-y-4">
          <li
            v-for="fee in pendingFeesList"
            :key="fee.fee_id"
            class="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3"
          >
            <div>
              <p class="text-sm font-semibold text-slate-500">{{ fee.student_name }}</p>
              <p class="text-base font-semibold text-slate-900">{{ fee.item }} ・ ${{ fee.amount }}</p>
            </div>
            <span class="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
              {{ fee.payment_status }}
            </span>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup>
import {
  mockStudents,
  mockTeachers,
  mockCourses,
  mockSessionRecords,
  mockExtraFees,
} from '../data/mockData'

const totalStudents = mockStudents.length
const totalTeachers = mockTeachers.length
const totalCourses = mockCourses.length
const pendingFees = mockExtraFees.filter((item) => item.payment_status !== 'Paid')
const pendingFeeAmount = pendingFees.reduce((sum, fee) => sum + fee.amount, 0)

const metrics = [
  {
    label: '在籍學生',
    value: totalStudents,
    badge: '+2 本週',
    desc: '含高三衝刺班 3 人',
  },
  {
    label: '授課老師',
    value: totalTeachers,
    badge: '全職 2 / 兼職 1',
    desc: '含 1 位管理員',
  },
  {
    label: '進行中課程',
    value: totalCourses,
    badge: 'Active',
    desc: '包含 Pending 課程 1 堂',
  },
  {
    label: '待收款項',
    value: `$${pendingFeeAmount}`,
    badge: `${pendingFees.length} 筆`,
    desc: '請於本月 25 日前完成催收',
  },
]

const sessionRecords = mockSessionRecords
const upcomingSessions = sessionRecords.slice(0, 3)
const pendingFeesList = pendingFees
</script>

