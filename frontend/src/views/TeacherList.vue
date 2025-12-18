<template>
  <div class="space-y-6">
    <header class="rounded-3xl border border-blue-100 bg-gradient-to-r from-white to-sky-50 p-6 shadow-sm">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-semibold text-slate-500">教學團隊</p>
          <h2 class="text-2xl font-bold text-slate-900">老師與權限管理</h2>
          <p class="mt-2 text-sm text-slate-500">快速檢視老師帳號、授課科目與聯繫資訊</p>
        </div>
        <router-link
          to="/teachers/add"
          class="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-md hover:from-sky-600 hover:to-indigo-600"
        >
          新增老師資料
        </router-link>
      </div>
      <p v-if="usingMock" class="mt-3 text-sm text-amber-600">
        目前顯示示意資料（mock data），待後端欄位完善後即可串接。
      </p>
    </header>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <p class="text-slate-500">載入中...</p>
    </div>

    <div v-else class="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">姓名</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">帳號</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">權限</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">聯絡電話</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">入職日期</th>
              <th class="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="teacher in teachers"
              :key="teacher.teacher_id"
              class="transition hover:bg-slate-50/70"
            >
              <td class="whitespace-nowrap px-4 py-4">
                <p class="font-semibold text-slate-900">{{ teacher.name }}</p>
                <p class="text-xs text-slate-500">ID: {{ teacher.teacher_id ?? '—' }}</p>
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-slate-700">{{ teacher.username }}</td>
              <td class="whitespace-nowrap px-4 py-4">
                <span
                  class="rounded-full px-3 py-1 text-xs font-semibold"
                  :class="teacher.permission_level === 'Admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-700'"
                >
                  {{ teacher.permission_level }}
                </span>
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-slate-700">{{ teacher.phone || '—' }}</td>
              <td class="whitespace-nowrap px-4 py-4 text-slate-700">{{ teacher.hire_date || '—' }}</td>
              <td class="whitespace-nowrap px-4 py-4 text-center">
                <div class="flex justify-center gap-2">
                  <router-link
                    :to="`/teachers/edit/${teacher.teacher_id || teacher.id}`"
                    class="rounded-full bg-sky-500 px-3 py-1 text-xs font-semibold text-white hover:bg-sky-600"
                  >
                    編輯
                  </router-link>
                  <!-- 註解：刪除功能已禁用，避免誤刪導致資料庫錯誤 -->
                  <!-- 唯一刪除方式是透過 flush_db 指令 -->
                  <!-- <button
                    @click="deleteTeacher(teacher.teacher_id || teacher.id, teacher.name)"
                    class="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-600"
                  >
                    刪除
                  </button> -->
                </div>
              </td>
            </tr>
            <tr v-if="teachers.length === 0">
              <td colspan="6" class="py-4 px-4 text-center text-slate-500">目前沒有老師資料。</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { teacherAPI } from '../services/api'
import { mockTeachers } from '../data/mockData'

const teachers = ref([])
const loading = ref(false)
const usingMock = ref(false)

const normalizeTeacher = (teacher) => ({
  teacher_id: teacher.teacher_id || teacher.id,
  name: teacher.name,
  username: teacher.username,
  permission_level: teacher.permission_level || 'Teacher',
  phone: teacher.phone || '',
  hire_date: teacher.hire_date || '',
})

const fetchTeachers = async () => {
  loading.value = true
  try {
    const response = await teacherAPI.getAll()
    const data = response.data.results || response.data
    teachers.value = data.map((item) => normalizeTeacher(item))
    usingMock.value = false
  } catch (error) {
    console.warn('獲取老師資料失敗，使用 mock 資料：', error)
    teachers.value = mockTeachers
    usingMock.value = true
  } finally {
    loading.value = false
  }
}

const deleteTeacher = async (id, name) => {
  if (!id) {
    alert('示意資料無法刪除，請於 API 可用後再操作。')
    return
  }

  if (!confirm(`確定要刪除老師 ${name} 的資料嗎？`)) {
    return
  }

  try {
    await teacherAPI.delete(id)
    alert('刪除成功')
    fetchTeachers()
  } catch (error) {
    console.error('刪除失敗:', error)
    alert('刪除失敗，請稍後再試')
  }
}

onMounted(() => {
  fetchTeachers()
})
</script>

