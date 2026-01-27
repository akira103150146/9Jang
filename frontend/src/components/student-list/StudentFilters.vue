<template>
  <section v-if="canSeeAccountingFeatures || isTeacher" class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
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
      <!-- 第一行：文字輸入（需要防抖） -->
      <div class="grid gap-3 md:grid-cols-3">
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">學生姓名</label>
          <input
            :value="filters.name"
            @input="$emit('update:name', ($event.target as HTMLInputElement).value)"
            type="text"
            placeholder="模糊搜尋學生姓名"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">電話號碼</label>
          <input
            :value="filters.phone"
            @input="$emit('update:phone', ($event.target as HTMLInputElement).value)"
            type="text"
            placeholder="搜尋學生電話或緊急聯絡人電話"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">學校</label>
          <input
            :value="filters.school"
            @input="$emit('update:school', ($event.target as HTMLInputElement).value)"
            type="text"
            placeholder="搜尋學校名稱"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        </div>
      </div>
      
      <!-- 第二行：下拉選單（立即更新） -->
      <div :class="canSeeAccountingFeatures ? 'grid gap-3 md:grid-cols-4' : 'grid gap-3 md:grid-cols-3'">
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">標籤</label>
          <select 
            :value="filters.tag"
            @input="$emit('update:tag', ($event.target as HTMLSelectElement).value)"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            <option value="">全部標籤</option>
            <option v-for="tag in availableTags" :key="tag.group_id" :value="tag.group_id">
              {{ tag.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">課程</label>
          <select 
            :value="filters.course"
            @input="$emit('update:course', ($event.target as HTMLSelectElement).value)"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            <option value="">全部課程</option>
            <option v-for="course in courses" :key="course.course_id || course.id" :value="course.course_id || course.id">
              {{ course.course_name }}
            </option>
          </select>
        </div>
        <div v-if="canSeeAccountingFeatures">
          <label class="block text-xs font-semibold text-slate-600 mb-1">待繳學費</label>
          <select 
            :value="filters.hasUnpaidFees"
            @input="$emit('update:hasUnpaidFees', ($event.target as HTMLSelectElement).value)"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            <option value="">全部</option>
            <option value="yes">有待繳學費</option>
            <option value="no">無待繳學費</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">請假狀態</label>
          <select 
            :value="filters.hasLeave"
            @input="$emit('update:hasLeave', ($event.target as HTMLSelectElement).value)"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            <option value="">全部</option>
            <option value="yes">有請假記錄</option>
            <option value="no">無請假記錄</option>
          </select>
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
        <div class="flex-1"></div>
        <button 
          v-if="canSeeAccountingFeatures || isTeacher"
          @click="$emit('open-tag-manager')" 
          class="rounded-lg border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
        >
          管理標籤
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
  </section>
</template>

<script setup lang="ts">
interface Props {
  showFilters: boolean
  isFiltering: boolean
  filters: {
    name: string
    phone: string
    school: string
    tag: string
    course: string
    hasUnpaidFees: string
    hasLeave: string
  }
  availableTags: Array<{ group_id: number; name: string }>
  courses: Array<{ course_id?: number; id?: number; course_name?: string; [key: string]: unknown }>
  canSeeAccountingFeatures: boolean
  isTeacher: boolean
  hasActiveFilters: boolean
  activeFilters: Record<string, { label: string }>
}

defineProps<Props>()

defineEmits<{
  'toggle-filters': []
  'update:name': [value: string]
  'update:phone': [value: string]
  'update:school': [value: string]
  'update:tag': [value: string]
  'update:course': [value: string]
  'update:hasUnpaidFees': [value: string]
  'update:hasLeave': [value: string]
  'clear-filters': []
  'open-tag-manager': []
  'remove-filter': [key: string]
}>()
</script>
