<template>
  <section>
    <h3 class="text-lg font-semibold text-slate-900 mb-4">店家管理</h3>
    <div v-if="loading" class="text-center py-12 text-slate-500">載入中...</div>
    <div v-else-if="restaurants.length === 0" class="rounded-3xl border border-slate-100 bg-white p-12 text-center">
      <p class="text-slate-500">目前沒有店家，點擊「新增店家」開始建立</p>
    </div>
    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="restaurant in restaurants"
        :key="restaurant.restaurant_id"
        class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
      >
        <div class="flex items-start justify-between mb-3">
          <div>
            <h4 class="text-lg font-semibold text-slate-900">{{ restaurant.name }}</h4>
            <p v-if="restaurant.phone" class="text-sm text-slate-600 mt-1">{{ restaurant.phone }}</p>
            <p v-if="restaurant.address" class="text-xs text-slate-500 mt-1">{{ restaurant.address }}</p>
          </div>
          <span
            :class="[
              'rounded-full px-3 py-1 text-xs font-semibold',
              restaurant.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'
            ]"
          >
            {{ restaurant.is_active ? '啟用' : '停用' }}
          </span>
        </div>
        <div v-if="restaurant.menu_image_path" class="mb-3">
          <img
            :src="getImageUrl(restaurant.menu_image_path)"
            alt="菜單"
            class="w-full h-48 object-cover rounded-lg border border-slate-200"
          />
        </div>
        <div class="flex gap-2">
          <button
            @click="$emit('edit', restaurant)"
            class="rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-600"
          >
            編輯
          </button>
          <button
            @click="$emit('delete', restaurant.restaurant_id, restaurant.name)"
            class="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white hover:bg-red-600"
          >
            刪除
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Restaurant } from '../../composables/useRestaurantManagement'

interface Props {
  restaurants: Restaurant[]
  loading: boolean
  getImageUrl: (path: string) => string
}

const props = defineProps<Props>()

defineEmits<{
  edit: [restaurant: Restaurant]
  delete: [id: number, name: string]
}>()
</script>

