<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-indigo-50">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-3xl shadow-xl p-8 border border-blue-100">
        <!-- Logo 和標題 -->
        <div class="text-center mb-8">
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center">
              <span class="text-2xl font-bold text-white">九</span>
            </div>
          </div>
          <h1 class="text-2xl font-bold text-slate-900 mb-2">九章補教管理後台</h1>
          <p class="text-sm text-slate-500">請登入您的帳號以繼續</p>
        </div>

        <!-- 登入表單 -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Email 輸入 -->
          <div>
            <label for="email" class="block text-sm font-semibold text-slate-700 mb-2">
              電子郵件
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              autocomplete="email"
              class="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition"
              placeholder="sunroad0418@gmail.com"
            />
          </div>

          <!-- 密碼輸入 -->
          <div>
            <label for="password" class="block text-sm font-semibold text-slate-700 mb-2">
              密碼
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              autocomplete="current-password"
              class="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition"
              placeholder="請輸入密碼"
            />
          </div>

          <!-- 錯誤訊息 -->
          <div v-if="error" class="rounded-xl bg-rose-50 border border-rose-200 p-3">
            <p class="text-sm text-rose-600">{{ error }}</p>
          </div>

          <!-- 登入按鈕 -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-3 text-white font-semibold shadow-md hover:from-sky-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <span v-if="loading">登入中...</span>
            <span v-else>登入</span>
          </button>
        </form>

        <!-- 提示訊息 -->
        <div class="mt-6 text-center">
          <p class="text-xs text-slate-500">
            預設管理員帳號：sunroad0418@gmail.com
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '../services/api'

const router = useRouter()

const form = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await authAPI.login(form.value.email, form.value.password)
    
    // authAPI.login 已經處理了 token 和用戶信息的保存
    if (response.data.user && response.data.access) {
      // 跳轉到首頁
      router.push('/')
    } else {
      error.value = '登入失敗，請檢查帳號和密碼'
    }
  } catch (err) {
    console.error('登入錯誤:', err)
    if (err.response?.data?.detail) {
      error.value = err.response.data.detail
    } else {
      error.value = '登入失敗，請稍後再試'
    }
  } finally {
    loading.value = false
  }
}
</script>

