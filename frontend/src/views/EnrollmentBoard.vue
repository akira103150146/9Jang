<template>
  <div class="space-y-6">
    <header class="rounded-3xl border border-blue-100 bg-gradient-to-r from-white to-indigo-50 p-6 shadow-sm">
      <p class="text-sm font-semibold text-slate-500">報名紀錄</p>
      <h2 class="text-2xl font-bold text-slate-900">學生課程報名</h2>
      <p class="mt-2 text-sm text-slate-500">顯示每位學生參與的課程與折扣資訊</p>
    </header>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="record in enrollments"
        :key="record.enrollment_id"
        class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">Enrollment #{{ record.enrollment_id }}</p>
            <h3 class="mt-1 text-lg font-semibold text-slate-900">{{ record.student_name }}</h3>
          </div>
          <span class="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-600">
            {{ record.enroll_date }}
          </span>
        </div>
        <p class="mt-3 text-sm font-semibold text-slate-600">{{ record.course_name }}</p>
        <p class="text-sm text-slate-500">折扣：{{ record.discount_rate }}%</p>
      </article>
    </div>
  </div>
</template>

<script setup>
import { mockEnrollments } from '../data/mockData'

const enrollments = mockEnrollments
</script>

