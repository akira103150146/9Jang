<template>
  <div class="space-y-8">
    <section class="rounded-3xl border border-blue-100 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 p-6 shadow-sm">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-widest text-sky-500">今日概況</p>
          <h2 class="mt-2 text-2xl font-bold text-slate-900">補習班營運儀表板</h2>
          <p class="mt-1 text-slate-600">快速掌握學生、課程與費用狀態</p>
        </div>
        <div class="flex flex-wrap gap-3">
          <router-link
            to="/students"
            class="rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur hover:bg-white"
          >
            報名記錄 {{ totalEnrollments }} 筆
          </router-link>
          <router-link
            to="/students"
            class="rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur hover:bg-white"
          >
            未付費用 {{ totalPendingFeesCount }} 筆
          </router-link>
        </div>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <router-link
        v-for="metric in metrics"
        :key="metric.label"
        :to="metric.link"
        class="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
      >
        <p class="text-sm font-semibold text-slate-500">{{ metric.label }}</p>
        <div class="mt-2 flex items-baseline gap-2">
          <p class="text-3xl font-bold text-slate-900">{{ metric.value }}</p>
          <span v-if="metric.badge" class="text-xs font-semibold text-sky-500">{{ metric.badge }}</span>
        </div>
        <p class="mt-2 text-sm text-slate-500">{{ metric.desc }}</p>
      </router-link>
    </section>

    <section class="grid gap-6 lg:grid-cols-2">
      <div class="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="text-sm font-semibold text-slate-500">最新報名</p>
            <h3 class="text-xl font-semibold text-slate-900">課程報名記錄</h3>
          </div>
          <router-link
            to="/students"
            class="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-600 hover:bg-sky-100"
          >
            查看全部
          </router-link>
        </div>
        <div v-if="loadingEnrollments" class="text-center py-4 text-slate-500">載入中...</div>
        <ul v-else class="mt-6 space-y-4">
          <li
            v-for="enrollment in recentEnrollments"
            :key="enrollment.enrollment_id"
            class="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3 hover:bg-slate-50 transition"
          >
            <div>
              <p class="text-sm font-semibold text-slate-900">{{ enrollment.student_name }}</p>
              <p class="text-xs text-slate-500">{{ enrollment.course_name }}</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-slate-500">{{ formatDate(enrollment.enroll_date) }}</p>
              <p v-if="enrollment.discount_rate > 0" class="text-xs font-semibold text-emerald-600">
                折扣 {{ enrollment.discount_rate }}%
              </p>
            </div>
          </li>
          <li v-if="recentEnrollments.length === 0" class="py-4 text-center text-slate-500 text-sm">
            目前沒有報名記錄
          </li>
        </ul>
      </div>

      <div class="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="text-sm font-semibold text-slate-500">費用追蹤</p>
            <h3 class="text-xl font-semibold text-slate-900">待處理款項</h3>
          </div>
          <router-link
            to="/students"
            class="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100"
          >
            查看全部
          </router-link>
        </div>
        <div v-if="loadingFees" class="text-center py-4 text-slate-500">載入中...</div>
        <ul v-else class="mt-6 space-y-4">
          <router-link
            v-for="fee in pendingFeesList"
            :key="fee.fee_id"
            :to="getStudentFeePath(fee)"
            class="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3 hover:bg-slate-50 transition cursor-pointer block"
          >
            <div>
              <p class="text-sm font-semibold text-slate-500">{{ fee.student_name }}</p>
              <p class="text-base font-semibold text-slate-900">{{ getItemDisplay(fee.item) }} ・ $<span class="font-mono">{{ formatAmount(fee.amount) }}</span></p>
            </div>
            <span
              class="rounded-full px-3 py-1 text-xs font-semibold"
              :class="getPaymentStatusClass(fee.payment_status)"
            >
              {{ getPaymentStatusDisplay(fee.payment_status) }}
            </span>
          </router-link>
          <li v-if="pendingFeesList.length === 0" class="py-4 text-center text-slate-500 text-sm">
            目前沒有待處理款項
          </li>
        </ul>
      </div>
    </section>

    <section class="grid gap-6 lg:grid-cols-2">
      <div class="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="text-sm font-semibold text-slate-500">最新課程</p>
            <h3 class="text-xl font-semibold text-slate-900">進行中課程</h3>
          </div>
          <router-link
            to="/courses"
            class="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-600 hover:bg-sky-100"
          >
            查看全部
          </router-link>
        </div>
        <div v-if="loadingCourses" class="text-center py-4 text-slate-500">載入中...</div>
        <ul v-else class="mt-6 space-y-4">
          <li
            v-for="course in activeCourses"
            :key="course.course_id"
            class="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3 hover:bg-slate-50 transition"
          >
            <div>
              <p class="text-sm font-semibold text-slate-900">{{ course.course_name }}</p>
              <p class="text-xs text-slate-500">{{ getDayDisplay(course.day_of_week) }} {{ formatTime(course.start_time) }}-{{ formatTime(course.end_time) }}</p>
            </div>
            <span
              class="rounded-full px-3 py-1 text-xs font-semibold"
              :class="getCourseStatusClass(course.status)"
            >
              {{ getCourseStatusDisplay(course.status) }}
            </span>
          </li>
          <li v-if="activeCourses.length === 0" class="py-4 text-center text-slate-500 text-sm">
            目前沒有進行中的課程
          </li>
        </ul>
      </div>

      <div class="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="text-sm font-semibold text-slate-500">請假管理</p>
            <h3 class="text-xl font-semibold text-slate-900">待審核請假</h3>
          </div>
          <router-link
            to="/attendance"
            class="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600 hover:bg-amber-100"
          >
            查看全部
          </router-link>
        </div>
        <div v-if="loadingLeaves" class="text-center py-4 text-slate-500">載入中...</div>
        <ul v-else class="mt-6 space-y-4">
          <li
            v-for="leave in pendingLeaves"
            :key="leave.leave_id"
            class="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3 hover:bg-slate-50 transition"
          >
            <div>
              <p class="text-sm font-semibold text-slate-900">{{ leave.student_name }}</p>
              <p class="text-xs text-slate-500">{{ leave.course_name }} ・ {{ formatDate(leave.leave_date) }}</p>
              <p class="text-xs text-slate-600 mt-1">{{ leave.reason }}</p>
            </div>
            <span
              class="rounded-full px-3 py-1 text-xs font-semibold"
              :class="getLeaveStatusClass(leave.approval_status)"
            >
              {{ getLeaveStatusDisplay(leave.approval_status) }}
            </span>
          </li>
          <li v-if="pendingLeaves.length === 0" class="py-4 text-center text-slate-500 text-sm">
            目前沒有待審核的請假記錄
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { studentAPI, teacherAPI, courseAPI, enrollmentAPI, feeAPI, leaveAPI } from '../services/api'
import {
  mockStudents,
  mockTeachers,
  mockCourses,
  mockEnrollments,
  mockExtraFees,
  mockLeaveRequests,
} from '../data/mockData'

