<template>
  <div class="space-y-6">
    <header class="rounded-3xl border border-blue-100 bg-gradient-to-r from-white via-blue-50 to-sky-50 p-6 shadow-sm">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-semibold text-slate-500">課程模組</p>
          <h2 class="text-2xl font-bold text-slate-900">課程與時段管理</h2>
          <p class="mt-2 text-sm text-slate-500">掌握每堂課的授課老師、費用與狀態</p>
        </div>
        <router-link
          v-if="isAdmin"
          to="/courses/add"
          class="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-md hover:from-sky-600 hover:to-indigo-600"
        >
          新增課程
        </router-link>
      </div>
      <p v-if="usingMock" class="mt-3 text-sm text-amber-600">
        目前顯示示意資料（mock data），待後端欄位完善後即可串接。
      </p>
    </header>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <p class="text-slate-500">載入中...</p>
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="course in courses"
        :key="course.course_id"
        class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">Course #{{ course.course_id }}</p>
            <h3 class="mt-1 text-lg font-semibold text-slate-900">{{ course.course_name }}</h3>
          </div>
          <span
            class="rounded-full px-3 py-1 text-xs font-semibold"
            :class="getStatusClass(course.status)"
          >
            {{ course.status }}
          </span>
        </div>

        <dl class="mt-4 space-y-2 text-sm text-slate-600">
          <div class="flex justify-between">
            <dt class="font-medium text-slate-500">授課老師</dt>
            <dd>{{ course.teacher_name || '未指派' }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="font-medium text-slate-500">上課時間</dt>
            <dd>{{ getDayDisplay(course.day_of_week) }} ・ {{ formatTime(course.start_time) }} - {{ formatTime(course.end_time) }}</dd>
          </div>
          <div v-if="!isAdmin" class="flex justify-between">
            <dt class="font-medium text-slate-500">每堂費用</dt>
            <dd class="font-semibold text-slate-900">${{ course.fee_per_session }}</dd>
          </div>
          <div v-if="canSeeAccountingFeatures && course.enrollments_count !== null && course.enrollments_count !== undefined" class="flex justify-between">
            <dt class="font-medium text-slate-500">報名學生</dt>
            <dd class="font-semibold text-indigo-600">{{ course.enrollments_count }} 人</dd>
          </div>
          <!-- 學生狀態統計（僅老師和管理員可見） -->
          <div v-if="course.student_status" class="mt-3 pt-3 border-t border-slate-200">
            <div class="flex justify-between items-center mb-2">
              <dt class="font-medium text-slate-500">學生狀態</dt>
              <dd class="text-xs text-slate-400">總計 {{ course.student_status.total_students }} 人</dd>
            </div>
            <div class="grid grid-cols-3 gap-2 text-xs">
              <div class="text-center">
                <div class="font-semibold text-emerald-600">{{ course.student_status.present_count }}</div>
                <div class="text-slate-500">出席</div>
              </div>
              <div class="text-center">
                <div class="font-semibold text-amber-600">{{ course.student_status.leave_count }}</div>
                <div class="text-slate-500">請假</div>
              </div>
              <div class="text-center">
                <div class="font-semibold text-slate-400">{{ course.student_status.inactive_count }}</div>
                <div class="text-slate-500">暫停</div>
              </div>
            </div>
          </div>
        </dl>

        <div class="mt-4 flex gap-2">
          <button
            v-if="isTeacher"
            @click="openCourseDetail(course)"
            class="flex-1 rounded-full bg-indigo-500 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-600 text-center"
          >
            查看課程內容
          </button>
          <template v-if="isAdmin">
            <button
              @click="openCourseDetail(course)"
              class="flex-1 rounded-full bg-indigo-500 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-600 text-center"
            >
              查看文件
            </button>
            <router-link
              :to="`/courses/edit/${course.course_id || course.id}`"
              class="flex-1 rounded-full bg-sky-500 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-600 text-center"
            >
              編輯
            </router-link>
            <!-- 註解：刪除功能已禁用，避免誤刪導致資料庫錯誤 -->
            <!-- 唯一刪除方式是透過 flush_db 指令 -->
            <!-- <button
              @click="deleteCourse(course.course_id || course.id, course.course_name)"
              class="flex-1 rounded-full bg-rose-500 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-600"
            >
              刪除
            </button> -->
          </template>
        </div>
      </article>
    </div>

    <div v-if="!loading && courses.length === 0" class="text-center py-12">
      <p class="text-slate-500">目前沒有課程資料。</p>
    </div>

    <!-- Course Detail Modal for Teachers -->
    <!-- 使用 v-show 而不是 v-if，避免組件被銷毀 -->
    <CourseDetailModal
      v-if="selectedCourse"
      :is-open="isCourseModalOpen && !!selectedCourse"
      :course="selectedCourse || {}"
      :is-teacher="!isAdmin"
      @close="closeCourseModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, type Ref } from 'vue'
import { courseAPI } from '../services/api'
import { mockCourses } from '../data/mockData'
import CourseDetailModal from '../components/CourseDetailModal.vue'

/**
 * 用戶類型
 */
interface User {
  role?: 'ADMIN' | 'TEACHER' | 'ACCOUNTANT' | 'STUDENT'
  [key: string]: unknown
}

/**
 * 課程類型
 */
interface Course {
  course_id: number
  course_name: string
  teacher?: unknown
  teacher_name?: string
  start_time: string
  end_time: string
  day_of_week: string
  fee_per_session: number
  status: 'Active' | 'Pending' | 'Closed'
  student_status?: {
    total_students: number
    present_count: number
    leave_count: number
    inactive_count: number
  } | null
  enrollments_count?: number | null
  id?: number
  [key: string]: unknown
}

const courses: Ref<Course[]> = ref([])
const loading: Ref<boolean> = ref(false)
const usingMock: Ref<boolean> = ref(false)
const currentUser: Ref<User | null> = ref(null)
const isCourseModalOpen: Ref<boolean> = ref(false)
const selectedCourse: Ref<Course | null> = ref(null)

// 檢查是否為管理員
const isAdmin = computed<boolean>(() => {
  return currentUser.value?.role === 'ADMIN'
})

// 檢查是否為老師
const isTeacher = computed<boolean>(() => {
  return currentUser.value?.role === 'TEACHER'
})

// 檢查是否可以看到會計相關功能
const canSeeAccountingFeatures = computed<boolean>(() => {
  return currentUser.value?.role === 'ACCOUNTANT' || currentUser.value?.role === 'ADMIN'
})

// 獲取當前用戶信息
const fetchCurrentUser = async (): Promise<void> => {
  try {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      currentUser.value = JSON.parse(userStr) as User
    }
  } catch (error) {
    console.error('獲取用戶信息失敗:', error)
  }
}

