<template>
  <div class="mb-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-slate-900">篩選條件</h3>
      <button 
        @click="$emit('toggle-filters')" 
        class="text-sm text-indigo-600 hover:text-indigo-800 font-semibold"
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
    <div v-show="showFilters" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- 科目篩選 -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">科目</label>
        <select
          :value="filters.subject_id"
          @input="$emit('update:subject_id', ($event.target as HTMLSelectElement).value)"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <option value="">全部</option>
          <option v-for="subject in subjects" :key="subject.subject_id" :value="subject.subject_id">
            {{ subject.name }}
          </option>
        </select>
      </div>

      <!-- 年級篩選 -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">年級</label>
        <select
          :value="filters.level"
          @input="$emit('update:level', ($event.target as HTMLSelectElement).value)"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <option value="">全部</option>
          <option value="JHS">國中</option>
          <option value="SHS">高中</option>
          <option value="VCS">高職</option>
        </select>
      </div>

      <!-- 章節篩選 -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">章節</label>
        <input
          :value="filters.chapter"
          @input="$emit('update:chapter', ($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="輸入章節名稱..."
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      <!-- 難度篩選 -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">難度</label>
        <select
          :value="filters.difficulty"
          @input="$emit('update:difficulty', ($event.target as HTMLSelectElement).value)"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <option value="">全部</option>
          <option value="1">1 星</option>
          <option value="2">2 星</option>
          <option value="3">3 星</option>
          <option value="4">4 星</option>
          <option value="5">5 星</option>
        </select>
      </div>

      <!-- 題目類型篩選 -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">題目類型</label>
        <select
          :value="filters.question_type"
          @input="$emit('update:question_type', ($event.target as HTMLSelectElement).value)"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <option value="">全部</option>
          <option value="SINGLE_CHOICE">單選題</option>
          <option value="MULTIPLE_CHOICE">多選題</option>
          <option value="FILL_IN_BLANK">填充題</option>
          <option value="PROGRAMMING">程式題</option>
          <option value="LISTENING">聽力題</option>
        </select>
      </div>

      <!-- 標籤篩選 -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">標籤</label>
        <select
          :value="filters.tag_id"
          @input="$emit('update:tag_id', ($event.target as HTMLSelectElement).value)"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <option value="">全部</option>
          <option v-for="tag in tags" :key="tag.tag_id" :value="tag.tag_id">
            #{{ tag.tag_name }}
          </option>
        </select>
      </div>

      <!-- 來源篩選 -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">來源</label>
        <select
          :value="filters.source"
          @input="$emit('update:source', ($event.target as HTMLSelectElement).value)"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <option value="">全部</option>
          <option v-for="source in sourceOptions" :key="source" :value="source">
            {{ source }}
          </option>
        </select>
      </div>
    </div>

    <div v-show="showFilters" class="mt-4 flex justify-end gap-2">
      <button
        @click="$emit('reset-filters')"
        class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        重置篩選
      </button>
    </div>
    
    <!-- 已套用的篩選標籤 -->
    <div v-if="hasActiveFilters" class="flex flex-wrap gap-2 pt-3 mt-3 border-t border-slate-200">
      <span class="text-xs text-slate-500">已套用：</span>
      <span
        v-for="(filter, key) in activeFilters"
        :key="key"
        class="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700"
      >
        {{ filter.label }}
        <button @click="$emit('remove-filter', key)" class="text-indigo-600 hover:text-indigo-800">×</button>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Subject, Tag } from '@9jang/shared'
import type { Filters } from '../../composables/useQuestionList'

interface Props {
  showFilters: boolean
  isFiltering: boolean
  filters: Filters
  subjects: Subject[]
  tags: Tag[]
  sourceOptions: string[]
  hasActiveFilters: boolean
  activeFilters: Record<string, { label: string }>
}

defineProps<Props>()

defineEmits<{
  'toggle-filters': []
  'update:subject_id': [value: string]
  'update:level': [value: string]
  'update:chapter': [value: string]
  'update:difficulty': [value: string]
  'update:question_type': [value: string]
  'update:tag_id': [value: string]
  'update:source': [value: string]
  'reset-filters': []
  'remove-filter': [key: string]
}>()
</script>
