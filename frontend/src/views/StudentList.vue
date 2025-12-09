<template>
  <div class="space-y-6">
    <header class="rounded-3xl border border-blue-100 bg-gradient-to-r from-white to-sky-50 p-6 shadow-sm">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-semibold text-slate-500">學生資訊</p>
          <h2 class="text-2xl font-bold text-slate-900">學生資料與緊急聯絡資訊</h2>
          <p class="text-sm text-slate-500">根據規格書顯示電話、緊急聯絡人與備註</p>
        </div>
        <router-link
          to="/students/add"
          class="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-md hover:from-sky-600 hover:to-indigo-600"
        >
          新增學生資料
        </router-link>
      </div>
      <p v-if="usingMock" class="mt-3 text-sm text-amber-600">
        目前顯示示意資料（mock data），待後端欄位完善後即可串接。
      </p>
    </header>

    <section class="grid gap-4 md:grid-cols-4">
      <div class="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">在籍學生</p>
        <p class="mt-2 text-3xl font-bold text-slate-900">{{ students.length }}</p>
        <p class="text-sm text-slate-500">含高三升學衝刺班 3 人</p>
      </div>
      <div class="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">總費用</p>
        <p class="mt-2 text-3xl font-bold text-slate-900">${{ totalFees.toLocaleString() }}</p>
        <p class="text-sm text-slate-500">所有學生費用總和</p>
      </div>
      <div class="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">待繳費用</p>
        <p class="mt-2 text-3xl font-bold text-amber-600">${{ unpaidFees.toLocaleString() }}</p>
        <p class="text-sm text-slate-500">未繳費用總和</p>
      </div>
      <div class="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">需要生成學費</p>
        <p class="mt-2 text-3xl font-bold text-red-600">{{ studentsWithTuitionNeeded.length }}</p>
        <p class="text-sm text-slate-500">學生人數</p>
      </div>
    </section>

    <div class="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">姓名</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">學校 / 年級</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">手機</th>
              <th v-if="isAdmin" class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">帳號 / 密碼</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">總費用 / 待繳</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">緊急聯絡人</th>
              <th class="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="student in students" :key="student.id" class="transition hover:bg-slate-50/70">
              <td class="px-4 py-4">
                <p class="font-semibold text-slate-900">{{ student.name }}</p>
                <p class="text-xs text-slate-500">ID: {{ student.id ?? '—' }}</p>
              </td>
              <td class="px-4 py-4 text-sm text-slate-700">{{ student.school }} / {{ student.grade }}</td>
              <td class="px-4 py-4 text-sm text-slate-700">{{ student.phone || student.contact || '—' }}</td>
              <td v-if="isAdmin" class="px-4 py-4 text-sm">
                <div v-if="student.username" class="space-y-2">
                  <div>
                    <p class="text-xs text-slate-500">帳號</p>
                    <p class="font-semibold text-slate-900">{{ student.username }}</p>
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <p class="text-xs text-slate-500">密碼</p>
                      <button
                        @click="togglePasswordVisibility(student.id)"
                        class="text-xs text-sky-600 hover:text-sky-800 font-semibold"
                      >
                        {{ visiblePasswords[student.id] ? '隱藏' : '顯示' }}
                      </button>
                    </div>
                    <div v-if="editingPasswords[student.id]" class="mt-1 flex items-center gap-2">
                      <input
                        v-model="passwordForms[student.id].password"
                        type="text"
                        class="flex-1 rounded border border-slate-300 px-2 py-1 text-xs focus:border-sky-500 focus:outline-none"
                        placeholder="輸入新密碼"
                      />
                      <button
                        @click="savePassword(student)"
                        class="rounded bg-green-500 px-2 py-1 text-xs font-semibold text-white hover:bg-green-600"
                      >
                        儲存
                      </button>
                      <button
                        @click="cancelEditPassword(student.id)"
                        class="rounded bg-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-400"
                      >
                        取消
                      </button>
                    </div>
                    <div v-else class="mt-1">
                      <p class="font-mono text-sm text-slate-900">
                        {{ visiblePasswords[student.id] ? (student.password || '—') : '••••••' }}
                      </p>
                      <button
                        @click="startEditPassword(student)"
                        class="mt-1 text-xs text-sky-600 hover:text-sky-800 font-semibold"
                      >
                        編輯
                      </button>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span
                      class="rounded-full px-2 py-1 text-xs font-semibold"
                      :class="student.is_account_active ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'"
                    >
                      {{ student.is_account_active ? '啟用' : '停用' }}
                    </span>
                    <span
                      v-if="student.must_change_password"
                      class="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-600"
                    >
                      需修改密碼
                    </span>
                    <button
                      @click="toggleAccountStatus(student)"
                      class="text-xs text-slate-600 hover:text-slate-800 font-semibold"
                    >
                      {{ student.is_account_active ? '停用' : '啟用' }}
                    </button>
                  </div>
                </div>
                <p v-else class="text-xs text-slate-400">尚未創建帳號</p>
              </td>
              <td class="px-4 py-4 text-sm">
                <div>
                  <p class="text-slate-900 font-semibold">總：${{ (student.total_fees || 0).toLocaleString() }}</p>
                  <p class="text-amber-600" :class="{'font-semibold': student.unpaid_fees > 0}">
                    待繳：${{ (student.unpaid_fees || 0).toLocaleString() }}
                  </p>
                  <div v-if="student.enrollments_count > 0" class="mt-1">
                    <button
                      @click="openTuitionModal(student)"
                      class="text-xs text-red-600 hover:text-red-800 font-semibold underline"
                    >
                      生成學費
                    </button>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4 text-sm text-slate-700">
                <p>{{ student.emergency_contact_name || '—' }}</p>
                <p class="text-xs text-slate-500">{{ student.emergency_contact_phone || '' }}</p>
              </td>
              <td class="px-4 py-4 text-center">
                <div class="flex justify-center gap-2">
                  <router-link
                    :to="`/students/${student.id}/fees`"
                    class="rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white hover:bg-green-600"
                  >
                    費用
                  </router-link>
                  <router-link
                    :to="`/students/${student.id}/errors`"
                    class="rounded-full bg-purple-500 px-3 py-1 text-xs font-semibold text-white hover:bg-purple-600"
                  >
                    錯題本
                  </router-link>
                  <router-link
                    :to="`/students/edit/${student.id}`"
                    class="rounded-full bg-sky-500 px-3 py-1 text-xs font-semibold text-white hover:bg-sky-600"
                  >
                    編輯
                  </router-link>
                  <button
                    @click="deleteStudent(student.id, student.name)"
                    class="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-600"
                  >
                    刪除
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="students.length === 0">
              <td :colspan="isAdmin ? 7 : 6" class="py-4 px-4 text-center text-slate-500">目前沒有學生資料。</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 學費生成模態框 -->
    <div
      v-if="showTuitionModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      @click.self="closeTuitionModal"
    >
      <div class="bg-white rounded-3xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-slate-200">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-slate-900">
              生成學費 - {{ selectedStudent?.name }}
            </h3>
            <button
              @click="closeTuitionModal"
              class="text-slate-400 hover:text-slate-600"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div class="p-6">
          <div v-if="loadingTuition" class="text-center py-8 text-slate-500">載入中...</div>
          <div v-else-if="tuitionStatus.length === 0" class="text-center py-8 text-slate-500">
            該學生尚未報名任何課程
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="(item, index) in tuitionStatus"
              :key="index"
              class="border border-slate-200 rounded-lg p-4"
              :class="{'bg-amber-50': !item.has_fee, 'bg-green-50': item.has_fee}"
            >
              <div class="flex items-center justify-between mb-3">
                <div>
                  <p class="font-semibold text-slate-900">{{ item.course_name }}</p>
                  <p class="text-sm text-slate-600">{{ item.year }}年{{ item.month }}月</p>
                </div>
                <div class="text-right">
                  <p class="text-sm text-slate-600">每週費用：${{ item.weekly_fee.toLocaleString() }}</p>
                  <p v-if="item.has_fee" class="text-sm text-green-600 font-semibold">
                    已生成：${{ item.current_fee.toLocaleString() }}
                  </p>
                </div>
              </div>
              <div class="grid grid-cols-3 gap-4 items-end">
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1">週數</label>
                  <input
                    v-model.number="item.weeks"
                    type="number"
                    min="1"
                    max="8"
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1">總費用</label>
                  <p class="text-lg font-bold text-slate-900">
                    ${{ (item.weekly_fee * item.weeks).toLocaleString() }}
                  </p>
                </div>
                <div class="flex items-center">
                  <label class="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      v-model="item.selected"
                      type="checkbox"
                      class="rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                    />
                    <span>{{ item.has_fee ? '更新' : '生成' }}</span>
                  </label>
                </div>
              </div>
            </div>
            <div class="pt-4 border-t border-slate-200">
              <button
                @click="generateAllTuitions"
                :disabled="savingTuitions || !hasSelectedTuitions"
                class="w-full rounded-full bg-blue-500 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ savingTuitions ? '生成中...' : `一鍵生成 (${selectedCount} 項)` }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { studentAPI } from '../services/api'
