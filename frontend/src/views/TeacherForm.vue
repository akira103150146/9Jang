<template>
  <div class="flex-1 p-4 md:p-6 flex flex-col items-center justify-center">
    <div class="w-full max-w-xl">
      <div class="w-full bg-white rounded-lg shadow-xl p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          {{ isEdit ? '編輯老師資料' : '新增老師資料' }}
        </h2>

        <form @submit.prevent="handleSubmit" class="flex flex-col">
          <input 
            v-model="form.name"
            type="text" 
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150" 
            placeholder="姓名"
            required
          >
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
            :placeholder="isEdit ? '留空則不修改密碼' : '密碼'"
            :required="!isEdit"
          >
          <select 
            v-model="form.permission_level"
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150"
            required
          >
            <option value="Teacher">老師</option>
            <option value="Admin">管理員</option>
          </select>
          <input 
            v-model="form.phone"
            type="text" 
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150" 
            placeholder="聯絡電話"
          >
          <input 
            v-model="form.hire_date"
            type="date" 
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150" 
            placeholder="入職日期"
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

const form = ref({
  name: '',
  username: '',
  password: '',
  permission_level: 'Teacher',
  phone: '',
  hire_date: ''
})

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
  try {
    const submitData = { ...form.value }
    
    // 如果編輯時沒有輸入密碼，則不發送密碼欄位
    if (isEdit.value && !submitData.password) {
      delete submitData.password
    } else if (!isEdit.value && !submitData.password) {
      // 新增時必須有密碼
      alert('請輸入密碼')
      loading.value = false
      return
    }
    
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
    alert('操作失敗，請稍後再試')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (isEdit.value) {
    fetchTeacher()
  }
})
</script>

