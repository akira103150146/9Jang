<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
    <div class="max-w-6xl mx-auto space-y-6">
      <header class="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-slate-900">生成學費</h2>
            <p class="text-sm text-slate-500 mt-1">{{ courseName }} - {{ year }}年{{ month }}月</p>
          </div>
          <router-link
            to="/students"
            class="px-4 py-2 bg-slate-500 text-white rounded-lg text-sm font-semibold hover:bg-slate-600"
          >
            返回學生列表
          </router-link>
        </div>
      </header>

      <div class="max-w-2xl mx-auto">
        <div class="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">費用資訊</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">每週費用</label>
              <p class="text-lg font-bold text-slate-900">${{ weeklyFee.toLocaleString() }}</p>
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">選擇週數</label>
              <input
                v-model.number="selectedWeeks"
                type="number"
                min="1"
                max="8"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <p class="text-xs text-slate-500 mt-1">請輸入該月的上課週數（預設為 4 週）</p>
            </div>
            <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div class="flex items-center justify-between">
                <span class="text-sm font-semibold text-slate-700">總費用：</span>
                <span class="text-2xl font-bold text-blue-600">${{ totalFee.toLocaleString() }}</span>
              </div>
              <p class="text-xs text-slate-500 mt-1">計算公式：每週費用 × 週數</p>
            </div>
            <button
              @click="saveTuition"
              :disabled="saving || selectedWeeks < 1"
              class="w-full rounded-full bg-blue-500 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ saving ? '儲存中...' : '儲存學費' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { studentAPI } from '../services/api'

const route = useRoute()
const router = useRouter()

const studentId = route.params.studentId
const year = parseInt(route.query.year) || new Date().getFullYear()
const month = parseInt(route.query.month) || new Date().getMonth() + 1
const enrollmentId = parseInt(route.query.enrollmentId)
const courseName = route.query.courseName || ''
const weeklyFee = parseFloat(route.query.weeklyFee) || 0
const feeId = route.query.feeId || null

const selectedWeeks = ref(4)
const saving = ref(false)

const totalFee = computed(() => {
  return weeklyFee * selectedWeeks.value
})

const saveTuition = async () => {
  saving.value = true
  try {
    await studentAPI.generateTuition(studentId, {
      year: year,
      month: month,
      enrollment_id: enrollmentId,
      weeks: selectedWeeks.value,
    })
    alert('學費已成功生成！')
    router.push('/students')
  } catch (error) {
    console.error('生成學費失敗：', error)
    alert('生成學費失敗，請稍後再試')
  } finally {
    saving.value = false
  }
}
</script>

