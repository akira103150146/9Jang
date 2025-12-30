<template>
  <div class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-slate-900">篩選條件</h3>
      <button 
        @click="$emit('toggle-filters')" 
        class="text-sm text-sky-600 hover:text-sky-800 font-semibold"
      >
        {{ showFilters ? '收起' : '展開' }}篩選
      </button>
    </div>
    
    <!-- 載入指示器 -->
    <div v-if="isFiltering" class="mb-2 text-xs text-slate-500 flex items-center gap-2">
      <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      搜尋中...
    </div>
    
    <!-- 篩選面板 -->
    <div v-show="showFilters" class="space-y-4">
      <div class="grid gap-3 md:grid-cols-5">
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">學生姓名（模糊）</label>
          <input
            :model-value="filters.studentName"
            @update:model-value="updateFilter('studentName', $event)"
            type="text"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            placeholder="例如：王小明"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">標籤</label>
          <select
            :model-value="filters.tag"
            @update:model-value="updateFilter('tag', $event)"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            <option value="">全部標籤</option>
            <option v-for="tag in availableTags" :key="tag.group_id" :value="tag.group_id">
              {{ tag.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">名目</label>
          <select
            :model-value="filters.item"
            @update:model-value="updateFilter('item', $event)"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            <option value="">全部</option>
            <option value="Tuition">學費</option>
            <option value="Meal">餐費</option>
            <option value="Transport">交通費</option>
            <option value="Book">書籍費</option>
            <option value="Other">其他</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">繳費狀態</label>
          <select
            :model-value="filters.paymentStatus"
            @update:model-value="updateFilter('paymentStatus', $event)"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            <option value="">全部</option>
            <option value="Paid">已繳費</option>
            <option value="Unpaid">未繳費</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">備註（模糊）</label>
          <input
            :model-value="filters.q"
            @update:model-value="updateFilter('q', $event)"
            type="text"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            placeholder="例如：發起老師"
          />
        </div>
      </div>
      
      <!-- 時間篩選 -->
      <div class="grid gap-3 md:grid-cols-4">
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">時間快捷選項</label>
          <select
            :model-value="filters.dateRange"
            @update:model-value="updateFilter('dateRange', $event)"
            @change="$emit('date-range-change')"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            <option value="">不限時間</option>
            <option value="today">當日繳費</option>
            <option value="this_week">當週繳費</option>
            <option value="this_month">當月繳費</option>
            <option value="last_month">上個月繳費</option>
            <option value="custom">自訂時間區間</option>
          </select>
        </div>
        <div v-if="filters.dateRange === 'custom'">
          <label class="block text-xs font-semibold text-slate-600 mb-1">開始日期</label>
          <input
            :model-value="filters.startDate"
            @update:model-value="updateFilter('startDate', $event)"
            type="date"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        </div>
        <div v-if="filters.dateRange === 'custom'">
          <label class="block text-xs font-semibold text-slate-600 mb-1">結束日期</label>
          <input
            :model-value="filters.endDate"
            @update:model-value="updateFilter('endDate', $event)"
            type="date"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        </div>
        <div v-if="filters.dateRange === 'custom'" class="flex items-end">
          <button
            @click="$emit('clear-date-range')"
            class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            清除日期
          </button>
        </div>
      </div>
      
      <!-- 操作按鈕 -->
      <div class="flex gap-2 pt-2 border-t border-slate-200">
        <button 
          @click="$emit('clear-filters')" 
          class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          清除所有篩選
        </button>
      </div>
      
      <!-- 已套用的篩選標籤 -->
      <div v-if="hasActiveFilters" class="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
        <span class="text-xs text-slate-500">已套用：</span>
        <span
          v-for="(filter, key) in activeFilters"
          :key="key"
          class="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700"
        >
          {{ filter.label }}
          <button @click="$emit('remove-filter', key)" class="text-sky-600 hover:text-sky-800">×</button>
        </span>
      </div>
    </div>

    <div v-if="selectedStudent" class="mt-4 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-xs font-semibold text-slate-500">已套用學生篩選</p>
          <p class="text-sm font-semibold text-slate-900">
            {{ selectedStudent.name }}（{{ selectedStudent.school }} / {{ selectedStudent.grade }}）
          </p>
        </div>
        <button
          @click="$emit('remove-student-filter')"
          class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 border border-slate-200"
        >
          移除學生篩選
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FeeFilters } from '../../composables/useFeeFilters'

interface Props {
  filters: FeeFilters
  showFilters: boolean
  isFiltering: boolean
  hasActiveFilters: boolean
  activeFilters: Record<string, { label: string }>
  availableTags: Array<{ group_id: number; name: string; [key: string]: unknown }>
  selectedStudent: { name: string; school: string; grade: string; [key: string]: unknown } | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'toggle-filters': []
  'clear-filters': []
  'clear-date-range': []
  'date-range-change': []
  'remove-filter': [key: string]
  'remove-student-filter': []
  'update:filters': [filters: FeeFilters]
}>()

const updateFilter = (key: keyof FeeFilters, value: string) => {
  const updated = { ...props.filters, [key]: value }
  emit('update:filters', updated)
}
</script>

