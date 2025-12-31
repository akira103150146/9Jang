<template>
  <div class="flex-1 p-4 md:p-6 flex flex-col items-center justify-center">
    <div class="w-full max-w-xl">
      <div class="w-full bg-white rounded-lg shadow-xl p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          {{ isEdit ? '編輯請假記錄' : '新增請假記錄' }}
        </h2>

        <form @submit.prevent="handleSubmit" class="flex flex-col">
          <label class="block text-sm font-medium text-gray-700 mb-2">學生 <span class="text-red-500">*</span></label>
          <select 
            v-model="form.student"
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150"
            required
          >
            <option value="">選擇學生</option>
            <option v-for="student in students" :key="student.student_id || student.id" :value="student.student_id || student.id">
              {{ student.name }} ({{ student.school }} - {{ student.grade }})
            </option>
          </select>

          <label class="block text-sm font-medium text-gray-700 mb-2">課程 <span class="text-red-500">*</span></label>
          <select 
            v-model="form.course"
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150"
            required
          >
            <option value="">選擇課程</option>
            <option v-for="course in courses" :key="course.course_id || course.id" :value="course.course_id || course.id">
              {{ course.course_name }} ({{ getDayDisplay(course.day_of_week) }} {{ formatTime(course.start_time) }}-{{ formatTime(course.end_time) }})
            </option>
          </select>

          <label class="block text-sm font-medium text-gray-700 mb-2">請假日期 <span class="text-red-500">*</span></label>
          <input 
            v-model="form.leave_date"
            type="date" 
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150" 
            required
          >

          <label class="block text-sm font-medium text-gray-700 mb-2">請假原因 <span class="text-red-500">*</span></label>
          <textarea 
            v-model="form.reason"
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150" 
            placeholder="請輸入請假原因"
            rows="3"
            required
          ></textarea>

          <label class="block text-sm font-medium text-gray-700 mb-2">審核狀態 <span class="text-red-500">*</span></label>
          <select 
            v-model="form.approval_status"
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150"
            required
          >
            <option value="Pending">待審核</option>
            <option value="Approved">已核准</option>
            <option value="Rejected">已拒絕</option>
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
              to="/attendance"
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
import { leaveAPI, studentAPI, courseAPI } from '../services/api'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const loading = ref(false)
const students = ref([])
const courses = ref([])

const form = ref({
  student: '',
  course: '',
  leave_date: new Date().toISOString().split('T')[0], // 預設為今天
  reason: '',
  approval_status: 'Pending'
})

const dayMap = {
  'Mon': '週一',
  'Tue': '週二',
  'Wed': '週三',
  'Thu': '週四',
  'Fri': '週五',
  'Sat': '週六',
  'Sun': '週日',
}

const getDayDisplay = (day) => {
  return dayMap[day] || day
}

const formatTime = (time) => {
  if (!time) return ''
  return typeof time === 'string' ? time.substring(0, 5) : time
}

const fetchStudents = async () => {
  try {
    const response = await studentAPI.getAll()
    const data = response.data.results || response.data
    students.value = data
  } catch (error) {
    console.warn('獲取學生列表失敗:', error)
  }
}

const fetchCourses = async () => {
  try {
    const response = await courseAPI.getAll()
    const data = response.data.results || response.data
    courses.value = data
  } catch (error) {
    console.warn('獲取課程列表失敗:', error)
  }
}

const fetchLeave = async () => {
  if (!isEdit.value) return
  
  try {
    const response = await leaveAPI.getById(route.params.id)
    const leave = response.data
    form.value = {
      student: leave.student || leave.student_id || '',
      course: leave.course || leave.course_id || '',
      leave_date: leave.leave_date || new Date().toISOString().split('T')[0],
      reason: leave.reason || '',
      approval_status: leave.approval_status || 'Pending'
    }
  } catch (error) {
    console.error('獲取請假記錄失敗:', error)
    alert('獲取請假記錄失敗，請稍後再試')
    router.push('/attendance')
  }
}

const handleSubmit = async () => {
  loading.value = true
  try {
    const submitData = {
      student_id: parseInt(form.value.student),
      course_id: parseInt(form.value.course),
      leave_date: form.value.leave_date,
      reason: form.value.reason,
      approval_status: form.value.approval_status
    }
    
    if (isEdit.value) {
      await leaveAPI.update(route.params.id, submitData)
      alert('更新成功')
    } else {
      await leaveAPI.create(submitData)
      alert('新增成功')
    }
    router.push('/attendance')
  } catch (error) {
    console.error('操作失敗:', error)
    if (error.response?.data) {
      const errorMsg = error.response.data.detail || JSON.stringify(error.response.data)
      alert(`操作失敗：${errorMsg}`)
    } else {
      alert('操作失敗，請稍後再試')
    }
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await Promise.all([fetchStudents(), fetchCourses()])
  if (isEdit.value) {
    await fetchLeave()
  }
})
</script>

