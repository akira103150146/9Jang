<template>
  <div class="flex-1 p-4 md:p-6 flex flex-col items-center justify-center">
    <div class="w-full max-w-xl">
      <div class="w-full bg-white rounded-lg shadow-xl p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          {{ isEdit ? '編輯課程資料' : '新增課程資料' }}
        </h2>

        <form @submit.prevent="handleSubmit" class="flex flex-col">
          <label class="block text-sm font-medium text-gray-700 mb-2">課程名稱 <span class="text-red-500">*</span></label>
          <input 
            v-model="form.course_name"
            type="text" 
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150" 
            placeholder="課程名稱"
            required
          >
          
          <label class="block text-sm font-medium text-gray-700 mb-2">授課老師 <span class="text-red-500">*</span></label>
          <select 
            v-model="form.teacher"
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150"
            required
          >
            <option value="">選擇授課老師</option>
            <option v-for="teacher in teachers" :key="teacher.teacher_id || teacher.id" :value="teacher.teacher_id || teacher.id">
              {{ teacher.name }}
            </option>
          </select>

          <label class="block text-sm font-medium text-gray-700 mb-2">上課日 <span class="text-red-500">*</span></label>
          <select 
            v-model="form.day_of_week"
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150"
            required
          >
            <option value="">選擇上課日</option>
            <option value="Mon">週一</option>
            <option value="Tue">週二</option>
            <option value="Wed">週三</option>
            <option value="Thu">週四</option>
            <option value="Fri">週五</option>
            <option value="Sat">週六</option>
            <option value="Sun">週日</option>
          </select>

          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">開始時間</label>
              <input 
                v-model="form.start_time"
                type="time" 
                class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 w-full focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150" 
                required
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">結束時間</label>
              <input 
                v-model="form.end_time"
                type="time" 
                class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 w-full focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150" 
                required
              >
            </div>
          </div>

          <label class="block text-sm font-medium text-gray-700 mb-2">每堂課收費 <span class="text-red-500">*</span></label>
          <input 
            v-model.number="form.fee_per_session"
            type="number" 
            step="0.01"
            min="0"
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150" 
            placeholder="每堂課收費"
            required
          >

          <label class="block text-sm font-medium text-gray-700 mb-2">課程狀態 <span class="text-red-500">*</span></label>
          <select 
            v-model="form.status"
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150"
            required
          >
            <option value="Active">進行中</option>
            <option value="Pending">待開課</option>
            <option value="Closed">已結束</option>
          </select>

          <div class="flex space-x-4">
            <button 
              type="submit" 
              :disabled="loading"
              class="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold py-3 px-4 rounded-lg mt-4 hover:from-indigo-700 hover:to-blue-700 transition ease-in-out duration-150 shadow-md disabled:opacity-50"
            >
              {{ loading ? '處理中...' : (isEdit ? '更新' : '新增') }}
            </button>
            <router-link 
              to="/courses"
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
import { courseAPI, teacherAPI } from '../services/api'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const loading = ref(false)
const teachers = ref([])

const form = ref({
  course_name: '',
  teacher: '',
  day_of_week: '',
  start_time: '',
  end_time: '',
  fee_per_session: '',
  status: 'Active'
})

const fetchTeachers = async () => {
  try {
    const response = await teacherAPI.getAll()
    const data = response.data.results || response.data
    teachers.value = data
  } catch (error) {
    console.warn('獲取老師列表失敗:', error)
  }
}

const fetchCourse = async () => {
  if (!isEdit.value) return
  
  try {
    const response = await courseAPI.getById(route.params.id)
    const course = response.data
    form.value = {
      course_name: course.course_name,
      teacher: course.teacher || '',
      day_of_week: course.day_of_week,
      start_time: course.start_time ? course.start_time.substring(0, 5) : '',
      end_time: course.end_time ? course.end_time.substring(0, 5) : '',
      fee_per_session: course.fee_per_session,
      status: course.status || 'Active'
    }
  } catch (error) {
    console.error('獲取課程資料失敗:', error)
    alert('獲取課程資料失敗，請稍後再試')
    router.push('/courses')
  }
}

const handleSubmit = async () => {
  loading.value = true
  try {
    // 準備提交數據，確保格式正確
    const teacherValue = form.value.teacher
    // teacher 欄位為必填，必須是有效的整數 ID
    if (!teacherValue || teacherValue === '' || isNaN(parseInt(teacherValue, 10))) {
      alert('請選擇授課老師')
      loading.value = false
      return
    }
    const teacherId = parseInt(teacherValue, 10)
    
    // 確保時間格式正確（轉換為 HH:MM:SS 格式以確保相容性）
    const formatTime = (time) => {
      if (!time) return null
      // 如果已經是 HH:MM:SS 格式，直接返回
      if (time.includes(':') && time.split(':').length === 3) {
        return time
      }
      // 如果是 HH:MM 格式，轉換為 HH:MM:SS
      if (time.includes(':') && time.split(':').length === 2) {
        return `${time}:00`
      }
      return time
    }
    
    const submitData = {
      course_name: form.value.course_name.trim(),
      teacher: teacherId,
      day_of_week: form.value.day_of_week,
      start_time: formatTime(form.value.start_time),
      end_time: formatTime(form.value.end_time),
      fee_per_session: form.value.fee_per_session ? parseFloat(form.value.fee_per_session) : 0,
      status: form.value.status
    }
    
    // 驗證必填欄位
    if (!submitData.course_name || !submitData.teacher || !submitData.day_of_week || !submitData.start_time || !submitData.end_time) {
      alert('請填寫所有必填欄位')
      loading.value = false
      return
    }
    
    // 驗證費用為有效數字
    if (isNaN(submitData.fee_per_session) || submitData.fee_per_session < 0) {
      alert('請輸入有效的費用金額')
      loading.value = false
      return
    }
    
    if (isEdit.value) {
      await courseAPI.update(route.params.id, submitData)
      alert('更新成功')
    } else {
      await courseAPI.create(submitData)
      alert('新增成功')
    }
    router.push('/courses')
  } catch (error) {
    console.error('操作失敗:', error)
    // 顯示更詳細的錯誤訊息
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.message || 
                        (typeof error.response?.data === 'object' ? JSON.stringify(error.response.data) : null) ||
                        error.message || 
                        '操作失敗，請稍後再試'
    alert(`操作失敗：${errorMessage}`)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchTeachers()
  if (isEdit.value) {
    await fetchCourse()
  }
})
</script>

