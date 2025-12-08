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
          <div class="flex justify-between">
            <dt class="font-medium text-slate-500">每堂費用</dt>
            <dd class="font-semibold text-slate-900">${{ course.fee_per_session }}</dd>
          </div>
        </dl>

        <div class="mt-4 flex gap-2">
          <router-link
            :to="`/courses/edit/${course.course_id || course.id}`"
            class="flex-1 rounded-full bg-sky-500 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-600 text-center"
          >
            編輯
          </router-link>
          <button
            @click="deleteCourse(course.course_id || course.id, course.course_name)"
            class="flex-1 rounded-full bg-rose-500 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-600"
          >
            刪除
          </button>
        </div>
      </article>
    </div>

    <div v-if="!loading && courses.length === 0" class="text-center py-12">
      <p class="text-slate-500">目前沒有課程資料。</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { courseAPI } from '../services/api'
import { mockCourses } from '../data/mockData'

const courses = ref([])
const loading = ref(false)
const usingMock = ref(false)

const dayMap = {
  'Mon': '週一',
  'Tue': '週二',
  'Wed': '週三',
  'Thu': '週四',
  'Fri': '週五',
  'Sat': '週六',
  'Sun': '週日',
}

const normalizeCourse = (course) => ({
  course_id: course.course_id || course.id,
  course_name: course.course_name,
  teacher: course.teacher,
  teacher_name: course.teacher_name || course.teacher?.name || '',
  start_time: course.start_time,
  end_time: course.end_time,
  day_of_week: course.day_of_week,
  fee_per_session: course.fee_per_session,
  status: course.status || 'Active',
})

const getDayDisplay = (day) => {
  return dayMap[day] || day
}

const formatTime = (time) => {
  if (!time) return ''
  // 如果是 HH:MM:SS 格式，只取前5個字符
  return typeof time === 'string' ? time.substring(0, 5) : time
}

const getStatusClass = (status) => {
  const statusMap = {
    'Active': 'bg-emerald-50 text-emerald-600',
    'Pending': 'bg-amber-50 text-amber-600',
    'Closed': 'bg-slate-100 text-slate-600',
  }
  return statusMap[status] || 'bg-slate-100 text-slate-600'
}

const fetchCourses = async () => {
  loading.value = true
  try {
    const response = await courseAPI.getAll()
    const data = response.data.results || response.data
    courses.value = data.map((item) => normalizeCourse(item))
    usingMock.value = false
  } catch (error) {
    console.warn('獲取課程資料失敗，使用 mock 資料：', error)
    courses.value = mockCourses.map((item) => normalizeCourse(item))
    usingMock.value = true
  } finally {
    loading.value = false
  }
}

const deleteCourse = async (id, name) => {
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

onMounted(() => {
  fetchCourses()
})
</script>

