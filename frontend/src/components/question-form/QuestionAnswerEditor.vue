<template>
  <div>
    <label class="block text-sm font-semibold text-slate-700 mb-2">
      正確答案 <span class="text-red-500">*</span>
      <span v-if="isChoiceQuestion" class="text-xs font-normal text-slate-500 ml-2">
        （選擇題可直接輸入答案，如：C 或 A,B,C）
      </span>
    </label>
    <div class="space-y-3">
      <div class="border border-slate-300 rounded-lg answer-editor-wrapper">
        <BlockEditor
          :modelValue="modelValue"
          @update:modelValue="$emit('update:modelValue', $event)"
          :readonly="readonly"
          :questions="questions"
        />
      </div>
    </div>
    <p class="mt-1 text-xs text-slate-500">
      <span v-if="isChoiceQuestion">
        提示：直接輸入答案字母（如 C）或逗號分隔的多個答案（如 A,B,C），系統會自動判斷單選/多選
      </span>
      <span v-else>
        提示：使用 $$...$$ 表示區塊公式，使用 $...$ 表示行內公式
      </span>
    </p>
  </div>
</template>

<script setup lang="ts">
import BlockEditor from '../BlockEditor/BlockEditor.vue'

defineProps<{
  modelValue: unknown
  readonly?: boolean
  questions?: unknown[]
  isChoiceQuestion?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: unknown]
}>()
</script>
