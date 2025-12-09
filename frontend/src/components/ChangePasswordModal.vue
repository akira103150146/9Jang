<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    @click.self="$emit('close')"
  >
    <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
      <h3 class="text-xl font-bold text-slate-900 mb-4">
        {{ isFirstLogin ? '首次登入，請修改密碼' : '修改密碼' }}
      </h3>
      
      <form @submit.prevent="handleChangePassword" class="space-y-4">
        <div v-if="!isFirstLogin">
          <label class="block text-sm font-semibold text-slate-700 mb-1">舊密碼</label>
          <input
            v-model="form.old_password"
            type="password"
            required
            class="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-sky-500 focus:outline-none"
            placeholder="請輸入舊密碼"
          />
        </div>
        
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1">新密碼</label>
          <input
            v-model="form.new_password"
            type="password"
            required
            minlength="6"
            class="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-sky-500 focus:outline-none"
            placeholder="請輸入新密碼（至少6位）"
          />
        </div>
        
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1">確認新密碼</label>
          <input
            v-model="form.confirm_password"
            type="password"
            required
            class="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-sky-500 focus:outline-none"
            placeholder="請再次輸入新密碼"
          />
        </div>
        
        <div v-if="error" class="rounded-xl bg-rose-50 border border-rose-200 p-3">
          <p class="text-sm text-rose-600">{{ error }}</p>
        </div>
        
        <div class="flex gap-3">
          <button
            v-if="!isFirstLogin"
            type="button"
            @click="$emit('close')"
            class="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            取消
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="flex-1 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:from-sky-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">處理中...</span>
            <span v-else>確認修改</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { authAPI } from '../services/api'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  isFirstLogin: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'success'])

const form = ref({
  old_password: '',
  new_password: '',
  confirm_password: ''
})

const loading = ref(false)
const error = ref('')

watch(() => props.show, (newVal) => {
  if (newVal) {
    // 重置表單
    form.value = {
      old_password: '',
      new_password: '',
      confirm_password: ''
    }
    error.value = ''
  }
})

const handleChangePassword = async () => {
  error.value = ''
  
  // 驗證新密碼長度
  if (form.value.new_password.length < 6) {
    error.value = '新密碼至少需要6位字符'
    return
  }
  
  // 驗證兩次輸入的密碼是否一致
  if (form.value.new_password !== form.value.confirm_password) {
    error.value = '兩次輸入的密碼不一致'
    return
  }
  
  // 首次登入不需要舊密碼
  if (!props.isFirstLogin && !form.value.old_password) {
    error.value = '請輸入舊密碼'
    return
  }
  
  loading.value = true
  
  try {
    // 首次登入時，使用當前密碼作為舊密碼（從 localStorage 獲取）
    let oldPassword
    if (props.isFirstLogin) {
      // 首次登入，從 localStorage 獲取臨時密碼
      oldPassword = localStorage.getItem('temp_password')
      if (!oldPassword) {
        error.value = '無法獲取當前密碼，請重新登入'
        loading.value = false
        return
      }
    } else {
      oldPassword = form.value.old_password
    }
    
    await authAPI.changePassword(oldPassword, form.value.new_password)
    
    alert('密碼修改成功')
    emit('success')
    emit('close')
  } catch (err) {
    console.error('修改密碼失敗:', err)
    if (err.response?.data?.detail) {
      error.value = err.response.data.detail
    } else {
      error.value = '修改密碼失敗，請稍後再試'
    }
  } finally {
    loading.value = false
  }
}
</script>

