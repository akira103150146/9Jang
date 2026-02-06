<template>
  <div class="space-y-6">
    <header class="rounded-3xl border border-blue-100 bg-gradient-to-r from-white via-sky-50 to-indigo-50 p-6 shadow-sm">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-semibold text-slate-500">學生功能</p>
          <h2 class="text-2xl font-bold text-slate-900">我的課程</h2>
          <p class="mt-2 text-sm text-slate-500">查看自己已報名的課程</p>
        </div>
      </div>
    </header>

    <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div v-if="loading" class="text-center py-8 text-slate-500">載入中...</div>
      <div v-else-if="courses.length === 0" class="text-center py-8 text-slate-500">
        目前沒有已報名的課程
      </div>
      <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="course in courses"
          :key="course.course_id"
          class="p-5 border border-slate-100 rounded-2xl hover:bg-slate-50 transition group"
        >
          <div class="flex justify-between items-start mb-2">
            <div class="font-bold text-slate-900 group-hover:text-blue-600 transition">
              {{ course.course_name }}
            </div>
            <span class="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
              {{ getDayDisplay(course.day_of_week) }}
            </span>
          </div>

          <div class="text-sm text-slate-500 mb-3 flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            {{ course.teacher_name }} 老師
          </div>

          <div class="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-3">
            <span>{{ formatTime(course.start_time) }} - {{ formatTime(course.end_time) }}</span>
            <span :class="course.status === 'Active' ? 'text-emerald-500' : 'text-slate-400'">
              {{ getCourseStatusDisplay(course.status) }}
            </span>
          </div>

          <button
            @click="openCourseModal(course)"
            class="mt-3 w-full bg-indigo-50 text-indigo-600 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 transition"
          >
            查看課程內容
          </button>
        </div>
      </div>
    </section>

    <StudentCourseDetailModal
      v-if="selectedCourse"
      :is-open="isModalOpen"
      :course="selectedCourse"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import StudentCourseDetailModal from '../components/StudentCourseDetailModal.vue'
import { courseAPI } from '../services/api'

const courses = ref([])
const loading = ref(false)
const isModalOpen = ref(false)
const selectedCourse = ref(null)

const dayMap = {
  Mon: '週一',
  Tue: '週二',
  Wed: '週三',
  Thu: '週四',
  Fri: '週五',
  Sat: '週六',
  Sun: '週日',
}

const courseStatusMap = {
  Active: '進行中',
  Pending: '待開課',
  Closed: '已結束',
}

const getDayDisplay = (day) => dayMap[day] || day
const getCourseStatusDisplay = (status) => courseStatusMap[status] || status

const formatTime = (time) => {
  if (!time) return ''
  return typeof time === 'string' ? time.substring(0, 5) : time
}

const openCourseModal = (course) => {
  selectedCourse.value = course
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedCourse.value = null
}

const fetchMyCourses = async () => {
  loading.value = true
  try {
    // 後端 Course API 已對 STUDENT 做過濾：只回自己報名的課程
    const res = await courseAPI.getAll()
    const data = res.data.results || res.data
    courses.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('載入我的課程失敗：', e)
    courses.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchMyCourses()
})
</script>

