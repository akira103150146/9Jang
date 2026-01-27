<template>
  <div>
    <label class="block text-sm font-semibold text-slate-700 mb-2">
      題目類型 <span class="text-red-500">*</span>
    </label>
    <select
      :modelValue="modelValue"
      @update:modelValue="$emit('update:modelValue', $event)"
      required
      class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
    >
      <option value="SINGLE_CHOICE">單選題</option>
      <option value="MULTIPLE_CHOICE">多選題</option>
      <option value="FILL_IN_BLANK">填充題</option>
      <option value="PROGRAMMING">程式題</option>
      <option value="LISTENING">聽力題</option>
    </select>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