import { mockStudents } from '../data/mockData'

const router = useRouter()

const students = ref([])
const loading = ref(false)
const usingMock = ref(false)
const showTuitionModal = ref(false)
const selectedStudent = ref(null)
const tuitionStatus = ref([])
const loadingTuition = ref(false)
const savingTuitions = ref(false)
const currentUser = ref(null)
const visiblePasswords = ref({})  // 追蹤哪些學生的密碼是顯示的
const editingPasswords = ref({})  // 追蹤哪些學生正在編輯密碼
const passwordForms = ref({})  // 存儲密碼編輯表單數據
const showPasswordModal = ref(false)
const passwordModalStudent = ref(null)

const normalizeStudent = (student) => ({
  id: student.student_id || student.id,
  name: student.name,
  school: student.school,
  grade: student.grade,
  phone: student.phone || student.contact || '',
  emergency_contact_name: student.emergency_contact_name || student.emergencyContactName || '',
  emergency_contact_phone: student.emergency_contact_phone || student.emergencyContactPhone || '',
  notes: student.notes || '',
  total_fees: student.total_fees || 0,
  unpaid_fees: student.unpaid_fees || 0,
  enrollments_count: student.enrollments_count || 0,
  username: student.username || '',
  password: student.password || '',
  is_account_active: student.is_account_active,
  must_change_password: student.must_change_password,
})

