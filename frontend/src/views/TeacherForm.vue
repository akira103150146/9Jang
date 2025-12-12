<template>
  <div class="flex-1 p-4 md:p-6 flex flex-col items-center justify-center">
    <div class="w-full max-w-xl">
      <div class="w-full bg-white rounded-lg shadow-xl p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          {{ isEdit ? '編輯老師資料' : '新增老師資料' }}
        </h2>

        <form @submit.prevent="handleSubmit" class="flex flex-col">
          <label class="block text-sm font-medium text-gray-700 mb-2">姓名 <span class="text-red-500">*</span></label>
          <input 
            v-model="form.name"
            type="text" 
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150" 
            placeholder="姓名"
            required
          >
          <label class="block text-sm font-medium text-gray-700 mb-2">帳號 <span class="text-red-500">*</span></label>
          <input 
            v-model="form.username"
            type="text" 
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150" 
            placeholder="帳號"
            required
          >
          <input 
            v-model="form.password"
            type="password" 
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150" 
            :class="{ 'border-2 border-red-500': !isEdit && form.password && form.confirmPassword && form.password !== form.confirmPassword }"
            :placeholder="isEdit ? '留空則不修改密碼' : '密碼'"
            :required="!isEdit"
            @input="clearPasswordError"
          >
          <input 
            v-if="!isEdit"
            v-model="form.confirmPassword"
            type="password" 
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150" 
            :class="{ 'border-2 border-red-500': form.password && form.confirmPassword && form.password !== form.confirmPassword }"
            placeholder="確認密碼"
            required
            @input="clearPasswordError"
          >
          <p 
            v-if="!isEdit && form.password && form.confirmPassword && form.password !== form.confirmPassword" 
            class="text-red-500 text-sm mb-4 -mt-2"
          >
            密碼與確認密碼不一致
          </p>
          <label class="block text-sm font-medium text-gray-700 mb-2">權限等級 <span class="text-red-500">*</span></label>
          <select 
            v-model="form.permission_level"
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150"
            required
          >
            <option value="Teacher">老師</option>
            <option value="Admin">管理員</option>
            <option value="Accountant">會計</option>
          </select>
          <label class="block text-sm font-medium text-gray-700 mb-2">聯絡電話 <span class="text-gray-500 text-xs">（選填）</span></label>
          <input 
            v-model="form.phone"
            type="text" 
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150" 
            placeholder="聯絡電話"
          >
          <label class="block text-sm font-medium text-gray-700 mb-2">入職日期 <span class="text-gray-500 text-xs">（選填）</span></label>
          <input 
            v-model="form.hire_date"
            type="date" 
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150"
          >

          <div class="flex space-x-4">
            <button 
              type="submit" 
              :disabled="loading"
              class="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold py-3 px-4 rounded-lg mt-4 hover:from-indigo-700 hover:to-blue-700 transition ease-in-out duration-150 shadow-md disabled:opacity-50"
            >
              {{ loading ? '處理中...' : (isEdit ? '更新' : '新增') }}
            </button>
            <router-link 
              to="/teachers"
              class="flex-1 bg-gray-300 text-gray-900 font-bold py-3 px-4 rounded-lg mt-4 hover:bg-gray-400 transition ease-in-out duration-150 shadow-md text-center"
            >
              取消
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { teacherAPI } from '../services/api'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const loading = ref(false)

// 獲取今天的日期（格式：YYYY-MM-DD）
const getTodayDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const form = ref({
  name: '',
  username: '',
  password: '',
  confirmPassword: '', // 確認密碼欄位（僅新增時使用）
  permission_level: 'Teacher',
  phone: '',
  hire_date: getTodayDate() // 新增時預設為今天
})

const passwordError = ref('')

const clearPasswordError = () => {
  passwordError.value = ''
}

const fetchTeacher = async () => {
  if (!isEdit.value) return
  
  try {
    const response = await teacherAPI.getById(route.params.id)
    form.value = {
      name: response.data.name,
      username: response.data.username,
      password: '', // 編輯時不顯示密碼
      permission_level: response.data.permission_level || 'Teacher',
      phone: response.data.phone || '',
      hire_date: response.data.hire_date || ''
    }
  } catch (error) {
    console.error('獲取老師資料失敗:', error)
    alert('獲取老師資料失敗，請稍後再試')
    router.push('/teachers')
  }
}

