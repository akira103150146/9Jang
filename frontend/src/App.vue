<template>
  <!-- 登入頁面不顯示 Sidebar -->
  <div v-if="isLoginPage" class="h-screen">
    <router-view />
  </div>
  
  <!-- 其他頁面顯示 Sidebar -->
  <div v-else class="flex h-screen overflow-hidden bg-slate-50">
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
    
    <ChangePasswordModal
      :show="showChangePasswordModal"
      :is-first-login="false"
      @close="showChangePasswordModal = false"
      @success="handlePasswordChangeSuccess"
    />
  </div>
  
  <!-- Toast 通知容器 -->
  <Toast />
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import ChangePasswordModal from './components/ChangePasswordModal.vue'
import Toast from './components/Toast.vue'
import { authAPI } from './services/api'

const sidebarOpen: Ref<boolean> = ref(false)
const route = useRoute()
const router = useRouter()
const showChangePasswordModal: Ref<boolean> = ref(false)

const pageTitle = computed<string>(() => (route.meta.title as string) || '九章後台管理系統')
const isLoginPage = computed<boolean>(() => route.name === 'login')

const toggleSidebar = (): void => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = (): void => {
  sidebarOpen.value = false
}

// 檢查是否需要修改密碼
const checkPasswordChange = async (): Promise<void> => {
  if (isLoginPage.value) return

  try {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr) as { must_change_password?: boolean }
      if (user.must_change_password) {
        showChangePasswordModal.value = true
      }
    }
  } catch (error) {
    console.error('檢查密碼修改狀態失敗:', error)
  }
}

const handlePasswordChangeSuccess = async (): Promise<void> => {
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
  if (!isLoginPage.value) {
    checkPasswordChange()
  }
})
</script>

