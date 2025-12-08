<template>
  <div class="space-y-6">
    <header class="rounded-3xl border border-blue-100 bg-gradient-to-r from-white to-indigo-50 p-6 shadow-sm">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-semibold text-slate-500">報名紀錄</p>
          <h2 class="text-2xl font-bold text-slate-900">學生課程報名</h2>
          <p class="mt-2 text-sm text-slate-500">顯示每位學生參與的課程與折扣資訊</p>
        </div>
        <router-link
          to="/enrollments/add"
          class="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-md hover:from-sky-600 hover:to-indigo-600"
        >
          新增報名記錄
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
        v-for="record in enrollments"
        :key="record.enrollment_id"
        class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">Enrollment #{{ record.enrollment_id }}</p>
            <h3 class="mt-1 text-lg font-semibold text-slate-900">{{ record.student_name }}</h3>
          </div>
          <span class="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-600">
            {{ formatDate(record.enroll_date) }}
          </span>
        </div>
        <p class="mt-3 text-sm font-semibold text-slate-600">{{ record.course_name }}</p>
        <p class="text-sm text-slate-500">折扣：{{ record.discount_rate }}%</p>
        
        <div class="mt-4 flex gap-2">
          <router-link
            :to="`/enrollments/edit/${record.enrollment_id || record.id}`"
            class="flex-1 rounded-full bg-sky-500 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-600 text-center"
          >
            編輯
          </router-link>
          <button
            @click="deleteEnrollment(record.enrollment_id || record.id, record.student_name, record.course_name)"
            class="flex-1 rounded-full bg-rose-500 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-600"
          >
            刪除
          </button>
        </div>
      </article>
    </div>

    <div v-if="!loading && enrollments.length === 0" class="text-center py-12">
      <p class="text-slate-500">目前沒有報名記錄。</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { enrollmentAPI } from '../services/api'
import { mockEnrollments } from '../data/mockData'

const enrollments = ref([])
const loading = ref(false)
const usingMock = ref(false)

const normalizeEnrollment = (enrollment) => ({
  enrollment_id: enrollment.enrollment_id || enrollment.id,
  student: enrollment.student,
  student_name: enrollment.student_name || enrollment.student?.name || '',
  course: enrollment.course,
  course_name: enrollment.course_name || enrollment.course?.course_name || '',
  enroll_date: enrollment.enroll_date,
  discount_rate: enrollment.discount_rate || 0,
})

const formatDate = (date) => {
  if (!date) return ''
  // 如果是 YYYY-MM-DD 格式，轉換為 YYYY/MM/DD
  return typeof date === 'string' ? date.replace(/-/g, '/') : date
}

const fetchEnrollments = async () => {
  loading.value = true
  try {
    const response = await enrollmentAPI.getAll()
    const data = response.data.results || response.data
    enrollments.value = data.map((item) => normalizeEnrollment(item))
    usingMock.value = false
  } catch (error) {
    console.warn('獲取報名記錄失敗，使用 mock 資料：', error)
    enrollments.value = mockEnrollments.map((item) => normalizeEnrollment(item))
    usingMock.value = true
  } finally {
    loading.value = false
  }
}

const deleteEnrollment = async (id, studentName, courseName) => {
  if (!id) {
    alert('示意資料無法刪除，請於 API 可用後再操作。')
    return
  }

  if (!confirm(`確定要刪除「${studentName}」報名「${courseName}」的記錄嗎？`)) {
    return
  }

  try {
    await enrollmentAPI.delete(id)
    alert('刪除成功')
    fetchEnrollments()
  } catch (error) {
    console.error('刪除失敗:', error)
    alert('刪除失敗，請稍後再試')
  }
}

onMounted(() => {
  fetchEnrollments()
})
</script>

