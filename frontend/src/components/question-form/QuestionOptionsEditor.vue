<template>
  <div v-if="showOptions">
    <label class="block text-sm font-semibold text-slate-700 mb-2">
      選項 <span class="text-red-500">*</span>
      <span class="text-xs font-normal text-slate-500 ml-2">（至少需要 2 個選項）</span>
    </label>
    <div class="space-y-2">
      <div
        v-for="(option, index) in modelValue"
        :key="index"
        class="flex items-center gap-2"
      >
        <span class="text-sm font-medium text-slate-600 w-8">{{ String.fromCharCode(65 + index) }}.</span>
        <input
          :modelValue="option"
          @update:modelValue="updateOption(index, $event)"
          type="text"
          :placeholder="`選項 ${String.fromCharCode(65 + index)}`"
          class="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        <button
          v-if="modelValue.length > 2"
          @click="removeOption(index)"
          type="button"
          class="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
          title="移除選項"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
      <button
        @click="addOption"
        type="button"
        class="w-full rounded-lg border-2 border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
      >
        + 新增選項
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string[]
  showOptions: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const updateOption = (index: number, value: string) => {
  const newOptions = [...props.modelValue]
  newOptions[index] = value
  emit('update:modelValue', newOptions)
}

const addOption = () => {
  if (props.modelValue.length < 10) {
    emit('update:modelValue', [...props.modelValue, ''])
  }
}

const removeOption = (index: number) => {
  if (props.modelValue.length > 2) {
    const newOptions = [...props.modelValue]
    newOptions.splice(index, 1)
    emit('update:modelValue', newOptions)
  }
}
</script>