const totalFees = computed(() => {
  return students.value.reduce((sum, s) => sum + (s.total_fees || 0), 0)
})

const unpaidFees = computed(() => {
  return students.value.reduce((sum, s) => sum + (s.unpaid_fees || 0), 0)
})

const studentsWithTuitionNeeded = computed(() => {
  return students.value.filter(s => s.enrollments_count > 0)
})

const fetchStudents = async () => {
  loading.value = true
  try {
    const response = await studentAPI.getAll()
    const data = response.data.results || response.data
    students.value = data.map((item) => normalizeStudent(item))
    usingMock.value = false
  } catch (error) {
    console.warn('獲取學生資料失敗，使用 mock 資料：', error)
    students.value = mockStudents
    usingMock.value = true
  } finally {
    loading.value = false
  }
}

const deleteStudent = async (id, name) => {
  if (!id) {
    alert('示意資料無法刪除，請於 API 可用後再操作。')
    return
  }

  if (!confirm(`確定要刪除學生 ${name} 的資料嗎？`)) {
    return
  }

  try {
    await studentAPI.delete(id)
    alert('刪除成功')
    fetchStudents()
  } catch (error) {
    console.error('刪除失敗:', error)
    alert('刪除失敗，請稍後再試')
  }
}

const openTuitionModal = async (student) => {
  selectedStudent.value = student
  showTuitionModal.value = true
  loadingTuition.value = true
  
  try {
    const response = await studentAPI.getTuitionStatus(student.id)
    const months = response.data.tuition_months || []
    // 初始化每個項目，添加 selected 和 weeks 屬性
    tuitionStatus.value = months.map(item => ({
      ...item,
      selected: !item.has_fee, // 預設選中未生成的項目
      weeks: item.weeks || 4, // 預設4週
    }))
  } catch (error) {
    console.error('獲取學費狀態失敗：', error)
    alert('獲取學費狀態失敗')
    tuitionStatus.value = []
  } finally {
    loadingTuition.value = false
  }
}

