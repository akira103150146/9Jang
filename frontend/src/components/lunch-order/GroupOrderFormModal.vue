<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
    @click.self="$emit('close')"
  >
    <div class="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold text-slate-900">創建團購</h3>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="$emit('save')" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1">店家 *</label>
          <select
            :model-value="groupOrderForm.restaurant"
            @update:model-value="updateFormData('restaurant', $event)"
            @change="$emit('restaurant-change')"
            required
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
          >
            <option value="">請選擇店家</option>
            <option
              v-for="restaurant in activeRestaurants"
              :key="restaurant.restaurant_id"
              :value="restaurant.restaurant_id"
            >
              {{ restaurant.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1">團購標題 *</label>
          <input
            :model-value="groupOrderForm.title"
            @update:model-value="updateFormData('title', $event)"
            type="text"
            required
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
            placeholder="例如：週五午餐團購"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1">截止時間 *</label>
          <input
            :model-value="groupOrderForm.deadline"
            @update:model-value="updateFormData('deadline', $event)"
            type="datetime-local"
            required
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
          />
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <button
            type="button"
            @click="$emit('close')"
            class="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            取消
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="rounded-full bg-green-500 px-5 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50"
          >
            {{ saving ? '建立中...' : '建立' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GroupOrderFormData } from '../../composables/useGroupOrderManagement'

interface Props {
  isOpen: boolean
  groupOrderForm: GroupOrderFormData
  activeRestaurants: Array<{ restaurant_id: number; name: string; [key: string]: unknown }>
  saving: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: []
  'restaurant-change': []
  'update:group-order-form': [data: GroupOrderFormData]
}>()

const updateFormData = (key: keyof GroupOrderFormData, value: unknown) => {
  const updated = { ...props.groupOrderForm, [key]: value }
  emit('update:group-order-form', updated)
}
</script>

