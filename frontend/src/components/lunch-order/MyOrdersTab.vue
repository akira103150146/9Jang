<template>
  <section>
    <h3 class="text-lg font-semibold text-slate-900 mb-4">我的訂單記錄</h3>
    <div v-if="loading" class="text-center py-12 text-slate-500">載入中...</div>
    <div v-else-if="myOrders.length === 0" class="rounded-3xl border border-slate-100 bg-white p-12 text-center">
      <p class="text-slate-500">您目前沒有訂單記錄</p>
    </div>
    <div v-else class="grid gap-4 md:grid-cols-2">
      <article
        v-for="order in myOrders"
        :key="order.order_id"
        class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">
              {{ order.group_order_title }}
            </p>
            <h4 class="mt-1 text-lg font-semibold text-slate-900">${{ order.total_amount }}</h4>
            <p class="mt-2 text-sm text-slate-600">
              訂購時間：{{ formatDateTime(order.created_at) }}
            </p>
            <div class="mt-2 text-sm text-slate-600">
              <ul>
                <li v-for="item in order.items" :key="item.order_item_id">
                  {{ item.item_name }} x {{ item.quantity }} (${{ item.subtotal }})
                </li>
              </ul>
            </div>
          </div>
          <span
            :class="[
              'ml-2 rounded-full px-3 py-1 text-xs font-semibold',
              order.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' :
              order.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
              'bg-slate-50 text-slate-600'
            ]"
          >
            {{ order.status === 'Confirmed' ? '已確認' : (order.status === 'Pending' ? '待確認' : order.status) }}
          </span>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { MyOrder } from '../../composables/useLunchOrderTabs'

interface Props {
  myOrders: MyOrder[]
  loading: boolean
}

defineProps<Props>()

const formatDateTime = (datetime: string): string => {
  if (!datetime) return ''
  const date = new Date(datetime)
  return date.toLocaleString('zh-TW')
}
</script>

