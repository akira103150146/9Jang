<template>
  <div class="container mx-auto">
    <div class="mb-6 flex justify-end">
      <router-link 
        to="/students/add" 
        class="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-150 shadow-md text-base"
      >
        新增學生資料
      </router-link>
    </div>

    <!-- 桌面版表格 -->
    <div class="hidden md:block shadow-lg rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white">
          <thead class="bg-gray-100 border-b border-gray-300">
            <tr>
              <th class="py-3 px-4 text-left text-sm font-semibold text-gray-900">姓名</th>
              <th class="py-3 px-4 text-left text-sm font-semibold text-gray-900">學校/年級</th>
              <th class="py-3 px-4 text-left text-sm font-semibold text-gray-900 hidden lg:table-cell">聯絡方式</th>
              <th class="py-3 px-4 text-left text-sm font-semibold text-gray-900 hidden xl:table-cell">備註</th>
              <th class="py-3 px-4 text-center text-sm font-semibold text-gray-900">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in students" :key="student.id" class="border-b hover:bg-gray-50 transition duration-100">
              <td class="py-3 px-4 text-sm font-medium text-gray-900">{{ student.name }}</td>
              <td class="py-3 px-4 text-sm text-gray-600">{{ student.school }} / {{ student.grade }}</td>
              <td class="py-3 px-4 text-sm text-gray-600 hidden lg:table-cell">{{ student.contact }}</td>
              <td class="py-3 px-4 text-sm text-gray-600 truncate max-w-xs hidden xl:table-cell">{{ student.notes || '無' }}</td>
              <td class="py-3 px-4 text-center whitespace-nowrap">
                <router-link 
                  :to="`/students/edit/${student.id}`" 
                  class="bg-blue-500 text-white px-3 py-1 text-xs rounded-full hover:bg-blue-600 mr-2"
                >
                  編輯
                </router-link>
                <button 
                  @click="deleteStudent(student.id, student.name)"
                  class="bg-red-500 text-white px-3 py-1 text-xs rounded-full hover:bg-red-600"
                >
                  刪除
                </button>
              </td>
            </tr>
            <tr v-if="students.length === 0">
              <td colspan="5" class="py-4 px-4 text-center text-gray-500">目前沒有學生資料。</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 手機版卡片 -->
    <div class="md:hidden space-y-4">
      <div 
        v-for="student in students" 
        :key="student.id"
        class="bg-white rounded-lg shadow-lg p-4 border border-gray-200"
      >
        <div class="flex items-center justify-between border-b pb-2 mb-2">
          <div class="flex-1">
            <p class="text-xl font-bold text-indigo-700">{{ student.name }}</p>
            <p class="text-sm text-gray-500">{{ student.school }} / {{ student.grade }}</p>
          </div>
          
          <div class="flex space-x-2 flex-shrink-0">
            <router-link 
              :to="`/students/edit/${student.id}`" 
              class="bg-blue-500 text-white p-2 text-xs rounded-full hover:bg-blue-600"
            >
              <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </router-link>
            
            <button 
              @click="deleteStudent(student.id, student.name)"
              class="bg-red-500 text-white p-2 text-xs rounded-full hover:bg-red-600"
            >
              <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="space-y-1 text-sm">
          <p class="text-gray-700">
            <span class="font-medium text-gray-500 w-24 inline-block">聯絡方式:</span> 
            {{ student.contact }}
          </p>
          <p class="text-gray-700">
            <span class="font-medium text-gray-500 w-24 inline-block">備註:</span> 
            {{ student.notes || '無' }}
          </p>
        </div>
      </div>
      
      <div v-if="students.length === 0" class="py-4 text-center text-gray-500 bg-white rounded-lg shadow-md">
        目前沒有學生資料。
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { studentAPI } from '../services/api'

const students = ref([])
const loading = ref(false)

const fetchStudents = async () => {
  loading.value = true
  try {
    const response = await studentAPI.getAll()
    students.value = response.data.results || response.data
  } catch (error) {
    console.error('獲取學生資料失敗:', error)
    alert('獲取學生資料失敗，請稍後再試')
  } finally {
    loading.value = false
  }
}

const deleteStudent = async (id, name) => {
  if (!confirm(`確定要刪除學生 ${name} 的資料嗎？`)) {
    return
  }
  
  try {
    await studentAPI.delete(id)
    alert('刪除成功')
    fetchStudents()
  } catch (error) {
    console.error('刪除失敗:', error)
    alert('刪除失敗，請稍後再試')
  }
}

onMounted(() => {
  fetchStudents()
})
</script>

