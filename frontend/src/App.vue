<template>
  <!-- 登入頁面不顯示 Sidebar -->
  <div v-if="isLoginPage" class="h-screen">
    <router-view />
  </div>
  
  <!-- 其他頁面顯示 Sidebar -->
  <div v-else class="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300">    <Sidebar :is-open="sidebarOpen" @close="closeSidebar" />
    <main class="flex-1 flex flex-col overflow-y-auto">
      <header 
        class="h-16 flex-shrink-0 border-b px-4 flex items-center justify-between shadow-sm backdrop-blur transition 
               border-slate-200 dark:border-slate-700 
               bg-white/90 dark:bg-slate-800/90"
      >
        <div class="flex items-center gap-4">
          
          <button 
            @click="toggleSidebar" 
            class="text-slate-500 hover:text-slate-900 md:hidden dark:text-slate-400 dark:hover:text-white"
            aria-label="開啟側邊欄"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <h1 class="text-xl font-semibold text-slate-900 dark:text-white">{{ pageTitle }}</h1>
          
        </div>
        <div class="flex items-center gap-4">
          
          <span class="text-sm font-semibold text-slate-500 hidden md:inline-flex dark:text-slate-400">九章補教系統</span>

          <label class="relative inline-flex items-center cursor-pointer">
              <input 
                  class="sr-only peer" 
                  type="checkbox" 
                  :checked="isDark" 
                  @change="toggleTheme"
              />
              <div
                  class="w-16 h-8 rounded-full ring-0 peer duration-500 outline-none bg-slate-100 overflow-hidden 
                         before:flex before:items-center before:justify-center after:flex after:items-center after:justify-center 
                         before:content-['☀️'] before:absolute before:h-6 before:w-6 before:top-1/2 before:bg-white before:rounded-full before:left-1 before:-translate-y-1/2 before:transition-all before:duration-700 
                         peer-checked:before:opacity-0 peer-checked:before:rotate-90 peer-checked:before:-translate-y-full 
                         peer-checked:shadow-gray-700 peer-checked:bg-slate-900 
                         after:content-['🌑'] after:absolute after:bg-[#111111] after:rounded-full after:top-[2px] after:right-1 after:translate-y-full after:w-6 after:h-6 after:opacity-0 after:transition-all after:duration-700 
                         peer-checked:after:opacity-100 peer-checked:after:rotate-180 peer-checked:after:translate-y-0"
              ></div>
          </label>
          
        </div>
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
    
    <ChangePasswordModal
      :show="showChangePasswordModal"
      :is-first-login="false"
      @close="showChangePasswordModal = false"
      @success="handlePasswordChangeSuccess"
    />
  </div>
</template>

<script setup>
  import { computed, ref, watch, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import Sidebar from './components/Sidebar.vue'
  import ChangePasswordModal from './components/ChangePasswordModal.vue'
  import { authAPI } from './services/api'
  
  
  // --- 1. 主題切換邏輯 START ---
  const isDark = ref(false)
  const THEME_KEY = 'user-theme'
  
  const applyTheme = (isDarkValue) => {
    if (isDarkValue) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
  
  const toggleTheme = () => {
    isDark.value = !isDark.value
    applyTheme(isDark.value)
    localStorage.setItem(THEME_KEY, isDark.value ? 'dark' : 'light')
  }
  
  const initializeTheme = () => {
    const storedTheme = localStorage.getItem(THEME_KEY)
  
    if (storedTheme) {
      isDark.value = storedTheme === 'dark'
    } else {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    
    applyTheme(isDark.value)
  }
  // --- 主題切換邏輯 END ---
  
  
  // --- 2. 您的原有應用程式邏輯 START ---
  const sidebarOpen = ref(false)
  const route = useRoute()
  const router = useRouter()
  const showChangePasswordModal = ref(false)
  
  const pageTitle = computed(() => route.meta.title || '九章後台管理系統')
  const isLoginPage = computed(() => route.name === 'login')
  
  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value
  }
  
  const closeSidebar = () => {
    sidebarOpen.value = false
  }
  
  // 檢查是否需要修改密碼
  const checkPasswordChange = async () => {
    if (isLoginPage.value) return
    
    try {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        if (user.must_change_password) {
          showChangePasswordModal.value = true
        }
      }
    } catch (error) {
      console.error('檢查密碼修改狀態失敗:', error)
    }
  }
  
  const handlePasswordChangeSuccess = async () => {
    // 重新獲取用戶信息
    try {
      const response = await authAPI.getCurrentUser()
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data))
      }
    } catch (error) {
      console.error('獲取用戶信息失敗:', error)
    }
    showChangePasswordModal.value = false
  }
  
  watch(
    () => route.fullPath,
    () => {
      closeSidebar()
      // 路由變化時檢查是否需要修改密碼
      if (!isLoginPage.value) {
        checkPasswordChange()
      }
    }
  )
  
  onMounted(() => {
    // 確保在組件掛載時執行主題初始化 (新加入的)
    initializeTheme() 
  
    if (!isLoginPage.value) {
      checkPasswordChange()
    }
  })
  // --- 您的原有應用程式邏輯 END ---
  </script>