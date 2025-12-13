<template>
  <div class="flex-1 p-4 md:p-6 flex flex-col items-center justify-center">
    <div class="w-full max-w-xl">
      <div 
        class="w-full bg-white rounded-lg shadow-xl p-6 
               dark:bg-slate-800 dark:shadow-2xl"
      >
        <h2 class="text-2xl font-bold text-gray-900 mb-4 dark:text-white">
          {{ isEdit ? '編輯學生資料' : '新增學生資料' }}
        </h2>

        <form @submit.prevent="handleSubmit" class="flex flex-col">
          
          <input 
            v-model="form.name"
            type="text" 
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150
                   dark:bg-slate-700 dark:text-white dark:focus:bg-slate-600 dark:focus:ring-blue-400" 
            placeholder="姓名"
            required
          >
          <input 
            v-model="form.school"
            type="text" 
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150
                   dark:bg-slate-700 dark:text-white dark:focus:bg-slate-600 dark:focus:ring-blue-400" 
            placeholder="學校"
            required
          >
          <input 
            v-model="form.grade"
            type="text" 
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150
                   dark:bg-slate-700 dark:text-white dark:focus:bg-slate-600 dark:focus:ring-blue-400" 
            placeholder="年級"
            required
          >
          <input 
            v-model="form.phone"
            type="tel" 
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150
                   dark:bg-slate-700 dark:text-white dark:focus:bg-slate-600 dark:focus:ring-blue-400" 
            placeholder="手機"
          >

          <h3 class="text-xl font-bold text-gray-900 mb-4 mt-6 dark:text-white">緊急聯絡人</h3>

          <input 
            v-model="form.emergency_contact_name"
            type="text" 
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150
                   dark:bg-slate-700 dark:text-white dark:focus:bg-slate-600 dark:focus:ring-blue-400" 
            placeholder="姓名"
          >
          <input 
            v-model="form.emergency_contact_phone"
            type="tel" 
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150
                   dark:bg-slate-700 dark:text-white dark:focus:bg-slate-600 dark:focus:ring-blue-400" 
            placeholder="手機"
          >

          <h3 class="text-xl font-bold text-gray-900 mb-4 mt-6 dark:text-white">備註</h3>

          <textarea
            v-model="form.notes"
            rows="4"
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-6 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150
                   dark:bg-slate-700 dark:text-white dark:focus:bg-slate-600 dark:focus:ring-blue-400" 
            placeholder="備註"
          ></textarea>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              @click="router.back()"
              class="bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-md hover:bg-gray-400 transition ease-in-out duration-150
                     dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500"
            >
              取消
            </button>
            
            <button
              type="submit"
              :disabled="loading"
              class="bg-blue-500 text-white font-bold py-3 px-6 rounded-md hover:bg-blue-600 transition ease-in-out duration-150 disabled:opacity-50"
            >
              {{ loading ? '處理中...' : (isEdit ? '儲存變更' : '新增學生') }}
            </button>
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
  phone: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
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
      phone: response.data.phone || '',
      emergency_contact_name: response.data.emergency_contact_name || '',
      emergency_contact_phone: response.data.emergency_contact_phone || '',
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

