<template>
  <div class="space-y-6">
    <header class="rounded-3xl border border-blue-100 bg-gradient-to-r from-white to-sky-50 p-6 shadow-sm">
      <p class="text-sm font-semibold text-slate-500">營運資訊</p>
      <h2 class="text-2xl font-bold text-slate-900">校區與店家資訊</h2>
      <p class="mt-2 text-sm text-slate-500">包含營業時間、地址與菜單圖片路徑</p>
    </header>

    <div class="grid gap-4 md:grid-cols-2">
      <article
        v-for="store in stores"
        :key="store.store_id"
        class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
      >
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">校區 #{{ store.store_id }}</p>
        <h3 class="mt-1 text-lg font-semibold text-slate-900">{{ store.name }}</h3>
        <dl class="mt-3 space-y-2 text-sm">
          <div>
            <dt class="font-semibold text-slate-500">營業時間</dt>
            <dd class="text-slate-700">{{ store.business_hours }}</dd>
          </div>
          <div>
            <dt class="font-semibold text-slate-500">地址</dt>
            <dd class="text-slate-700">{{ store.address }}</dd>
          </div>
          <div>
            <dt class="font-semibold text-slate-500">菜單檔案</dt>
            <dd class="text-slate-700">{{ store.menu_image_path }}</dd>
          </div>
        </dl>
      </article>
    </div>
  </div>
</template>

<script setup>
import { mockStores } from '../data/mockData'

const stores = mockStores
</script>