const students = ref([])
const teachers = ref([])
const courses = ref([])
const enrollments = ref([])
const fees = ref([])
const leaves = ref([])

const loadingEnrollments = ref(false)
const loadingFees = ref(false)
const loadingCourses = ref(false)
const loadingLeaves = ref(false)

const dayMap = {
  'Mon': '週一',
  'Tue': '週二',
  'Wed': '週三',
  'Thu': '週四',
  'Fri': '週五',
  'Sat': '週六',
  'Sun': '週日',
}

const itemMap = {
  'Tuition': '學費',
  'Transport': '交通費',
  'Meal': '餐費',
  'Book': '書籍費',
  'Other': '其他',
}

const statusMap = {
  'Pending': '待審核',
  'Approved': '已核准',
  'Rejected': '已拒絕',
}

const courseStatusMap = {
  'Active': '進行中',
  'Pending': '待開課',
  'Closed': '已結束',
}

const paymentStatusMap = {
  'Paid': '已繳費',
  'Unpaid': '未繳費',
  'Partial': '部分繳費',
}

const totalStudents = computed(() => students.value.length)
const totalTeachers = computed(() => teachers.value.length)
const totalCourses = computed(() => courses.value.length)
const totalEnrollments = computed(() => enrollments.value.length)

const activeCourses = computed(() => {
  return courses.value.filter(c => c.status === 'Active').slice(0, 5)
})

const recentEnrollments = computed(() => {
  return enrollments.value.slice(0, 5)
})

// 所有未繳費用（用於顯示列表）
const allPendingFees = computed(() => {
  if (!Array.isArray(fees.value)) return []
  return fees.value.filter(f => {
    // 過濾掉已繳費的，保留未繳和部分繳費的
    return f && f.payment_status && f.payment_status !== 'Paid'
  })
})

// 待處理款項列表（只顯示前5筆）
const pendingFeesList = computed(() => {
  return allPendingFees.value.slice(0, 5)
})

const pendingLeaves = computed(() => {
  return leaves.value.filter(l => l.approval_status === 'Pending').slice(0, 5)
})

// 計算所有未繳費用的總金額（與學生資訊頁面一致：從所有學生的 unpaid_fees 總和）
const pendingFeeAmount = computed(() => {
  if (!Array.isArray(students.value)) return 0
  return students.value.reduce((sum, student) => {
    const unpaidFees = parseFloat(student.unpaid_fees) || 0
    return sum + unpaidFees
  }, 0)
})

// 計算所有未繳費用的總筆數（與學生資訊頁面一致）
const totalPendingFeesCount = computed(() => {
  return allPendingFees.value.length
})

