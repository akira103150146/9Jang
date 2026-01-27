<template>
  <div>
    <label class="block text-sm font-semibold text-slate-700 mb-2">
      題目內容 (Markdown + LaTeX) <span class="text-red-500">*</span>
    </label>
    <div class="space-y-3">
      <div class="border border-slate-300 rounded-lg question-editor-wrapper">
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
        提示：貼上包含選項的題目（如 (A)選項1 (B)選項2），系統會自動提取選項。使用 $$...$$ 表示區塊公式，使用 $...$ 表示行內公式
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
