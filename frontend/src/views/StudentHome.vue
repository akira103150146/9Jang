<template>
  <div class="space-y-6">
    <header class="rounded-3xl border border-blue-100 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 p-6 shadow-sm">
      <h2 class="text-2xl font-bold text-slate-900">歡迎回來，{{ studentName }}</h2>
      <p class="mt-1 text-slate-600">這是您的個人學習首頁</p>
    </header>

    <!-- 統計與通知 -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <!-- 待繳費用 -->
      <div class="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm flex flex-col justify-between">
        <div>
          <h3 class="font-bold text-lg text-slate-900 mb-2">待繳費用</h3>
          <div class="text-3xl font-bold text-rose-600">${{ unpaidAmount.toLocaleString() }}</div>
          <p class="text-sm text-slate-500 mt-1">共有 {{ unpaidCount }} 筆未繳項目</p>
        </div>
        <router-link 
          v-if="studentId" 
          :to="`/students/${studentId}/fees`" 
          class="text-sm font-semibold text-rose-500 mt-4 flex items-center hover:text-rose-600"
        >
          查看詳情 <span class="ml-1 text-lg">&rarr;</span>
        </router-link>
      </div>

      <!-- 進行中團購 -->
      <div class="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm flex flex-col">
        <h3 class="font-bold text-lg text-slate-900 mb-3">進行中團購</h3>
        <div v-if="loadingOrders" class="text-slate-500 text-sm">載入中...</div>
        <div v-else-if="activeGroupOrders.length === 0" class="text-slate-500 text-sm flex-1 flex items-center">
          目前沒有進行中的團購
        </div>
        <ul v-else class="space-y-3 flex-1 overflow-y-auto max-h-40">
          <li v-for="order in activeGroupOrders" :key="order.group_order_id" class="border-b border-slate-100 pb-2 last:border-0 last:pb-0">
            <div class="flex justify-between items-start">
              <div>
                <div class="font-semibold text-slate-900 text-sm">{{ order.title }}</div>
                <div class="text-xs text-slate-500 mt-0.5">截止: {{ formatDateTime(order.deadline) }}</div>
              </div>
              <router-link 
                :to="`/lunch-orders/join/${order.order_link}`" 
                class="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full font-semibold hover:bg-emerald-100"
              >
                訂購
              </router-link>
            </div>
          </li>
        </ul>
        <router-link to="/lunch-orders" class="text-sm font-semibold text-emerald-500 mt-4 flex items-center hover:text-emerald-600">
          查看所有團購 <span class="ml-1 text-lg">&rarr;</span>
        </router-link>
      </div>

      <!-- 老師留言 -->
      <div class="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm flex flex-col">
        <h3 class="font-bold text-lg text-slate-900 mb-3">老師留言</h3>
        <div class="flex-1 bg-amber-50/50 rounded-xl p-4">
          <p class="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">{{ studentNotes || '目前沒有新的留言' }}</p>
        </div>
      </div>
    </div>

    <!-- 學習曲線 -->
    <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div class="flex items-center justify-between mb-6">
        <h3 class="font-bold text-lg text-slate-900">學習成績曲線</h3>
        <div class="flex gap-2">
            <span class="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">測驗成績</span>
            <span class="text-xs px-2 py-1 rounded-full bg-rose-50 text-rose-600 font-medium">錯題數</span>
        </div>
      </div>
      <div class="h-64 w-full">
        <Line v-if="chartData" :data="chartData" :options="chartOptions" />
        <div v-else class="h-full flex items-center justify-center text-slate-400">
            載入圖表數據中...
        </div>
      </div>
    </section>

    <!-- 我的課程 -->
    <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <h3 class="font-bold text-lg text-slate-900 mb-4">我的課程</h3>
      <div v-if="loadingCourses" class="text-center py-8 text-slate-500">載入中...</div>
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
             <div class="font-bold text-slate-900 group-hover:text-blue-600 transition">{{ course.course_name }}</div>
             <span class="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">{{ getDayDisplay(course.day_of_week) }}</span>
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
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'vue-chartjs'
import { studentAPI, feeAPI, groupOrderAPI, enrollmentAPI, authAPI, courseAPI } from '../services/api'

