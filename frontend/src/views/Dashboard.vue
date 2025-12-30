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

<script setup lang="ts">
import { ref, onMounted, computed, type Ref } from 'vue'
import { studentAPI, teacherAPI, courseAPI, enrollmentAPI, feeAPI, leaveAPI } from '../services/api'
import {
  mockStudents,
  mockTeachers,
  mockCourses,
  mockEnrollments,
  mockExtraFees,
  mockLeaveRequests
} from '../data/mockData'

/**
 * 數據類型定義
 */
interface Student {
  student_id: number
  unpaid_fees?: number | string
  [key: string]: unknown
}

interface Teacher {
  teacher_id: number
  [key: string]: unknown
}

interface Course {
  course_id: number
  course_name: string
  status: 'Active' | 'Pending' | 'Closed'
  day_of_week: string
  start_time: string
  end_time: string
  [key: string]: unknown
}

interface Enrollment {
  enrollment_id: number
  student_name: string
  course_name: string
  enroll_date: string
  discount_rate?: number
  [key: string]: unknown
}

interface Fee {
  fee_id: number
  student_name: string
  item: string
  amount: number | string
  payment_status: 'Paid' | 'Unpaid' | 'Partial'
  student?: number
  student_id?: number
  [key: string]: unknown
}

interface Leave {
  leave_id: number
  student_name: string
  course_name: string
  leave_date: string
  reason: string
  approval_status: 'Pending' | 'Approved' | 'Rejected'
  [key: string]: unknown
}

const students: Ref<Student[]> = ref([])
const teachers: Ref<Teacher[]> = ref([])
const courses: Ref<Course[]> = ref([])
const enrollments: Ref<Enrollment[]> = ref([])
const fees: Ref<Fee[]> = ref([])
const leaves: Ref<Leave[]> = ref([])

const loadingEnrollments: Ref<boolean> = ref(false)
const loadingFees: Ref<boolean> = ref(false)
const loadingCourses: Ref<boolean> = ref(false)
const loadingLeaves: Ref<boolean> = ref(false)

const dayMap: Record<string, string> = {
  Mon: '週一',
  Tue: '週二',
  Wed: '週三',
  Thu: '週四',
  Fri: '週五',
  Sat: '週六',
  Sun: '週日'
}

const itemMap: Record<string, string> = {
  Tuition: '學費',
  Transport: '交通費',
  Meal: '餐費',
  Book: '書籍費',
  Other: '其他'
}

const statusMap: Record<string, string> = {
  Pending: '待審核',
  Approved: '已核准',
  Rejected: '已拒絕'
}

const courseStatusMap: Record<string, string> = {
  Active: '進行中',
  Pending: '待開課',
  Closed: '已結束'
}

const paymentStatusMap: Record<string, string> = {
  Paid: '已繳費',
  Unpaid: '未繳費',
  Partial: '部分繳費'
}

const totalStudents = computed<number>(() => students.value.length)
const totalTeachers = computed<number>(() => teachers.value.length)
const totalCourses = computed<number>(() => courses.value.length)
const totalEnrollments = computed<number>(() => enrollments.value.length)

const activeCourses = computed<Course[]>(() => {
  return courses.value.filter((c) => c.status === 'Active').slice(0, 5)
})

const recentEnrollments = computed<Enrollment[]>(() => {
  return enrollments.value.slice(0, 5)
})

// 所有未繳費用（用於顯示列表）
const allPendingFees = computed<Fee[]>(() => {
  if (!Array.isArray(fees.value)) return []
  return fees.value.filter((f) => {
    // 過濾掉已繳費的，保留未繳和部分繳費的
    return f && f.payment_status && f.payment_status !== 'Paid'
  })
})

// 待處理款項列表（只顯示前5筆）
const pendingFeesList = computed<Fee[]>(() => {
  return allPendingFees.value.slice(0, 5)
})

const pendingLeaves = computed<Leave[]>(() => {
  return leaves.value.filter((l) => l.approval_status === 'Pending').slice(0, 5)
})

// 計算所有未繳費用的總金額（與學生資訊頁面一致：從所有學生的 unpaid_fees 總和）
const pendingFeeAmount = computed<number>(() => {
  if (!Array.isArray(students.value)) return 0
  return students.value.reduce((sum, student) => {
    const unpaidFees = parseFloat(String(student.unpaid_fees || 0)) || 0
    return sum + unpaidFees
  }, 0)
})

