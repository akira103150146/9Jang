<template>
  <div class="space-y-6">
    <header class="rounded-3xl border border-blue-100 bg-gradient-to-r from-white to-sky-50 p-6 shadow-sm">
      <p class="text-sm font-semibold text-slate-500">會計模組</p>
      <h2 class="text-2xl font-bold text-slate-900">額外收費與款項追蹤</h2>
      <p class="mt-2 text-sm text-slate-500">掌握各項費用與收款狀態，避免遺漏</p>
    </header>

    <div class="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
      <table class="min-w-full divide-y divide-slate-100">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">學生</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">項目</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">金額</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">日期</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">狀態</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="fee in fees"
            :key="fee.fee_id"
            class="transition hover:bg-slate-50/70"
          >
            <td class="whitespace-nowrap px-4 py-4">
              <p class="font-semibold text-slate-900">{{ fee.student_name }}</p>
              <p class="text-sm text-slate-500">Fee #{{ fee.fee_id }}</p>
            </td>
            <td class="whitespace-nowrap px-4 py-4 text-slate-700">{{ fee.item }}</td>
            <td class="whitespace-nowrap px-4 py-4 font-semibold text-slate-900">${{ fee.amount }}</td>
            <td class="whitespace-nowrap px-4 py-4 text-slate-700">{{ fee.fee_date }}</td>
            <td class="whitespace-nowrap px-4 py-4">
              <span
                class="rounded-full px-3 py-1 text-xs font-semibold"
                :class="fee.payment_status === 'Paid'
                  ? 'bg-emerald-50 text-emerald-600'
                  : fee.payment_status === 'Partial'
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-rose-50 text-rose-600'"
              >
                {{ fee.payment_status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { mockExtraFees } from '../data/mockData'

const fees = mockExtraFees
</script>

