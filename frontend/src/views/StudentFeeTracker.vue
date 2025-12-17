<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
    <div class="max-w-6xl mx-auto space-y-6">
      <header class="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-slate-900">{{ student?.name || '載入中...' }}</h2>
            <p class="text-sm text-slate-500 mt-1">{{ student?.school }} / {{ student?.grade }}</p>
          </div>
          <router-link
            to="/student-home"
            class="px-4 py-2 bg-slate-500 text-white rounded-lg text-sm font-semibold hover:bg-slate-600"
          >
            返回首頁
          </router-link>
        </div>
      </header>

      <div v-if="loading" class="text-center py-12 text-slate-500">載入中...</div>

      <div v-else class="rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div class="p-6 border-b border-slate-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-slate-900">我的費用</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-100">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">日期</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">名目</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">金額</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">狀態</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">備註</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="fee in fees" :key="fee.fee_id" class="transition hover:bg-slate-50/70">
                <td class="px-4 py-4 text-sm text-slate-700">{{ formatDate(fee.fee_date) }}</td>
                <td class="px-4 py-4 text-sm text-slate-700">{{ getItemDisplayName(fee.item) }}</td>
                <td class="px-4 py-4 text-sm font-semibold text-slate-900">${{ parseFloat(fee.amount).toLocaleString() }}</td>
                <td class="px-4 py-4 text-sm">
                  <span
                    class="rounded-full px-3 py-1 text-xs font-semibold"
                    :class="fee.payment_status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : (fee.payment_status === 'Partial' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600')"
                  >
                    {{ fee.payment_status === 'Paid' ? '已繳' : (fee.payment_status === 'Partial' ? '部分繳' : '未繳') }}
                  </span>
                </td>
                <td class="px-4 py-4 text-sm text-slate-700">
                  <p class="max-w-md truncate">{{ fee.notes || '—' }}</p>
                </td>
              </tr>
              <tr v-if="fees.length === 0">
                <td colspan="5" class="py-8 px-4 text-center text-slate-500">目前沒有費用記錄</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authAPI, feeAPI, studentAPI } from '../services/api'

const route = useRoute()
const router = useRouter()

onMounted(() => {
  init()
})

const student = ref(null)
const fees = ref([])
const loading = ref(false)

const getItemDisplayName = (item) => {
  const names = {
    Tuition: '學費',
    Meal: '餐費',
    Transport: '交通費',
    Book: '書籍費',
    Other: '其他',
  }
  return names[item] || item
}

const formatDate = (dateString) => {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

const init = async () => {
  loading.value = true
  try {
    const meRes = await authAPI.getCurrentUser()
    const me = meRes.data

    // 只提供學生查看自己的費用
    if (me.role !== 'STUDENT' || !me.student_id) {
      // 會計/老師/管理員：改走「所有費用」頁面（可帶 student filter）
      if (route.params.studentId) {
        router.replace({ path: '/fees', query: { student: route.params.studentId } })
        return
      }
      router.replace('/fees')
      return
    }

    const myStudentId = String(me.student_id)
    const routeStudentId = String(route.params.studentId || '')

    if (routeStudentId && routeStudentId !== myStudentId) {
      router.replace(`/students/${myStudentId}/fees`)
      return
    }

    const [studentRes, feeRes] = await Promise.all([
      studentAPI.getById(myStudentId),
      feeAPI.getByStudent(myStudentId),
    ])

    student.value = studentRes.data
    const data = feeRes.data.results || feeRes.data
    fees.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('載入學生費用失敗：', error)
    alert('載入費用失敗，請稍後再試')
  } finally {
    loading.value = false
  }
}
</script>
