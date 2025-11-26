<template>
  <div class="flex-1 p-4 md:p-6 flex flex-col items-center justify-center">
    <div class="w-full max-w-xl">
      <div class="w-full bg-white rounded-lg shadow-xl p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          {{ isEdit ? '編輯學生資料' : '新增學生資料' }}
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
            v-model="form.school"
            type="text" 
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150" 
            placeholder="學校"
            required
          >
          <input 
            v-model="form.grade"
            type="text" 
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150" 
            placeholder="年級"
            required
          >
          <input 
            v-model="form.contact"
            type="text" 
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150" 
            placeholder="聯絡方式"
            required
          >
          <textarea 
            v-model="form.notes"
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150" 
            placeholder="備註"
            rows="4"
          ></textarea>

          <div class="flex space-x-4">
            <button 
              type="submit" 
              :disabled="loading"
              class="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold py-3 px-4 rounded-lg mt-4 hover:from-indigo-700 hover:to-blue-700 transition ease-in-out duration-150 shadow-md disabled:opacity-50"
            >
              {{ loading ? '處理中...' : (isEdit ? '更新' : '新增') }}
            </button>
            <router-link 
              to="/students"
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
import { studentAPI } from '../services/api'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const loading = ref(false)

const form = ref({
  name: '',
  school: '',
  grade: '',
  contact: '',
  notes: ''
})

const fetchStudent = async () => {
  if (!isEdit.value) return
  
  try {
    const response = await studentAPI.getById(route.params.id)
    form.value = {
      name: response.data.name,
      school: response.data.school,
      grade: response.data.grade,
      contact: response.data.contact,
      notes: response.data.notes || ''
    }
  } catch (error) {
    console.error('獲取學生資料失敗:', error)
    alert('獲取學生資料失敗，請稍後再試')
    router.push('/students')
  }
}

const handleSubmit = async () => {
  loading.value = true
  try {
    if (isEdit.value) {
      await studentAPI.update(route.params.id, form.value)
      alert('更新成功')
    } else {
      await studentAPI.create(form.value)
      alert('新增成功')
    }
    router.push('/students')
  } catch (error) {
    console.error('操作失敗:', error)
    alert('操作失敗，請稍後再試')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (isEdit.value) {
    fetchStudent()
  }
})
</script>

