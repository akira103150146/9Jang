<template>
  <div class="space-y-4">
    <!-- 線上測驗模式特定設定 -->
    <div class="rounded-lg border border-slate-200 bg-white p-4">
      <h3 class="text-sm font-semibold text-slate-700 mb-3">測驗設定</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- 時間限制 -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">時間限制（秒）</label>
          <input
            v-model.number="localSettings.onlineQuiz.timeLimit"
            type="number"
            min="0"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="3600"
          />
          <p class="mt-1 text-xs text-slate-500">
            {{ formatTime(localSettings.onlineQuiz.timeLimit) }}
          </p>
        </div>

        <!-- 自動評分 -->
        <div class="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            v-model="localSettings.onlineQuiz.autoGrade"
            id="autoGrade"
            class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label for="autoGrade" class="text-sm font-semibold text-slate-700">
            自動評分
          </label>
        </div>

        <!-- 提交後顯示答案 -->
        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            v-model="localSettings.onlineQuiz.showAnswerAfterSubmit"
            id="showAnswerAfterSubmit"
            class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label for="showAnswerAfterSubmit" class="text-sm font-semibold text-slate-700">
            提交後顯示答案
          </label>
        </div>

        <!-- 允許重做 -->
        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            v-model="settings.onlineQuiz.allowRetake"
            id="allowRetake"
            class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label for="allowRetake" class="text-sm font-semibold text-slate-700">
            允許重做
          </label>
        </div>

        <!-- 隨機題目順序 -->
        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            v-model="localSettings.onlineQuiz.shuffleQuestions"
            id="shuffleQuestions"
            class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label for="shuffleQuestions" class="text-sm font-semibold text-slate-700">
            隨機題目順序
          </label>
        </div>

        <!-- 隨機選項順序 -->
        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            v-model="localSettings.onlineQuiz.shuffleOptions"
            id="shuffleOptions"
            class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label for="shuffleOptions" class="text-sm font-semibold text-slate-700">
            隨機選項順序
          </label>
        </div>
      </div>
    </div>

    <!-- 題目列表（僅顯示選擇題和多選題） -->
    <div class="rounded-lg border border-slate-200 bg-white p-4">
      <h3 class="text-sm font-semibold text-slate-700 mb-3">測驗題目</h3>
      <p class="text-xs text-slate-500 mb-2">
        線上測驗模式僅支援選擇題和多選題，填充題將僅顯示參考答案不計分
      </p>
      <div v-if="gradableQuestions.length === 0" class="text-sm text-slate-400 text-center py-4">
        尚無可評分的題目
      </div>
      <div v-else class="space-y-2">
        <div
          v-for="block in gradableQuestions"
          :key="block.id"
          class="flex items-center justify-between p-2 bg-slate-50 rounded"
        >
          <span class="text-sm text-slate-700">題目 #{{ block.question_id }}</span>
          <span class="text-xs text-slate-500">{{ getQuestionTypeName(block.question_type) }}</span>
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
  },
  structure: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:settings'])

// 確保 settings.onlineQuiz 存在並使用雙向綁定
const localSettings = computed({
  get: () => {
    const currentSettings = { ...props.settings }
    if (!currentSettings.onlineQuiz) {
      currentSettings.onlineQuiz = {
        timeLimit: 3600,
        autoGrade: true,
        showAnswerAfterSubmit: true,
        allowRetake: false,
        shuffleQuestions: false,
        shuffleOptions: false
      }
    }
    return currentSettings
  },
  set: (value) => {
    emit('update:settings', value)
  }
})

// 監聽設定變化並同步
watch(() => localSettings.value.onlineQuiz, (newOnlineQuiz) => {
  emit('update:settings', {
    ...props.settings,
    onlineQuiz: newOnlineQuiz
  })
}, { deep: true })

// 獲取可評分的題目
const gradableQuestions = computed(() => {
  return props.structure.filter(block => {
    if (block.type === 'question') {
      // 這裡需要從題目資料中獲取 question_type
      // 暫時返回所有題目，實際應該從題目資料庫查詢
      return true
    }
    return false
  })
})

const formatTime = (seconds) => {
  if (!seconds) return '無限制'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (hours > 0) {
    return `${hours} 小時 ${minutes} 分鐘`
  } else if (minutes > 0) {
    return `${minutes} 分鐘 ${secs} 秒`
  } else {
    return `${secs} 秒`
  }
}

const getQuestionTypeName = (type) => {
  const map = {
    'SINGLE_CHOICE': '單選題',
    'MULTIPLE_CHOICE': '多選題',
    'FILL_IN_BLANK': '填充題'
  }
  return map[type] || type
}
</script>