const metrics = computed(() => [
  {
    label: '在籍學生',
    value: totalStudents.value,
    badge: null,
    desc: '總學生人數',
    link: '/students',
  },
  {
    label: '授課老師',
    value: totalTeachers.value,
    badge: null,
    desc: '總老師人數',
    link: '/teachers',
  },
  {
    label: '進行中課程',
    value: activeCourses.value.length,
    badge: `${totalCourses.value} 總課程`,
    desc: '目前開設的課程',
    link: '/courses',
  },
  {
    label: '待收款項',
    value: `$${pendingFeeAmount.value.toLocaleString()}`,
    badge: `${totalPendingFeesCount.value} 筆`,
    desc: '未繳費用的總金額',
    link: '/students',
  },
])

const getDayDisplay = (day) => {
  return dayMap[day] || day
}

const formatTime = (time) => {
  if (!time) return ''
  return typeof time === 'string' ? time.substring(0, 5) : time
}

const formatDate = (date) => {
  if (!date) return ''
  return typeof date === 'string' ? date.replace(/-/g, '/') : date
}

const getItemDisplay = (item) => {
  return itemMap[item] || item
}

const formatAmount = (amount) => {
  // 格式化為整數，並加上千分位分隔符
  const intAmount = Math.round(parseFloat(amount || 0))
  return intAmount.toLocaleString('zh-TW', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

const getLeaveStatusDisplay = (status) => {
  return statusMap[status] || status
}

const getCourseStatusDisplay = (status) => {
  return courseStatusMap[status] || status
}

const getPaymentStatusDisplay = (status) => {
  return paymentStatusMap[status] || status
}

const getLeaveStatusClass = (status) => {
  const map = {
    'Approved': 'bg-emerald-50 text-emerald-600',
    'Pending': 'bg-amber-50 text-amber-600',
    'Rejected': 'bg-rose-50 text-rose-600',
  }
  return map[status] ?? 'bg-slate-100 text-slate-700'
}

const getCourseStatusClass = (status) => {
  const map = {
    'Active': 'bg-emerald-50 text-emerald-600',
    'Pending': 'bg-amber-50 text-amber-600',
    'Closed': 'bg-slate-100 text-slate-700',
  }
  return map[status] ?? 'bg-slate-100 text-slate-700'
}

const getPaymentStatusClass = (status) => {
  const map = {
    'Paid': 'bg-emerald-50 text-emerald-600',
    'Partial': 'bg-amber-50 text-amber-600',
    'Unpaid': 'bg-rose-50 text-rose-600',
  }
  return map[status] ?? 'bg-slate-100 text-slate-700'
}

const getStudentFeePath = (fee) => {
  // 獲取學生ID，支持多種可能的欄位名稱
  const studentId = fee.student || fee.student_id || (fee.student && typeof fee.student === 'object' ? fee.student.student_id || fee.student.id : null)
  if (studentId) {
    return `/students/${studentId}/fees`
  }
  // 如果找不到學生ID，返回學生列表頁面
  return '/students'
}

const fetchStudents = async () => {
  try {
    const response = await studentAPI.getAll()
    const data = response.data.results || response.data
    students.value = data
  } catch (error) {
    console.warn('獲取學生資料失敗，使用 mock 資料：', error)
    students.value = mockStudents
  }
}

const fetchTeachers = async () => {
  try {
    const response = await teacherAPI.getAll()
    const data = response.data.results || response.data
    teachers.value = data
  } catch (error) {
    console.warn('獲取老師資料失敗，使用 mock 資料：', error)
    teachers.value = mockTeachers
  }
}

const fetchCourses = async () => {
  loadingCourses.value = true
  try {
    const response = await courseAPI.getAll()
    const data = response.data.results || response.data
    courses.value = data
  } catch (error) {
    console.warn('獲取課程資料失敗，使用 mock 資料：', error)
    courses.value = mockCourses
  } finally {
    loadingCourses.value = false
  }
}

const fetchEnrollments = async () => {
  loadingEnrollments.value = true
  try {
    const response = await enrollmentAPI.getAll()
    const data = response.data.results || response.data
    enrollments.value = data
  } catch (error) {
    console.warn('獲取報名記錄失敗，使用 mock 資料：', error)
    enrollments.value = mockEnrollments
  } finally {
    loadingEnrollments.value = false
  }
}

const fetchFees = async () => {
  loadingFees.value = true
  try {
    const response = await feeAPI.getAll()
    const data = response.data.results || response.data
    // 確保數據是數組格式
    fees.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.warn('獲取費用記錄失敗，使用 mock 資料：', error)
    fees.value = Array.isArray(mockExtraFees) ? mockExtraFees : []
  } finally {
    loadingFees.value = false
  }
}

const fetchLeaves = async () => {
  loadingLeaves.value = true
  try {
    const response = await leaveAPI.getAll()
    const data = response.data.results || response.data
    leaves.value = data
  } catch (error) {
    console.warn('獲取請假記錄失敗，使用 mock 資料：', error)
    leaves.value = mockLeaveRequests
  } finally {
    loadingLeaves.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    fetchStudents(),
    fetchTeachers(),
    fetchCourses(),
    fetchEnrollments(),
    fetchFees(),
    fetchLeaves(),
  ])
})
</script>

