<template>
  <div class="space-y-6">
    <header class="rounded-3xl border border-blue-100 bg-gradient-to-r from-white via-blue-50 to-sky-50 p-6 shadow-sm">
      <p class="text-sm font-semibold text-slate-500">課程模組</p>
      <h2 class="text-2xl font-bold text-slate-900">課程與時段管理</h2>
      <p class="mt-2 text-sm text-slate-500">掌握每堂課的授課老師、費用與狀態</p>
    </header>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="course in courses"
        :key="course.course_id"
        class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">Course #{{ course.course_id }}</p>
            <h3 class="mt-1 text-lg font-semibold text-slate-900">{{ course.course_name }}</h3>
          </div>
          <span
            class="rounded-full px-3 py-1 text-xs font-semibold"
            :class="course.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'"
          >
            {{ course.status }}
          </span>
        </div>

        <dl class="mt-4 space-y-2 text-sm text-slate-600">
          <div class="flex justify-between">
            <dt class="font-medium text-slate-500">授課老師</dt>
            <dd>{{ course.teacher_name }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="font-medium text-slate-500">上課時間</dt>
            <dd>{{ course.day_of_week }} ・ {{ course.start_time }} - {{ course.end_time }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="font-medium text-slate-500">每堂費用</dt>
            <dd class="font-semibold text-slate-900">${{ course.fee_per_session }}</dd>
          </div>
        </dl>
      </article>
    </div>
  </div>
</template>

<script setup>
import { mockCourses } from '../data/mockData'

const courses = mockCourses
</script>

