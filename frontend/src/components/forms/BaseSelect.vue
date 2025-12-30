<template>
  <div class="space-y-1">
    <label v-if="label" :for="selectId" class="block text-sm font-medium text-slate-700">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <select
      :id="selectId"
      :value="modelValue"
      :disabled="disabled"
      :class="selectClasses"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      @blur="$emit('blur', $event)"
      @focus="$emit('focus', $event)"
    >
      <option v-if="placeholder" value="">{{ placeholder }}</option>
      <slot>
        <option
          v-for="option in options"
          :key="getOptionValue(option)"
          :value="getOptionValue(option)"
        >
          {{ getOptionLabel(option) }}
        </option>
      </slot>
    </select>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
    <p v-if="hint && !error" class="text-xs text-slate-500">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type SelectSize = 'sm' | 'md' | 'lg'

type Option = string | number | { [key: string]: unknown }

interface Props {
  modelValue?: string | number
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
  hint?: string
  size?: SelectSize
  options?: Option[]
  optionValue?: string
  optionLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  placeholder: '',
  disabled: false,
  required: false,
  error: '',
  hint: '',
  size: 'md',
  options: () => [],
  optionValue: 'value',
  optionLabel: 'label'
})

interface Emits {
  (e: 'update:modelValue', value: string | number): void
  (e: 'blur', event: FocusEvent): void
  (e: 'focus', event: FocusEvent): void
}

const emit = defineEmits<Emits>()

const selectId = computed<string>(() => `select-${Math.random().toString(36).substring(2, 11)}`)

const selectClasses = computed<string>(() => {
  const base =
    'w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed bg-white'

  const sizeClasses: Record<SelectSize, string> = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  }

  const errorClasses = props.error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''

  return `${base} ${sizeClasses[props.size]} ${errorClasses}`
})

const getOptionValue = (option: Option): string | number => {
  if (typeof option === 'string' || typeof option === 'number') {
    return option
  }
  const obj = option as { [key: string]: unknown }
  return (obj[props.optionValue] ?? obj.value ?? obj.id ?? '') as string | number
}

const getOptionLabel = (option: Option): string => {
  if (typeof option === 'string' || typeof option === 'number') {
    return String(option)
  }
  const obj = option as { [key: string]: unknown }
  return (obj[props.optionLabel] ?? obj.label ?? obj.name ?? String(obj.value) ?? '') as string
}
</script>
