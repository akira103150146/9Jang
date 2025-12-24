<template>
  <div class="space-y-4">
    <!-- 講義模式特定設定 -->
    <div class="rounded-lg border border-slate-200 bg-white p-4">
      <h3 class="text-sm font-semibold text-slate-700 mb-3">講義設定</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- 紙張大小 -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">紙張大小</label>
          <select
            v-model="localSettings.handout.paperSize"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="A4">A4 (210mm x 297mm)</option>
            <option value="B4">B4 (250mm x 353mm)</option>
          </select>
        </div>

        <!-- 方向 -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">方向</label>
          <select
            v-model="localSettings.handout.orientation"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="portrait">直向</option>
            <option value="landscape">橫向</option>
          </select>
        </div>

        <!-- 輸出格式 -->
        <div class="md:col-span-2">
          <label class="block text-xs font-semibold text-slate-700 mb-1">輸出格式</label>
          <div class="flex flex-wrap gap-2">
            <label
              v-for="format in outputFormats"
              :key="format.value"
              class="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 cursor-pointer hover:bg-slate-50"
              :class="localSettings.handout.outputFormats.includes(format.value) ? 'bg-indigo-50 border-indigo-500' : ''"
            >
              <input
                type="checkbox"
                :value="format.value"
                v-model="localSettings.handout.outputFormats"
                class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span class="text-sm text-slate-700">{{ format.label }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'

const props = defineProps({
  settings: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:settings'])

const outputFormats = [
  { value: 'question_only', label: '題目卷' },
  { value: 'question_solution_answer', label: '題目+詳解+答案' },
  { value: 'solution_only', label: '詳解卷' },
  { value: 'answer_only', label: '答案卷' }
]

// 確保 settings.handout 存在並使用雙向綁定
const localSettings = computed({
  get: () => {
    const defaultHandout = {
      paperSize: 'A4',
      orientation: 'portrait',
      outputFormats: ['question_only'],
      margins: { top: 20, right: 20, bottom: 20, left: 20 },
      fontSize: 12,
      lineHeight: 1.5
    }
    
    const currentSettings = { ...props.settings }
    if (!currentSettings.handout) {
      currentSettings.handout = defaultHandout
    } else {
      // 確保所有必要的字段都存在
      currentSettings.handout = {
        ...defaultHandout,
        ...currentSettings.handout,
        // 確保 outputFormats 一定是陣列
        outputFormats: Array.isArray(currentSettings.handout.outputFormats) 
          ? currentSettings.handout.outputFormats 
          : ['question_only']
      }
    }
    return currentSettings
  },
  set: (value) => {
    emit('update:settings', value)
  }
})

// 監聽設定變化並同步
// 使用 immediate: false 避免初始化時觸發
watch(() => localSettings.value.handout, (newHandout, oldHandout) => {
  // 只在實際變化時才 emit，避免不必要的更新
  if (JSON.stringify(newHandout) !== JSON.stringify(oldHandout)) {
    emit('update:settings', {
      ...props.settings,
      handout: newHandout
    })
  }
}, { deep: true, immediate: false })
</script>
