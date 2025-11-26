<template>
  <aside 
    id="sidebar"
    :class="[
      'fixed inset-y-0 left-0 z-40 w-64 flex-shrink-0 bg-white h-full flex flex-col justify-between p-4 border-r border-gray-300 transition-transform duration-300 ease-in-out',
      isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:relative md:flex'
    ]"
  >
    <nav class="space-y-1">
      <div class="flex items-center justify-center space-x-3 mb-10 pb-4 border-b border-gray-200">
        <img :src="logoUrl" alt="九章 Logo" class="h-10 w-auto object-cover">
        <span class="text-2xl font-extrabold tracking-wider text-gray-900">後台</span>
      </div>
      
      <router-link 
        to="/" 
        class="flex items-center space-x-3 p-2 rounded-lg font-semibold transition-colors"
        :class="$route.name === 'student-list' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'"
      >
        <span>學生資訊</span>
      </router-link>

      <a href="#" class="flex items-center space-x-3 p-2 rounded-lg text-gray-700 hover:bg-gray-100">
        <span>課程管理</span>
      </a>
    </nav>
  </aside>
</template>

<script setup>
import logoUrl from '../assets/logo_jiuzhang.png'

defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})
</script>

