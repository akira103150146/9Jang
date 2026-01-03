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
            :disabled="!form.student"
          >
            <option value="">{{ form.student ? '選擇課程' : '請先選擇學生' }}</option>
            <option v-for="course in courses" :key="course.course_id || course.id" :value="course.course_id || course.id">
              {{ course.course_name }} ({{ getDayDisplay(course.day_of_week) }} {{ formatTime(course.start_time) }}-{{ formatTime(course.end_time) }})
            </option>
          </select>
          <p v-if="form.student && courses.length === 0" class="text-sm text-amber-600 mb-2">
            此學生尚未報名任何課程
          </p>

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
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { leaveAPI, studentAPI, courseAPI, enrollmentAPI } from '../services/api'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const loading = ref(false)
const students = ref([])
const allCourses = ref([]) // 所有課程
const enrolledCourses = ref([]) // 學生已報名的課程

const form = ref({
  student: '',
  course: '',
  leave_date: new Date().toISOString().split('T')[0], // 預設為今天
  reason: '',
  approval_status: 'Pending'
})

// 計算屬性：根據是否選擇學生來決定顯示的課程列表
const courses = computed(() => {
  if (form.value.student) {
    // 如果選擇了學生，只顯示該學生已報名的課程
    return enrolledCourses.value
  }
  // 如果沒有選擇學生，顯示所有課程（編輯模式下）
  return allCourses.value
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
    allCourses.value = data
  } catch (error) {
    console.warn('獲取課程列表失敗:', error)
  }
}

// 獲取學生已報名的課程
const fetchStudentEnrolledCourses = async (studentId) => {
  if (!studentId) {
    enrolledCourses.value = []
    return
  }

  try {
    // 方法1：嘗試從學生資料中獲取報名課程（更高效）
    try {
      const studentResponse = await studentAPI.getById(studentId)
      const student = studentResponse.data
      
      if (student.enrollments && Array.isArray(student.enrollments)) {
        // 過濾出未刪除的報名記錄
        const activeEnrollments = student.enrollments.filter(e => !e.is_deleted)
        const enrolledCourseIds = activeEnrollments.map(e => e.course_id || e.course?.course_id || e.course?.id || e.course)
        
        // 從所有課程中過濾出已報名的課程
        enrolledCourses.value = allCourses.value.filter(course => {
          const courseId = course.course_id || course.id
          // 支持字符串和數字類型的匹配
          return enrolledCourseIds.some(eid => {
            if (eid === null || eid === undefined) return false
            return eid === courseId || eid === parseInt(courseId) || parseInt(eid) === courseId
          })
        })
        
        return
      }
    } catch (error) {
      console.warn('從學生資料獲取報名課程失敗，嘗試其他方法:', error)
    }

    // 方法2：從報名記錄中獲取（備用方法）
    const response = await enrollmentAPI.getAll(true)
    const enrollments = response.data.results || response.data
    
    // 過濾出該學生的報名記錄（排除已刪除的）
    const studentEnrollments = Array.isArray(enrollments) 
      ? enrollments.filter(e => {
          const enrollmentStudentId = e.student_id || e.student?.student_id || e.student?.id || e.student
          return enrollmentStudentId === parseInt(studentId) && !e.is_deleted
        })
      : []

    // 獲取這些報名記錄對應的課程ID
    const enrolledCourseIds = studentEnrollments.map(e => e.course_id || e.course?.course_id || e.course?.id || e.course)
    
    // 從所有課程中過濾出已報名的課程
    enrolledCourses.value = allCourses.value.filter(course => {
      const courseId = course.course_id || course.id
      // 支持字符串和數字類型的匹配
      return enrolledCourseIds.some(eid => {
        if (eid === null || eid === undefined) return false
        return eid === courseId || eid === parseInt(courseId) || parseInt(eid) === courseId
      })
    })
  } catch (error) {
    console.warn('獲取學生報名課程失敗:', error)
    enrolledCourses.value = []
  }
}

// 監聽學生選擇變化
watch(() => form.value.student, async (newStudentId) => {
  if (newStudentId) {
    // 清空課程選擇
    form.value.course = ''
    // 獲取該學生已報名的課程
    await fetchStudentEnrolledCourses(newStudentId)
  } else {
    enrolledCourses.value = []
  }
})

const fetchLeave = async () => {
  if (!isEdit.value) return
  
  try {
    const response = await leaveAPI.getById(route.params.id)
    const leave = response.data
    const studentId = leave.student || leave.student_id || ''
    const courseId = leave.course || leave.course_id || ''
    const courseIdNum = courseId ? parseInt(courseId) : null
    
    // 先設置學生，然後獲取該學生已報名的課程
    form.value = {
      student: studentId,
      course: '', // 先不設置課程，等課程列表載入後再設置
      leave_date: leave.leave_date || new Date().toISOString().split('T')[0],
      reason: leave.reason || '',
      approval_status: leave.approval_status || 'Pending'
    }
    
    // 如果是編輯模式，先獲取該學生已報名的課程，然後再設置課程
    if (studentId) {
      await fetchStudentEnrolledCourses(studentId)
      
      // 現在設置課程，確保課程列表已經載入
      // 嘗試匹配課程ID（支持字符串和數字類型）
      const matchedCourse = enrolledCourses.value.find(c => {
        const cid = c.course_id || c.id
        return cid === courseIdNum || cid === courseId || 
               parseInt(cid) === courseIdNum || parseInt(cid) === parseInt(courseId) ||
               cid === String(courseIdNum) || cid === String(courseId)
      })
      
      if (matchedCourse) {
        // 使用匹配到的課程的ID（確保類型一致）
        form.value.course = matchedCourse.course_id || matchedCourse.id
      } else if (courseIdNum || courseId) {
        // 如果沒有匹配到，但原始數據有課程ID，仍然設置（可能課程不在已報名列表中，但我們仍然要顯示）
        form.value.course = courseIdNum || courseId
      }
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

