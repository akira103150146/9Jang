<template>
  <div class="space-y-6">
    <section 
      class="rounded-3xl p-6 shadow-sm transition
            border border-blue-100 dark:border-slate-700 
            bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50
            dark:from-slate-800 dark:via-slate-900 dark:to-slate-800"
    >
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">教學團隊</p>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white">老師與權限管理</h2>
          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">快速檢視老師帳號、授課科目與聯繫資訊</p>
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
    </section>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <p class="text-slate-500">載入中...</p>
    </div>

    <div v-else 
      class="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm
             dark:border-slate-700 dark:bg-slate-800 dark:shadow-xl"
    >
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
          
          <thead class="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">姓名</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">帳號</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">權限</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">聯絡電話</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">入職日期</th>
              <th class="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">操作</th>
            </tr>
          </thead>
          
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
            <tr
              v-for="teacher in teachers"
              :key="teacher.teacher_id"
              class="transition hover:bg-slate-50/70 dark:hover:bg-slate-700/70"
            >
              <td class="whitespace-nowrap px-4 py-4">
                <p class="font-semibold text-slate-900 dark:text-white">{{ teacher.name }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">ID: {{ teacher.teacher_id ?? '—' }}</p>
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-slate-700 dark:text-slate-300">{{ teacher.username }}</td>
              
              <td class="whitespace-nowrap px-4 py-4">
                <span
                  class="rounded-full px-3 py-1 text-xs font-semibold"
                  :class="teacher.permission_level === 'Admin' 
                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300' 
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'"
                >
                  {{ teacher.permission_level }}
                </span>
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-slate-700 dark:text-slate-300">{{ teacher.phone || '—' }}</td>
              <td class="whitespace-nowrap px-4 py-4 text-slate-700 dark:text-slate-300">{{ teacher.hire_date || '—' }}</td>
              
              <td class="whitespace-nowrap px-4 py-4 text-center">
                
                <div class="hidden md:flex justify-center items-center gap-2">
                  <router-link
                    :to="`/teachers/edit/${teacher.teacher_id || teacher.id}`"
                    class="rounded-full bg-sky-500 px-3 py-1 text-xs font-semibold text-white hover:bg-sky-600 h-7 flex items-center justify-center"
                  >
                    編輯
                  </router-link>
                  <button
                    @click="deleteTeacher(teacher.teacher_id || teacher.id, teacher.name)"
                    class="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-600 h-7 flex items-center justify-center"
                  >
                    刪除
                  </button>
                </div>

                <div class="block md:hidden relative inline-block text-left">
                  <button
                    @click.stop="toggleDropdown(teacher.teacher_id)"
                    type="button"
                    class="inline-flex justify-center w-8 h-8 rounded-full text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/70 transition"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                  
                  <div
                    v-if="openDropdownId === teacher.teacher_id"
                    @click.stop
                    class="origin-top-right absolute right-0 mt-2 w-32 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-slate-100 dark:bg-slate-700 dark:divide-slate-600 z-10"
                  >
                    <div class="py-1">
                      <router-link
                        :to="`/teachers/edit/${teacher.teacher_id || teacher.id}`"
                        class="block px-4 py-2 text-sm text-sky-600 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-slate-600/50"
                      >
                        編輯資料
                      </router-link>
                    </div>
                    <div class="py-1">
                      <button
                        @click="deleteTeacher(teacher.teacher_id || teacher.id, teacher.name); closeDropdown()"
                        class="block w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-slate-600/50"
                      >
                        刪除老師
                      </button>
                    </div>
                  </div>
                </div>

              </td>
            </tr>
            <tr v-if="teachers.length === 0">
              <td colspan="6" class="py-4 px-4 text-center text-slate-500 dark:text-slate-400">目前沒有老師資料。</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { teacherAPI } from '../services/api'
import { mockTeachers } from '../data/mockData'

const teachers = ref([])
const loading = ref(false)
const usingMock = ref(false)

// 響應式操作選單狀態
const openDropdownId = ref(null)

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

// ----------------------------------------------------
// 操作選單邏輯 (Dropdown)
// ----------------------------------------------------

const toggleDropdown = (teacherId) => {
  // 如果點擊當前開啟的，則關閉；否則開啟新的
  openDropdownId.value = openDropdownId.value === teacherId ? null : teacherId
}

const closeDropdown = () => {
  openDropdownId.value = null
}

const handleClickOutside = (event) => {
  // 檢查點擊是否在任何下拉選單之外
  if (openDropdownId.value && event.target.closest('.relative.inline-block') === null) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
  fetchTeachers()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>