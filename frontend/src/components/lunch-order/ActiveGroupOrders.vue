<template>
  <section>
    <h3 class="text-lg font-semibold text-slate-900 mb-4">進行中的團購</h3>
    <div v-if="loading" class="text-center py-12 text-slate-500">載入中...</div>
    <div v-else-if="activeGroupOrders.length === 0" class="rounded-3xl border border-slate-100 bg-white p-12 text-center">
      <p class="text-slate-500">目前沒有進行中的團購</p>
    </div>
    <div v-else class="grid gap-4 md:grid-cols-2">
      <article
        v-for="groupOrder in activeGroupOrders"
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
              截止時間：{{ formatDateTime(groupOrder.deadline) }}
            </p>
            <p class="text-sm text-slate-600">
              訂單數：{{ groupOrder.orders_count }} | 總金額：${{ groupOrder.total_amount }}
            </p>
            <div class="mt-3">
              <label class="block text-xs font-semibold text-slate-700 mb-1">團購連結</label>
              <div class="flex items-center gap-2">
                <input
                  :value="getOrderLink(groupOrder.order_link || '')"
                  readonly
                  class="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                />
                <button
                  @click="$emit('copy-link', groupOrder.order_link || '')"
                  class="rounded-lg bg-green-500 px-3 py-2 text-xs font-semibold text-white hover:bg-green-600"
                >
                  複製
                </button>
              </div>
            </div>
          </div>
          <span class="ml-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
            {{ getStatusDisplay(groupOrder.status) }}
          </span>
        </div>
        <div class="mt-4 flex gap-2">
          <router-link
            :to="`/lunch-orders/${groupOrder.group_order_id}`"
            class="rounded-full bg-blue-500 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600"
          >
            查看訂單
          </router-link>
          <button
            v-if="canCompleteGroup"
            @click="$emit('complete', groupOrder.group_order_id)"
            class="rounded-full bg-green-500 px-4 py-2 text-xs font-semibold text-white hover:bg-green-600"
          >
            完成團購
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { GroupOrder } from '../../composables/useLunchOrderTabs'

interface Props {
  activeGroupOrders: GroupOrder[]
  loading: boolean
  canCompleteGroup: boolean
}

const props = defineProps<Props>()

defineEmits<{
  'copy-link': [link: string]
  'complete': [id: number]
}>()

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

const getOrderLink = (link: string): string => {
  return `${window.location.origin}/lunch-orders/join/${link}`
}
</script>

