<template>
  <div class="flex items-center">
    <input
      :id="checkboxId"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      :class="checkboxClasses"
      @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <label v-if="label" :for="checkboxId" class="ml-2 text-sm text-slate-700">
      {{ label }}
    </label>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type CheckboxSize = 'sm' | 'md' | 'lg'

interface Props {
  modelValue?: boolean
  label?: string
  disabled?: boolean
  size?: CheckboxSize
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  label: '',
  disabled: false,
  size: 'md'
})

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const emit = defineEmits<Emits>()

const checkboxId = computed<string>(() => `checkbox-${Math.random().toString(36).substring(2, 11)}`)

const checkboxClasses = computed<string>(() => {
  const base = 'rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'

  const sizeClasses: Record<CheckboxSize, string> = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  return `${base} ${sizeClasses[props.size]}`
})
</script>
