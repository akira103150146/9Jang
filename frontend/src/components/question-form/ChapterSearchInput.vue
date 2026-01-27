<template>
  <div class="relative">
    <label class="block text-sm font-semibold text-slate-700 mb-2">
      章節/單元 <span class="text-red-500">*</span>
    </label>
    <input
      :modelValue="modelValue"
      @update:modelValue="$emit('update:modelValue', $event)"
      @input="$emit('search')"
      @focus="$emit('search')"
      @blur="$emit('blur')"
      type="text"
      required
      class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      placeholder="例如：向量與空間（輸入關鍵字自動搜尋）"
    />
    <!-- 章節候選列表 -->
    <div
      v-if="suggestions.length > 0 && showSuggestions"
      class="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
    >
      <div
        v-for="(suggestion, index) in suggestions"
        :key="index"
        @mousedown.prevent="$emit('select', suggestion.chapter)"
        class="px-3 py-2 hover:bg-indigo-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors"
      >
        <div class="flex items-center justify-between">
          <span class="text-sm text-slate-900">{{ suggestion.chapter }}</span>
          <span class="text-xs text-slate-500">{{ suggestion.count }} 題</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  suggestions: Array<{ chapter: string; count: number }>
  showSuggestions: boolean
}>()

defineEmits<{
  'update:modelValue': [value: string]
  search: []
  select: [chapter: string]
  blur: []
}>()
</script>
