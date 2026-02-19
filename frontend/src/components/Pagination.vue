<template>
  <div v-if="totalPages > 1" class="flex items-center justify-between rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
    <!-- 左側：顯示統計資訊 -->
    <div class="text-sm text-slate-600">
      顯示第 <span class="font-semibold text-slate-900">{{ startItem }}</span> 到 
      <span class="font-semibold text-slate-900">{{ endItem }}</span> 筆，
      共 <span class="font-semibold text-slate-900">{{ totalCount }}</span> 筆資料
    </div>

    <!-- 右側：分頁控制 -->
    <div class="flex items-center gap-2">
      <!-- 上一頁按鈕 -->
      <button
        @click="goToPreviousPage"
        :disabled="currentPage === 1"
        class="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
        :class="{ 'cursor-not-allowed': currentPage === 1 }"
      >
        ‹ 上一頁
      </button>

      <!-- 頁碼按鈕 -->
      <div class="flex items-center gap-1">
        <template v-for="page in visiblePages" :key="page">
          <!-- 省略號 -->
          <span v-if="page === '...'" class="px-2 text-slate-400">...</span>
          
          <!-- 頁碼按鈕 -->
          <button
            v-else
            @click="goToPage(page as number)"
            class="min-w-[2.5rem] rounded-full px-3 py-1.5 text-sm font-semibold transition"
            :class="
              currentPage === page
                ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md'
                : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
            "
          >
            {{ page }}
          </button>
        </template>
      </div>

      <!-- 下一頁按鈕 -->
      <button
        @click="goToNextPage"
        :disabled="currentPage === totalPages"
        class="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
        :class="{ 'cursor-not-allowed': currentPage === totalPages }"
      >
        下一頁 ›
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
}

interface Emits {
  (e: 'update:currentPage', page: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 計算當前頁顯示的資料範圍
const startItem = computed(() => {
  if (props.totalCount === 0) return 0
  return (props.currentPage - 1) * props.pageSize + 1
})

const endItem = computed(() => {
  const end = props.currentPage * props.pageSize
  return end > props.totalCount ? props.totalCount : end
})

// 計算要顯示的頁碼（智能顯示）
const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const total = props.totalPages
  const current = props.currentPage
  
  // 如果總頁數小於等於7，顯示所有頁碼
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
    return pages
  }
  
  // 總是顯示第一頁
  pages.push(1)
  
  // 計算中間顯示的頁碼範圍
  let startPage = Math.max(2, current - 1)
  let endPage = Math.min(total - 1, current + 1)
  
  // 確保至少顯示3個中間頁碼
  if (current <= 3) {
    endPage = Math.min(5, total - 1)
  } else if (current >= total - 2) {
    startPage = Math.max(total - 4, 2)
  }
  
  // 添加左側省略號
  if (startPage > 2) {
    pages.push('...')
  }
  
  // 添加中間頁碼
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }
  
  // 添加右側省略號
  if (endPage < total - 1) {
    pages.push('...')
  }
  
  // 總是顯示最後一頁
  if (total > 1) {
    pages.push(total)
  }
  
  return pages
})

// 跳轉到指定頁碼
const goToPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('update:currentPage', page)
  }
}

// 上一頁
const goToPreviousPage = () => {
  if (props.currentPage > 1) {
    emit('update:currentPage', props.currentPage - 1)
  }
}

// 下一頁
const goToNextPage = () => {
  if (props.currentPage < props.totalPages) {
    emit('update:currentPage', props.currentPage + 1)
  }
}
</script>
