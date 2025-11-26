<template>
  <div class="flex h-screen overflow-hidden bg-gray-50">
    <Sidebar :is-open="sidebarOpen" />
    <main class="flex-1 flex flex-col overflow-y-auto">
      <header class="h-16 flex-shrink-0 border-b border-gray-200 bg-white shadow-sm p-4 flex items-center justify-center relative">
        <button 
          @click="toggleSidebar" 
          class="absolute left-4 text-gray-500 hover:text-gray-900 md:hidden"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 class="text-xl font-semibold text-gray-900">學生資訊管理</h1>
      </header>
      <div class="flex-1 p-4 md:p-6">
        <router-view />
      </div>
    </main>
    <div 
      v-if="sidebarOpen"
      @click="toggleSidebar"
      class="fixed inset-0 z-30 bg-black opacity-50 transition-opacity duration-300 md:hidden"
    ></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from './components/Sidebar.vue'

const sidebarOpen = ref(false)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}
</script>