const handleSubmit = async () => {
  loading.value = true
  passwordError.value = ''
  
  try {
    const submitData = { ...form.value }
    
    // 新增時：驗證密碼和確認密碼
    if (!isEdit.value) {
      // 檢查是否輸入密碼
      if (!submitData.password || submitData.password.trim() === '') {
        passwordError.value = '請輸入密碼'
        alert('請輸入密碼')
        loading.value = false
        return
      }
      
      // 檢查是否輸入確認密碼
      if (!submitData.confirmPassword || submitData.confirmPassword.trim() === '') {
        passwordError.value = '請輸入確認密碼'
        alert('請輸入確認密碼')
        loading.value = false
        return
      }
      
      // 驗證密碼是否一致
      if (submitData.password.trim() !== submitData.confirmPassword.trim()) {
        passwordError.value = '密碼與確認密碼不一致'
        alert('密碼與確認密碼不一致，請重新輸入')
        loading.value = false
        return
      }
      
      // 確保密碼不是只有空格
      submitData.password = submitData.password.trim()
      if (submitData.password === '') {
        passwordError.value = '密碼不能為空'
        alert('密碼不能為空')
        loading.value = false
        return
      }
    }
    
    // 編輯時：如果沒有輸入密碼，則不發送密碼欄位
    if (isEdit.value) {
      if (!submitData.password || submitData.password.trim() === '') {
        delete submitData.password
      } else {
        submitData.password = submitData.password.trim()
      }
    }
    
    // 移除確認密碼欄位（不需要發送到後端）
    delete submitData.confirmPassword
    
    // 確保必填字段存在
    if (!isEdit.value) {
      if (!submitData.name || submitData.name.trim() === '') {
        alert('請輸入姓名')
        loading.value = false
        return
      }
      if (!submitData.username || submitData.username.trim() === '') {
        alert('請輸入帳號')
        loading.value = false
        return
      }
      submitData.name = submitData.name.trim()
      submitData.username = submitData.username.trim()
      
      // 確填入職日期有值（新增時預設為今天，但如果用戶清空了，則使用今天）
      if (!submitData.hire_date || submitData.hire_date.trim() === '') {
        submitData.hire_date = getTodayDate()
      }
    }
    
    // 調試：打印發送的數據
    console.log('發送數據:', JSON.stringify(submitData, null, 2))
    
    // 後端會自動處理密碼雜湊，這裡只需要發送 password 欄位
    if (isEdit.value) {
      await teacherAPI.update(route.params.id, submitData)
      alert('更新成功')
    } else {
      await teacherAPI.create(submitData)
      alert('新增成功')
    }
    router.push('/teachers')
  } catch (error) {
    console.error('操作失敗:', error)
    console.error('錯誤詳情:', error.response?.data)
    
    // 處理各種錯誤情況
    let errorMessage = '操作失敗，請稍後再試'
    
    if (error.response?.data) {
      const errorData = error.response.data
      
      // 處理字段驗證錯誤
      if (errorData.password) {
        errorMessage = Array.isArray(errorData.password) 
          ? `密碼錯誤：${errorData.password[0]}` 
          : `密碼錯誤：${errorData.password}`
      } else if (errorData.username) {
        errorMessage = Array.isArray(errorData.username) 
          ? `帳號錯誤：${errorData.username[0]}` 
          : `帳號錯誤：${errorData.username}`
      } else if (errorData.name) {
        errorMessage = Array.isArray(errorData.name) 
          ? `姓名錯誤：${errorData.name[0]}` 
          : `姓名錯誤：${errorData.name}`
      } else if (errorData.non_field_errors) {
        // 處理非字段錯誤
        errorMessage = Array.isArray(errorData.non_field_errors) 
          ? errorData.non_field_errors[0] 
          : errorData.non_field_errors
      } else if (errorData.detail) {
        errorMessage = errorData.detail
      } else {
        // 顯示所有錯誤
        const allErrors = Object.keys(errorData).map(key => {
          const value = errorData[key]
          return `${key}: ${Array.isArray(value) ? value[0] : value}`
        }).join('\n')
        errorMessage = `錯誤詳情：\n${allErrors}`
      }
    } else if (error.message) {
      errorMessage = error.message
    }
    
    alert(errorMessage)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (isEdit.value) {
    fetchTeacher()
  } else {
    // 新增時，確保日期欄位有預設值
    form.value.hire_date = getTodayDate()
  }
})
</script>

