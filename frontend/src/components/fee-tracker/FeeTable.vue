<template>
  <div class="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-100">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-4 py-3 text-center">
              <input
                type="checkbox"
                :checked="isAllSelected"
                @change="$emit('toggle-select-all')"
                class="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
            </th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">學生</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">項目</th>
            <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">金額</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">繳費日期</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">狀態</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">備註</th>
            <th class="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="fee in fees"
            :key="fee.fee_id"
            class="transition hover:bg-slate-50/70"
            :class="{ 'bg-sky-50/50': isSelected(fee.fee_id) }"
          >
            <td class="whitespace-nowrap px-4 py-4 text-center">
              <input
                type="checkbox"
                :checked="isSelected(fee.fee_id)"
                @change="$emit('toggle-select', fee.fee_id)"
                class="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
            </td>
            <td class="whitespace-nowrap px-4 py-4">
              <p class="font-semibold text-slate-900">{{ fee.student_name }}</p>
              <p class="text-xs text-slate-500">Fee #{{ fee.fee_id ?? '—' }}</p>
            </td>
            <td class="whitespace-nowrap px-4 py-4 text-slate-700">{{ getItemDisplay(fee.item) }}</td>
            <td class="whitespace-nowrap px-4 py-4 font-semibold text-slate-900 font-mono text-right">${{ formatAmount(fee.amount) }}</td>
            <td class="whitespace-nowrap px-4 py-4 text-slate-700">{{ getPaymentDate(fee) }}</td>
            <td class="whitespace-nowrap px-4 py-4">
              <span
                class="rounded-full px-3 py-1 text-xs font-semibold"
                :class="getStatusClass(fee.payment_status)"
              >
                {{ getStatusDisplay(fee.payment_status) }}
              </span>
            </td>
            <td class="px-4 py-4 text-sm text-slate-700">
              <p class="max-w-md truncate">{{ fee.notes || '—' }}</p>
            </td>
            <td class="whitespace-nowrap px-4 py-4 text-center">
              <div class="flex justify-center gap-2">
                <router-link
                  :to="`/fees/edit/${fee.fee_id || fee.id}`"
                  class="rounded-full bg-sky-500 px-3 py-1 text-xs font-semibold text-white hover:bg-sky-600"
                >
                  編輯
                </router-link>
              </div>
            </td>
          </tr>
          <tr v-if="fees.length === 0">
            <td colspan="8" class="py-4 px-4 text-center text-slate-500">目前沒有費用記錄。</td>
          </tr>
          <!-- 金額加總行 -->
          <tr v-if="fees.length > 0" class="bg-slate-50 font-semibold">
            <td colspan="3" class="px-4 py-4 text-right text-slate-700">總計：</td>
            <td class="px-4 py-4 font-mono text-right text-slate-900">${{ formatAmount(totalAmount) }}</td>
            <td colspan="4" class="px-4 py-4"></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Fee } from '../../composables/useFeeSelection'

interface Props {
  fees: Fee[]
  isAllSelected: boolean
  isSelected: (feeId: number) => boolean
  totalAmount: number
  getItemDisplay: (item: string) => string
  getStatusDisplay: (status: string) => string
  getStatusClass: (status: string) => string
  formatAmount: (amount: number) => string
  getPaymentDate: (fee: Fee) => string
}

const props = defineProps<Props>()

defineEmits<{
  'toggle-select-all': []
  'toggle-select': [feeId: number]
}>()
</script>

