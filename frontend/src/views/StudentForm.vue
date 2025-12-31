<template>
  <div class="flex-1 p-4 md:p-6 flex flex-col items-center justify-center">
    <div class="w-full max-w-xl">
      <div class="w-full bg-white rounded-lg shadow-xl p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          {{ isEdit ? '編輯學生資料' : '新增學生資料' }}
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
          <label class="block text-sm font-medium text-gray-700 mb-2">學校 <span class="text-red-500">*</span></label>
          <input 
            v-model="form.school"
            type="text" 
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150" 
            placeholder="學校"
            required
          >
          <label class="block text-sm font-medium text-gray-700 mb-2">年級 <span class="text-red-500">*</span></label>
          <input 
            v-model="form.grade"
            type="text" 
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150" 
            placeholder="年級"
            required
          >
          <label class="block text-sm font-medium text-gray-700 mb-2">聯絡電話 <span class="text-gray-500 text-xs">（選填）</span></label>
          <input 
            v-model="form.phone"
            type="text" 
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150" 
            placeholder="聯絡電話"
          >
          <label class="block text-sm font-medium text-gray-700 mb-2">緊急聯絡人姓名 <span class="text-gray-500 text-xs">（選填）</span></label>
          <input 
            v-model="form.emergency_contact_name"
            type="text" 
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150" 
            placeholder="緊急聯絡人姓名"
          >
          <label class="block text-sm font-medium text-gray-700 mb-2">緊急聯絡人電話 <span class="text-gray-500 text-xs">（選填）</span></label>
          <input 
            v-model="form.emergency_contact_phone"
            type="text" 
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150" 
            placeholder="緊急聯絡人電話"
          >
          <label class="block text-sm font-medium text-gray-700 mb-2">備註 <span class="text-gray-500 text-xs">（選填）</span></label>
          <textarea 
            v-model="form.notes"
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150" 
            placeholder="備註"
            rows="4"
          ></textarea>

          <!-- 課程報名區塊 -->
          <div v-if="!isEdit" class="mt-6 pt-6 border-t border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">課程報名（選填）</h3>
            <p class="text-sm text-gray-600 mb-4">可以在新增學生時同時報名課程，或稍後再報名</p>
            
            <div class="space-y-4">
              <div v-for="(enrollment, index) in enrollments" :key="index" class="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div class="flex items-center justify-between mb-3">
                  <h4 class="font-semibold text-gray-900">報名 {{ index + 1 }}</h4>
                  <button
                    v-if="enrollments.length > 1"
                    type="button"
                    @click="removeEnrollment(index)"
                    class="text-xs text-red-600 hover:text-red-800 font-semibold"
                  >
                    移除
                  </button>
                </div>
                
                <div class="space-y-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">課程</label>
                    <select 
                      v-model="enrollment.course"
                      class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 w-full focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150"
                    >
                      <option value="">選擇課程（選填）</option>
                      <option v-for="course in courses" :key="course.course_id || course.id" :value="course.course_id || course.id">
                        {{ course.course_name }} ({{ getDayDisplay(course.day_of_week) }} {{ formatTime(course.start_time) }}-{{ formatTime(course.end_time) }})
                      </option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">報名日期</label>
                    <input 
                      v-model="enrollment.enroll_date"
                      type="date" 
                      class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 w-full focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">折扣百分比 (%)</label>
                    <input 
                      v-model.number="enrollment.discount_rate"
                      type="number" 
                      step="0.01"
                      min="0"
                      max="100"
                      class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 w-full focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150" 
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
              
              <button
                type="button"
                @click="addEnrollment"
                class="w-full rounded-lg border-2 border-dashed border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:border-blue-500 hover:text-blue-600"
              >
                + 新增課程報名
              </button>
            </div>
          </div>

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
import { studentAPI, enrollmentAPI, courseAPI } from '../services/api'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const loading = ref(false)
const courses = ref([])
const enrollments = ref([
  {
    course: '',
    enroll_date: new Date().toISOString().split('T')[0],
    discount_rate: 0
  }
])

const form = ref({
  name: '',
  school: '',
  grade: '',
  phone: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  notes: ''
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

const addEnrollment = () => {
  enrollments.value.push({
    course: '',
    enroll_date: new Date().toISOString().split('T')[0],
    discount_rate: 0
  })
}

const removeEnrollment = (index) => {
  if (enrollments.value.length > 1) {
    enrollments.value.splice(index, 1)
  }
}

const fetchCourses = async () => {
  try {
    const response = await courseAPI.getAll()
    const data = response.data.results || response.data
    courses.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.warn('獲取課程列表失敗:', error)
    courses.value = []
  }
}

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
    let studentId = null
    
    if (isEdit.value) {
      await studentAPI.update(route.params.id, form.value)
      studentId = route.params.id
      alert('更新成功')
    } else {
      const response = await studentAPI.create(form.value)
      studentId = response.data.student_id || response.data.id
      alert('新增成功')
      
      // 如果有課程報名，創建報名記錄
      if (enrollments.value.length > 0) {
        const validEnrollments = enrollments.value.filter(e => e.course)
        if (validEnrollments.length > 0) {
          let successCount = 0
          let failCount = 0
          
          for (const enrollment of validEnrollments) {
            try {
              await enrollmentAPI.create({
                student_id: studentId,
                course_id: parseInt(enrollment.course),
                enroll_date: enrollment.enroll_date,
                discount_rate: parseFloat(enrollment.discount_rate) || 0
              })
              successCount++
            } catch (error) {
              console.error('創建報名記錄失敗:', error)
              failCount++
            }
          }
          
          if (failCount === 0) {
            if (successCount > 0) {
              alert(`學生資料已新增，並成功報名 ${successCount} 門課程`)
            }
          } else {
            alert(`學生資料已新增，成功報名 ${successCount} 門課程，失敗 ${failCount} 門`)
          }
        }
      }
    }
    
    router.push('/students')
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
  await fetchCourses()
  if (isEdit.value) {
    fetchStudent()
  }
})
</script>

