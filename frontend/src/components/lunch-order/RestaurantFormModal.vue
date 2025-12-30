<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
    @click.self="$emit('close')"
  >
    <div class="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold text-slate-900">
          {{ editingRestaurant ? '編輯店家' : '新增店家' }}
        </h3>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="$emit('save')" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1">店家名稱 *</label>
          <input
            :model-value="restaurantForm.name"
            @update:model-value="updateFormData('name', $event)"
            type="text"
            required
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1">電話</label>
          <input
            :model-value="restaurantForm.phone"
            @update:model-value="updateFormData('phone', $event)"
            type="text"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1">地址</label>
          <input
            :model-value="restaurantForm.address"
            @update:model-value="updateFormData('address', $event)"
            type="text"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1">菜單圖片</label>
          <div class="space-y-3">
            <div v-if="menuImagePreview" class="relative rounded-lg border border-slate-300 overflow-hidden bg-slate-50">
              <img :src="menuImagePreview" alt="菜單預覽" class="w-full max-h-64 object-contain" />
              <button
                type="button"
                @click="$emit('clear-image')"
                class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <label class="block">
              <input
                type="file"
                ref="menuFileInput"
                @change="$emit('image-select', $event)"
                accept="image/*"
                class="hidden"
              />
              <div class="w-full rounded-lg border-2 border-dashed border-slate-300 px-4 py-3 text-center cursor-pointer hover:border-orange-500 hover:bg-orange-50">
                <span class="text-sm font-semibold text-slate-700">選擇菜單圖片</span>
              </div>
            </label>
          </div>
        </div>

        <div>
          <label class="flex items-center gap-2">
            <input
              :checked="restaurantForm.is_active"
              @change="updateFormData('is_active', ($event.target as HTMLInputElement).checked)"
              type="checkbox"
              class="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
            />
            <span class="text-sm font-semibold text-slate-700">啟用</span>
          </label>
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
            class="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {{ saving ? '儲存中...' : '儲存' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { RestaurantFormData } from '../../composables/useRestaurantManagement'

interface Props {
  isOpen: boolean
  restaurantForm: RestaurantFormData
  editingRestaurant: { restaurant_id: number; [key: string]: unknown } | null
  menuImagePreview: string
  saving: boolean
}

const props = defineProps<Props>()

const menuFileInput = ref<HTMLInputElement | null>(null)

const emit = defineEmits<{
  close: []
  save: []
  'image-select': [event: Event]
  'clear-image': []
  'update:restaurant-form': [data: RestaurantFormData]
}>()

const updateFormData = (key: keyof RestaurantFormData, value: unknown) => {
  const updated = { ...props.restaurantForm, [key]: value }
  emit('update:restaurant-form', updated)
}
</script>

