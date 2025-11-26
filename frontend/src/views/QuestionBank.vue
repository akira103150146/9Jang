<template>
  <div class="space-y-6">
    <header class="rounded-3xl border border-blue-100 bg-gradient-to-r from-white to-indigo-50 p-6 shadow-sm">
      <p class="text-sm font-semibold text-slate-500">教學模組</p>
      <h2 class="text-2xl font-bold text-slate-900">題庫與標籤系統</h2>
      <p class="mt-2 text-sm text-slate-500">支援 Markdown + LaTeX，含標籤與錯題追蹤</p>
    </header>

    <section class="grid gap-4 lg:grid-cols-2">
      <article
        v-for="question in questionBank"
        :key="question.question_id"
        class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Q{{ question.question_id }} ・ {{ question.subject }} / {{ question.level }}
            </p>
            <h3 class="mt-1 text-lg font-semibold text-slate-900">{{ question.chapter }}</h3>
          </div>
          <span class="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
            難度 {{ question.difficulty }}
          </span>
        </div>
        <p class="mt-3 text-sm text-slate-700">{{ question.content }}</p>
        <div class="mt-4 flex flex-wrap gap-2">
          <span
            v-for="tag in question.tags"
            :key="tag"
            class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
          >
            {{ tag }}
          </span>
        </div>
      </article>
    </section>

    <section class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <h3 class="text-lg font-semibold text-slate-900">錯題追蹤</h3>
      <p class="text-sm text-slate-500">掌握學生複習狀態</p>

      <div class="mt-4 overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">學生</th>
              <th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">題目</th>
              <th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">錯誤次數</th>
              <th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">狀態</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="log in errorLogs"
              :key="log.error_log_id"
              class="transition hover:bg-slate-50/70"
            >
              <td class="px-3 py-3 text-sm font-semibold text-slate-900">{{ log.student_name }}</td>
              <td class="px-3 py-3 text-sm text-slate-600">{{ log.question_title }}</td>
              <td class="px-3 py-3 text-sm font-semibold text-slate-900">{{ log.error_count }}</td>
              <td class="px-3 py-3">
                <span class="rounded-full px-3 py-1 text-xs font-semibold" :class="statusColor(log.review_status)">
                  {{ log.review_status }}
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
import { mockQuestionBank, mockErrorLogs } from '../data/mockData'

const questionBank = mockQuestionBank
const errorLogs = mockErrorLogs

const statusColor = (status) => {
  const map = {
    New: 'bg-rose-50 text-rose-600',
    Reviewing: 'bg-amber-50 text-amber-600',
    Mastered: 'bg-emerald-50 text-emerald-600',
  }
  return map[status] ?? 'bg-slate-100 text-slate-700'
}
</script>

