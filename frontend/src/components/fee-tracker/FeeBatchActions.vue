<template>
  <div v-if="selectedCount > 0" class="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <span class="text-sm font-semibold text-slate-700">已選擇 {{ selectedCount }} 筆費用記錄</span>
    </div>
    <div class="flex items-center gap-2">
      <button
        @click="$emit('batch-update', 'Paid')"
        :disabled="batchUpdating"
        class="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ batchUpdating ? '處理中...' : '標記為已繳費' }}
      </button>
      <button
        @click="$emit('batch-update', 'Unpaid')"
        :disabled="batchUpdating"
        class="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ batchUpdating ? '處理中...' : '標記為未繳費' }}
      </button>
      <button
        @click="$emit('clear-selection')"
        class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        取消選擇
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  selectedCount: number
  batchUpdating: boolean
}

defineProps<Props>()

defineEmits<{
  'batch-update': [status: 'Paid' | 'Unpaid']
  'clear-selection': []
}>()
</script>

