<template>
  <section>
    <h3 class="text-lg font-semibold text-slate-900 mb-4">歷史團購記錄</h3>
    <div v-if="loading" class="text-center py-12 text-slate-500">載入中...</div>
    <div v-else-if="completedGroupOrders.length === 0" class="rounded-3xl border border-slate-100 bg-white p-12 text-center">
      <p class="text-slate-500">目前沒有歷史團購記錄</p>
    </div>
    <div v-else class="grid gap-4 md:grid-cols-2">
      <article
        v-for="groupOrder in completedGroupOrders"
        :key="groupOrder.group_order_id"
        class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">
              {{ groupOrder.restaurant_name }}
            </p>
            <h4 class="mt-1 text-lg font-semibold text-slate-900">{{ groupOrder.title }}</h4>
            <p class="mt-2 text-sm text-slate-600">
              建立時間：{{ formatDateTime(groupOrder.created_at) }}
            </p>
            <p v-if="groupOrder.closed_at" class="text-sm text-slate-600">
              完成時間：{{ formatDateTime(groupOrder.closed_at) }}
            </p>
            <p class="text-sm text-slate-600">
              訂單數：{{ groupOrder.orders_count }} | 總金額：${{ groupOrder.total_amount }}
            </p>
          </div>
          <span
            :class="[
              'ml-2 rounded-full px-3 py-1 text-xs font-semibold',
              groupOrder.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
              groupOrder.status === 'Closed' ? 'bg-gray-50 text-gray-600' :
              'bg-slate-50 text-slate-600'
            ]"
          >
            {{ getStatusDisplay(groupOrder.status) }}
          </span>
        </div>
        <div class="mt-4">
          <router-link
            :to="`/lunch-orders/${groupOrder.group_order_id}`"
            class="rounded-full bg-blue-500 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600 inline-block"
          >
            查看詳情
          </router-link>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { GroupOrder } from '../../composables/useLunchOrderTabs'

interface Props {
  completedGroupOrders: GroupOrder[]
  loading: boolean
}

defineProps<Props>()

const formatDateTime = (datetime: string): string => {
  if (!datetime) return ''
  const date = new Date(datetime)
  return date.toLocaleString('zh-TW')
}

const getStatusDisplay = (status: string): string => {
  const map: Record<string, string> = {
    'Open': '進行中',
    'Closed': '已結束',
    'Completed': '已完成'
  }
  return map[status] || status
}
</script>

