<template>
  <div class="flex h-screen overflow-hidden bg-slate-50">
    <Sidebar :is-open="sidebarOpen" @close="closeSidebar" />
    <main class="flex-1 flex flex-col overflow-y-auto">
      <header class="h-16 flex-shrink-0 border-b border-slate-200 bg-white/90 backdrop-blur shadow-sm px-4 flex items-center justify-between">
        <button 
          @click="toggleSidebar" 
          class="text-slate-500 hover:text-slate-900 md:hidden"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 class="text-xl font-semibold text-slate-900">{{ pageTitle }}</h1>
        <span class="text-sm font-semibold text-slate-500 hidden md:inline-flex">九章補教系統</span>
      </header>
      <div class="flex-1 p-4 md:p-6">
        <router-view />
      </div>
    </main>
    <div 
      v-if="sidebarOpen"
      @click="toggleSidebar"
      class="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 md:hidden"
    ></div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'

const sidebarOpen = ref(false)
const route = useRoute()

const pageTitle = computed(() => route.meta.title || '九章後台管理系統')

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

watch(
  () => route.fullPath,
  () => {
    closeSidebar()
  }
)
</script>

