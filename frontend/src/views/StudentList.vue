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

    <section class="grid gap-4 md:grid-cols-3">
      <div class="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">在籍學生</p>
        <p class="mt-2 text-3xl font-bold text-slate-900">{{ students.length }}</p>
        <p class="text-sm text-slate-500">含高三升學衝刺班 3 人</p>
      </div>
      <div class="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">緊急聯絡資訊</p>
        <p class="mt-2 text-3xl font-bold text-slate-900">
          {{ students.filter((s) => s.emergency_contact_name).length }}
        </p>
        <p class="text-sm text-slate-500">已填寫緊急聯絡人的學生數</p>
      </div>
      <div class="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">備註提醒</p>
        <p class="mt-2 text-3xl font-bold text-slate-900">
          {{ students.filter((s) => s.notes).length }}
        </p>
        <p class="text-sm text-slate-500">含個別輔導備註</p>
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
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">緊急聯絡人</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">備註</th>
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
              <td class="px-4 py-4 text-sm text-slate-700">
                <p>{{ student.emergency_contact_name || '—' }}</p>
                <p class="text-xs text-slate-500">{{ student.emergency_contact_phone || '' }}</p>
              </td>
              <td class="px-4 py-4 text-sm text-slate-700">
                <p class="max-w-xs truncate">{{ student.notes || '—' }}</p>
              </td>
              <td class="px-4 py-4 text-center">
                <div class="flex justify-center gap-2">
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
              <td colspan="6" class="py-4 px-4 text-center text-slate-500">目前沒有學生資料。</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { studentAPI } from '../services/api'
import { mockStudents } from '../data/mockData'

const students = ref([])
const loading = ref(false)
const usingMock = ref(false)

const normalizeStudent = (student) => ({
  id: student.student_id || student.id,
  name: student.name,
  school: student.school,
  grade: student.grade,
  phone: student.phone || student.contact || '',
  emergency_contact_name: student.emergency_contact_name || student.emergencyContactName || '',
  emergency_contact_phone: student.emergency_contact_phone || student.emergencyContactPhone || '',
  notes: student.notes || '',
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

onMounted(() => {
  fetchStudents()
})
</script>