// 註冊 Chart.js 元件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const studentId = ref(null)
const studentName = ref('')
const studentNotes = ref('')
const unpaidAmount = ref(0)
const unpaidCount = ref(0)
const activeGroupOrders = ref([])
const courses = ref([])
const loadingOrders = ref(false)
const loadingCourses = ref(false)

// 模擬圖表數據 (之後可替換為真實數據)
const chartData = ref({
  labels: ['第一週', '第二週', '第三週', '第四週', '第五週'],
  datasets: [
    {
      label: '測驗平均分',
      backgroundColor: '#3b82f6',
      borderColor: '#3b82f6',
      data: [75, 82, 78, 85, 88],
      tension: 0.3
    },
    {
      label: '錯題數',
      backgroundColor: '#f43f5e',
      borderColor: '#f43f5e',
      data: [12, 8, 10, 5, 3],
      tension: 0.3
    }
  ]
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
}

const dayMap = {
  'Mon': '週一', 'Tue': '週二', 'Wed': '週三', 'Thu': '週四', 'Fri': '週五', 'Sat': '週六', 'Sun': '週日'
}

const courseStatusMap = {
  'Active': '進行中', 'Pending': '待開課', 'Closed': '已結束'
}

const getDayDisplay = (day) => dayMap[day] || day
const getCourseStatusDisplay = (status) => courseStatusMap[status] || status

const formatTime = (time) => {
  if (!time) return ''
  return typeof time === 'string' ? time.substring(0, 5) : time
}

const formatDateTime = (datetime) => {
  if (!datetime) return ''
  const date = new Date(datetime)
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const initData = async () => {
  try {
    // 1. 獲取當前用戶信息
    const user = await authAPI.getCurrentUser()
    const userData = user.data
    
    if (userData.role !== 'STUDENT' && !userData.student_id) {
       // 如果不是學生，可能需要處理（但路由守衛應該已經過濾了）
       return
    }

    studentId.value = userData.student_id
    
    if (!studentId.value) {
        console.warn('無法獲取學生 ID')
        return
    }

    // 2. 獲取學生詳細資料 (含留言/備註)
    const studentRes = await studentAPI.getById(studentId.value)
    studentName.value = studentRes.data.name
    studentNotes.value = studentRes.data.notes

    // 3. 獲取費用信息 (使用已有的計算邏輯或 API)
    // studentAPI.getById 返回的數據中包含了 unpaid_fees
    unpaidAmount.value = studentRes.data.unpaid_fees || 0
    // 如果需要筆數，可能需要調用 feeAPI
    const feesRes = await feeAPI.getByStudent(studentId.value)
    const fees = feesRes.data.results || feesRes.data
    unpaidCount.value = fees.filter(f => f.payment_status !== 'Paid').length

    // 4. 獲取進行中的團購
    loadingOrders.value = true
    const ordersRes = await groupOrderAPI.getAll()
    const allOrders = ordersRes.data.results || ordersRes.data
    activeGroupOrders.value = allOrders.filter(o => o.status === 'Open').slice(0, 5)
    loadingOrders.value = false

    // 5. 獲取已報名的課程
    loadingCourses.value = true
    const enrollmentsRes = await enrollmentAPI.getAll()
    const allEnrollments = enrollmentsRes.data.results || enrollmentsRes.data
    // 過濾出該學生的報名記錄
    const studentEnrollments = allEnrollments.filter(e => e.student === studentId.value && e.is_active)
    
    // 提取課程詳細信息
    // 這裡我們可能需要課程的詳細信息，如果 enrollment 裡沒有包含足夠的課程資訊，可能需要額外查詢
    // 假設 enrollmentSerializer 包含了 course_name，但我們需要更多。
    // 簡單起見，我們可以用 courseAPI 獲取所有課程然後匹配 ID
    const coursesRes = await courseAPI.getAll()
    const allCourses = coursesRes.data.results || coursesRes.data
    
    const enrolledCourseIds = studentEnrollments.map(e => typeof e.course === 'object' ? e.course.course_id : e.course)
    courses.value = allCourses.filter(c => enrolledCourseIds.includes(c.course_id))
    loadingCourses.value = false

  } catch (error) {
    console.error('初始化學生首頁失敗:', error)
  }
}

onMounted(() => {
  initData()
})
</script>