const dayMap: Record<string, string> = {
  Mon: '週一',
  Tue: '週二',
  Wed: '週三',
  Thu: '週四',
  Fri: '週五',
  Sat: '週六',
  Sun: '週日'
}

const normalizeCourse = (course: unknown): Course => {
  const c = course as Course & { id?: number; teacher?: { name?: string } }
  return {
    course_id: c.course_id || c.id || 0,
    course_name: c.course_name || '',
    teacher: c.teacher,
    teacher_name: c.teacher_name || (c.teacher && typeof c.teacher === 'object' ? c.teacher.name : undefined) || '',
    start_time: c.start_time || '',
    end_time: c.end_time || '',
    day_of_week: c.day_of_week || '',
    fee_per_session: c.fee_per_session || 0,
    status: (c.status as 'Active' | 'Pending' | 'Closed') || 'Active',
    student_status: c.student_status || null,
    enrollments_count: c.enrollments_count || null,
    ...c
  }
}

const getDayDisplay = (day: string): string => {
  return dayMap[day] || day
}

const formatTime = (time: string | unknown): string => {
  if (!time) return ''
  // 如果是 HH:MM:SS 格式，只取前5個字符
  return typeof time === 'string' ? time.substring(0, 5) : String(time)
}

const getStatusClass = (status: string): string => {
  const statusMap: Record<string, string> = {
    Active: 'bg-emerald-50 text-emerald-600',
    Pending: 'bg-amber-50 text-amber-600',
    Closed: 'bg-slate-100 text-slate-600'
  }
  return statusMap[status] || 'bg-slate-100 text-slate-600'
}

const fetchCourses = async (): Promise<void> => {
  loading.value = true
  try {
    const response = await courseAPI.getAll()
    const data = ((response.data as { results?: unknown[] }) | unknown[]).results || (response.data as unknown[])
    const normalizedCourses = (data as unknown[]).map((item) => normalizeCourse(item))

    // 如果是老師或管理員，獲取每個課程的學生狀態統計
    if (currentUser.value && (currentUser.value.role === 'TEACHER' || currentUser.value.role === 'ADMIN')) {
      const statusPromises = normalizedCourses.map(async (course) => {
        try {
          const statusRes = await courseAPI.getStudentStatus(course.course_id)
          course.student_status = statusRes.data as Course['student_status']
        } catch (error) {
          console.warn(`獲取課程 ${course.course_id} 的學生狀態失敗:`, error)
          course.student_status = null
        }
        return course
      })
      courses.value = await Promise.all(statusPromises)
    } else {
      courses.value = normalizedCourses
    }

    usingMock.value = false
  } catch (error) {
    console.warn('獲取課程資料失敗，使用 mock 資料：', error)
    courses.value = (mockCourses as unknown[]).map((item) => normalizeCourse(item))
    usingMock.value = true
  } finally {
    loading.value = false
  }
}

const deleteCourse = async (id: number, name: string): Promise<void> => {
  if (!id) {
    alert('示意資料無法刪除，請於 API 可用後再操作。')
    return
  }

  if (!confirm(`確定要刪除課程「${name}」嗎？`)) {
    return
  }

  try {
    await courseAPI.delete(id)
    alert('刪除成功')
    fetchCourses()
  } catch (error) {
    console.error('刪除失敗:', error)
    alert('刪除失敗，請稍後再試')
  }
}

const openCourseDetail = (course: Course): void => {
  selectedCourse.value = course
  isCourseModalOpen.value = true
}

const closeCourseModal = (): void => {
  isCourseModalOpen.value = false
  // 不要將 selectedCourse 設為 null，讓組件保持存在以便 watcher 正常工作
  // selectedCourse.value = null
}

onMounted(() => {
  fetchCurrentUser()
  fetchCourses()
})
</script>

