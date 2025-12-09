<template>
  <div class="flex-1 p-4 md:p-6 flex flex-col items-center justify-center">
    <div class="w-full max-w-xl">
      <div class="w-full bg-white rounded-lg shadow-xl p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          {{ isEdit ? '編輯報名記錄' : '新增報名記錄' }}
        </h2>

        <form @submit.prevent="handleSubmit" class="flex flex-col">
          <label class="block text-sm font-medium text-gray-700 mb-2">學生</label>
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

          <label class="block text-sm font-medium text-gray-700 mb-2">課程</label>
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

          <label class="block text-sm font-medium text-gray-700 mb-2">報名日期</label>
          <input 
            v-model="form.enroll_date"
            type="date" 
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150" 
            required
          >

          <label class="block text-sm font-medium text-gray-700 mb-2">折扣百分比 (%)</label>
          <input 
            v-model.number="form.discount_rate"
            type="number" 
            step="0.01"
            min="0"
            max="100"
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150" 
            placeholder="0.00"
            required
          >
          <p class="text-xs text-gray-500 mb-4">輸入折扣百分比，例如：10 表示 10% 折扣</p>

          <!-- 上課期間管理（僅在編輯時顯示） -->
          <div v-if="isEdit && enrollmentId" class="mt-6 pt-6 border-t border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">上課期間管理</h3>
            <p class="text-sm text-gray-600 mb-4">管理學生的上課期間，系統會根據期間生成學費</p>
            
            <div v-if="loadingPeriods" class="text-center py-4 text-gray-500">載入期間數據中...</div>
            <div v-else class="space-y-3">
              <div
                v-for="(period, index) in periods"
                :key="period.period_id || index"
                class="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div class="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-1">開始日期</label>
                    <input
                      v-model="period.start_date"
                      type="date"
                      class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-1">結束日期（可選）</label>
                    <input
                      v-model="period.end_date"
                      type="date"
                      class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                    <p class="text-xs text-gray-500 mt-1">留空表示持續中</p>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="block text-xs font-semibold text-gray-700 mb-1">備註</label>
                  <textarea
                    v-model="period.notes"
                    rows="2"
                    class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="例如：請假中、恢復上課等..."
                  ></textarea>
                </div>
                <div class="flex items-center justify-between">
                  <label class="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      v-model="period.is_active"
                      type="checkbox"
                      class="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                    />
                    <span>啟用此期間</span>
                  </label>
                  <button
                    type="button"
                    @click="removePeriod(index)"
                    class="px-3 py-1 text-xs font-semibold text-red-600 hover:text-red-800"
                  >
                    刪除期間
                  </button>
                </div>
              </div>
              <button
                type="button"
                @click="addPeriod"
                class="w-full rounded-lg border-2 border-dashed border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:border-blue-500 hover:text-blue-600"
              >
                + 新增上課期間
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
              to="/enrollments"
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
import { enrollmentAPI, enrollmentPeriodAPI, studentAPI, courseAPI } from '../services/api'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const enrollmentId = computed(() => route.params.id || null)
const loading = ref(false)
const loadingPeriods = ref(false)
const students = ref([])
const courses = ref([])
const periods = ref([])

const form = ref({
  student: '',
  course: '',
  enroll_date: new Date().toISOString().split('T')[0], // 預設為今天
  discount_rate: 0
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

const fetchEnrollment = async () => {
  if (!isEdit.value) return
  
  try {
    const response = await enrollmentAPI.getById(route.params.id)
    const enrollment = response.data
    form.value = {
      student: enrollment.student || enrollment.student_id || '',
      course: enrollment.course || enrollment.course_id || '',
      enroll_date: enrollment.enroll_date || new Date().toISOString().split('T')[0],
      discount_rate: enrollment.discount_rate || 0
    }
    
    // 獲取上課期間
    await fetchPeriods()
  } catch (error) {
    console.error('獲取報名記錄失敗:', error)
    alert('獲取報名記錄失敗，請稍後再試')
    router.push('/enrollments')
  }
}

const fetchPeriods = async () => {
  if (!enrollmentId.value) return
  
  loadingPeriods.value = true
  try {
    const response = await enrollmentPeriodAPI.getByEnrollment(enrollmentId.value)
    const data = response.data.results || response.data
    periods.value = Array.isArray(data) 
      ? data.map(p => ({
          period_id: p.period_id,
          start_date: p.start_date ? p.start_date.split('T')[0] : '',
          end_date: p.end_date ? p.end_date.split('T')[0] : '',
          is_active: p.is_active !== undefined ? p.is_active : true,
          notes: p.notes || '',
        }))
      : []
    
    // 如果沒有期間記錄，創建一個初始期間
    if (periods.value.length === 0 && form.value.enroll_date) {
      periods.value = [{
        period_id: null,
        start_date: form.value.enroll_date,
        end_date: '',
        is_active: true,
        notes: '初始上課期間',
      }]
    }
  } catch (error) {
    console.error('獲取上課期間失敗:', error)
    periods.value = []
  } finally {
    loadingPeriods.value = false
  }
}

const addPeriod = () => {
  periods.value.push({
    period_id: null,
    start_date: '',
    end_date: '',
    is_active: true,
    notes: '',
  })
}

const removePeriod = (index) => {
  if (periods.value.length > 1) {
    periods.value.splice(index, 1)
  } else {
    alert('至少需要保留一個上課期間')
  }
}

const handleSubmit = async () => {
  loading.value = true
  try {
    const submitData = {
      student: parseInt(form.value.student),
      course: parseInt(form.value.course),
      enroll_date: form.value.enroll_date,
      discount_rate: parseFloat(form.value.discount_rate) || 0
    }
    
    let createdEnrollmentId = null
    
    if (isEdit.value) {
      await enrollmentAPI.update(route.params.id, submitData)
      createdEnrollmentId = route.params.id
    } else {
      const createResponse = await enrollmentAPI.create(submitData)
      createdEnrollmentId = createResponse.data.enrollment_id
    }
    
    // 如果是編輯模式，更新上課期間
    if (isEdit.value && createdEnrollmentId) {
      await savePeriods(createdEnrollmentId)
    }
    
    alert(isEdit.value ? '更新成功' : '新增成功')
    router.push('/enrollments')
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

const savePeriods = async (enrollmentId) => {
  // 獲取現有的期間記錄
  const existingResponse = await enrollmentPeriodAPI.getByEnrollment(enrollmentId)
  const existingData = existingResponse.data.results || existingResponse.data
  const existingPeriods = Array.isArray(existingData) ? existingData : []
  const existingIds = existingPeriods.map(p => p.period_id)
  
  // 保存或更新期間
  for (const period of periods.value) {
    const periodData = {
      enrollment: enrollmentId,
      start_date: period.start_date,
      end_date: period.end_date || null,
      is_active: period.is_active,
      notes: period.notes || '',
    }
    
    if (period.period_id && existingIds.includes(period.period_id)) {
      // 更新現有期間
      await enrollmentPeriodAPI.update(period.period_id, periodData)
    } else if (!period.period_id) {
      // 創建新期間
      await enrollmentPeriodAPI.create(periodData)
    }
  }
  
  // 刪除已移除的期間
  const currentIds = periods.value.filter(p => p.period_id).map(p => p.period_id)
  for (const existing of existingPeriods) {
    if (!currentIds.includes(existing.period_id)) {
      await enrollmentPeriodAPI.delete(existing.period_id)
    }
  }
}

onMounted(async () => {
  await Promise.all([fetchStudents(), fetchCourses()])
  if (isEdit.value) {
    await fetchEnrollment()
  }
})
</script>