// 計算所有未繳費用的總筆數（與學生資訊頁面一致）
const totalPendingFeesCount = computed<number>(() => {
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

const getDayDisplay = (day: string): string => {
  return dayMap[day] || day
}

const formatTime = (time: string | unknown): string => {
  if (!time) return ''
  return typeof time === 'string' ? time.substring(0, 5) : String(time)
}

const formatDate = (date: string | unknown): string => {
  if (!date) return ''
  return typeof date === 'string' ? date.replace(/-/g, '/') : String(date)
}

const getItemDisplay = (item: string): string => {
  return itemMap[item] || item
}

const formatAmount = (amount: number | string | unknown): string => {
  // 格式化為整數，並加上千分位分隔符
  const intAmount = Math.round(parseFloat(String(amount || 0)))
  return intAmount.toLocaleString('zh-TW', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

const getLeaveStatusDisplay = (status: string): string => {
  return statusMap[status] || status
}

const getCourseStatusDisplay = (status: string): string => {
  return courseStatusMap[status] || status
}

const getPaymentStatusDisplay = (status: string): string => {
  return paymentStatusMap[status] || status
}

const getLeaveStatusClass = (status: string): string => {
  const map: Record<string, string> = {
    Approved: 'bg-emerald-50 text-emerald-600',
    Pending: 'bg-amber-50 text-amber-600',
    Rejected: 'bg-rose-50 text-rose-600'
  }
  return map[status] ?? 'bg-slate-100 text-slate-700'
}

const getCourseStatusClass = (status: string): string => {
  const map: Record<string, string> = {
    Active: 'bg-emerald-50 text-emerald-600',
    Pending: 'bg-amber-50 text-amber-600',
    Closed: 'bg-slate-100 text-slate-700'
  }
  return map[status] ?? 'bg-slate-100 text-slate-700'
}

const getPaymentStatusClass = (status: string): string => {
  const map: Record<string, string> = {
    Paid: 'bg-emerald-50 text-emerald-600',
    Partial: 'bg-amber-50 text-amber-600',
    Unpaid: 'bg-rose-50 text-rose-600'
  }
  return map[status] ?? 'bg-slate-100 text-slate-700'
}

const getStudentFeePath = (fee: Fee): string => {
  // 獲取學生ID，支持多種可能的欄位名稱
  const studentId =
    fee.student ||
    fee.student_id ||
    (fee.student && typeof fee.student === 'object'
      ? ((fee.student as { student_id?: number; id?: number }).student_id ||
        (fee.student as { id?: number }).id)
      : null)
  if (studentId) {
    return `/students/${studentId}/fees`
  }
  // 如果找不到學生ID，返回學生列表頁面
  return '/students'
}

const fetchStudents = async (): Promise<void> => {
  try {
    const response = await studentAPI.getAll()
    const data = (response.data as { results?: Student[] } | Student[]).results || (response.data as Student[])
    students.value = data as Student[]
  } catch (error) {
    console.warn('獲取學生資料失敗，使用 mock 資料：', error)
    students.value = mockStudents as Student[]
  }
}

const fetchTeachers = async (): Promise<void> => {
  try {
    const response = await teacherAPI.getAll()
    const data = (response.data as { results?: Teacher[] } | Teacher[]).results || (response.data as Teacher[])
    teachers.value = data as Teacher[]
  } catch (error) {
    console.warn('獲取老師資料失敗，使用 mock 資料：', error)
    teachers.value = mockTeachers as Teacher[]
  }
}

const fetchCourses = async (): Promise<void> => {
  loadingCourses.value = true
  try {
    const response = await courseAPI.getAll()
    const data = (response.data as { results?: Course[] } | Course[]).results || (response.data as Course[])
    courses.value = data as Course[]
  } catch (error) {
    console.warn('獲取課程資料失敗，使用 mock 資料：', error)
    courses.value = mockCourses as Course[]
  } finally {
    loadingCourses.value = false
  }
}

const fetchEnrollments = async (): Promise<void> => {
  loadingEnrollments.value = true
  try {
    const response = await enrollmentAPI.getAll()
    const data = (response.data as { results?: Enrollment[] } | Enrollment[]).results || (response.data as Enrollment[])
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

