<template>
  <div class="space-y-6">
    <header class="rounded-3xl border border-blue-100 bg-gradient-to-r from-white to-sky-50 p-6 shadow-sm">
      <p class="text-sm font-semibold text-slate-500">教學團隊</p>
      <h2 class="text-2xl font-bold text-slate-900">老師與權限管理</h2>
      <p class="mt-2 text-sm text-slate-500">快速檢視老師帳號、授課科目與聯繫資訊</p>
    </header>

    <div class="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
      <table class="min-w-full divide-y divide-slate-100">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">姓名</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">帳號</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">科目</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">權限</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">聯絡電話</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">入職日期</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="teacher in teachers"
            :key="teacher.teacher_id"
            class="transition hover:bg-slate-50/70"
          >
            <td class="whitespace-nowrap px-4 py-4">
              <p class="font-semibold text-slate-900">{{ teacher.name }}</p>
              <p class="text-sm text-slate-500">ID: {{ teacher.teacher_id }}</p>
            </td>
            <td class="whitespace-nowrap px-4 py-4 text-slate-700">{{ teacher.username }}</td>
            <td class="whitespace-nowrap px-4 py-4 text-slate-700">{{ teacher.subject }}</td>
            <td class="whitespace-nowrap px-4 py-4">
              <span
                class="rounded-full px-3 py-1 text-xs font-semibold"
                :class="teacher.permission_level === 'Admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-700'"
              >
                {{ teacher.permission_level }}
              </span>
            </td>
            <td class="whitespace-nowrap px-4 py-4 text-slate-700">{{ teacher.phone }}</td>
            <td class="whitespace-nowrap px-4 py-4 text-slate-700">{{ teacher.hire_date }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { mockTeachers } from '../data/mockData'

const teachers = mockTeachers
</script>