const closeTuitionModal = () => {
  showTuitionModal.value = false
  selectedStudent.value = null
  tuitionStatus.value = []
}

const hasSelectedTuitions = computed(() => {
  return tuitionStatus.value.some(item => item.selected)
})

const selectedCount = computed(() => {
  return tuitionStatus.value.filter(item => item.selected).length
})

const generateAllTuitions = async () => {
  if (!hasSelectedTuitions.value) {
    alert('請至少選擇一個項目')
    return
  }

  if (!confirm(`確定要生成/更新 ${selectedCount.value} 項學費嗎？`)) {
    return
  }

  savingTuitions.value = true
  const selectedItems = tuitionStatus.value.filter(item => item.selected)
  let successCount = 0
  let failCount = 0

  try {
    for (const item of selectedItems) {
      try {
        await studentAPI.generateTuition(selectedStudent.value.id, {
          year: item.year,
          month: item.month,
          enrollment_id: item.enrollment_id,
          weeks: item.weeks,
        })
        successCount++
      } catch (error) {
        console.error(`生成 ${item.year}年${item.month}月學費失敗：`, error)
        failCount++
      }
    }

    if (failCount === 0) {
      alert(`成功生成 ${successCount} 項學費！`)
      closeTuitionModal()
      fetchStudents() // 刷新學生列表
    } else {
      alert(`成功生成 ${successCount} 項，失敗 ${failCount} 項`)
    }
  } catch (error) {
    console.error('批量生成學費失敗：', error)
    alert('批量生成學費時發生錯誤')
  } finally {
    savingTuitions.value = false
  }
}

// 檢查是否為管理員
const isAdmin = computed(() => {
  return currentUser.value && currentUser.value.role === 'ADMIN'
})

// 獲取當前用戶信息
const fetchCurrentUser = async () => {
  try {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      currentUser.value = JSON.parse(userStr)
    }
  } catch (error) {
    console.error('獲取用戶信息失敗:', error)
  }
}

// 切換密碼顯示/隱藏
const togglePasswordVisibility = (studentId) => {
  if (visiblePasswords.value[studentId]) {
    visiblePasswords.value[studentId] = false
  } else {
    visiblePasswords.value[studentId] = true
  }
}

// 開始編輯密碼
const startEditPassword = (student) => {
  passwordForms.value[student.id] = {
    password: student.password || ''
  }
  editingPasswords.value[student.id] = true
}

// 取消編輯密碼
const cancelEditPassword = (studentId) => {
  editingPasswords.value[studentId] = false
  delete passwordForms.value[studentId]
}

// 保存密碼
const savePassword = async (student) => {
  const newPassword = passwordForms.value[student.id]?.password
  if (!newPassword) {
    alert('請輸入新密碼')
    return
  }

  try {
    const response = await studentAPI.resetPassword(student.id, newPassword)
    alert('密碼已更新')
    // 更新本地數據
    student.password = response.data.password
    student.initial_password = response.data.password
    editingPasswords.value[student.id] = false
    delete passwordForms.value[student.id]
  } catch (error) {
    console.error('更新密碼失敗:', error)
    alert('更新密碼失敗，請稍後再試')
  }
}

// 切換帳號狀態
const toggleAccountStatus = async (student) => {
  if (!student.user) {
    alert('該學生尚未創建帳號')
    return
  }

  const action = student.is_account_active ? '停用' : '啟用'
  if (!confirm(`確定要${action}學生 ${student.name} 的帳號嗎？`)) {
    return
  }

  try {
    const response = await studentAPI.toggleAccountStatus(student.id)
    student.is_account_active = response.data.is_active
    alert(`帳號已${response.data.is_active ? '啟用' : '停用'}`)
  } catch (error) {
    console.error('切換帳號狀態失敗:', error)
    alert('操作失敗，請稍後再試')
  }
}

onMounted(() => {
  fetchCurrentUser()
  fetchStudents()
})
</script>

