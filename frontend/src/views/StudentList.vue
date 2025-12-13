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
          <p class="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-sky-500 dark:text-sky-400 hover:text-sky-600 dark:hover:text-sky-300 ">學生資訊</p>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white ">學生資料與緊急聯絡資訊</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 ">根據規格書顯示電話、緊急聯絡人與備註</p>
        </div>
        <router-link
          to="/students/add"
          class="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-md hover:from-sky-600 hover:to-indigo-600"
        >
          新增學生資料
        </router-link>
      </div>
      <p v-if="usingMock" class="mt-3 text-sm text-amber-600 dark:text-amber-400">
        目前顯示示意資料（mock data），待後端欄位完善後即可串接。
      </p>
    </section>

    <section class="grid gap-4 md:grid-cols-4">
      <div 
        class="rounded-3xl p-6 shadow-sm
               border border-blue-100 bg-white 
               dark:border-slate-700 dark:bg-slate-800"
      >
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">在籍學生</p>
        <p class="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{{ students.length }}</p>
        <p class="text-sm text-slate-500 dark:text-slate-400">含高三升學衝刺班 3 人</p>
      </div>
      <div class="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">總費用</p>
        <p class="mt-2 text-3xl font-bold text-slate-900 dark:text-white">${{ totalFees.toLocaleString() }}</p>
        <p class="text-sm text-slate-500 dark:text-slate-400">所有學生費用總和</p>
      </div>
      <div class="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">待繳費用</p>
        <p class="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">${{ unpaidFees.toLocaleString() }}</p>
        <p class="text-sm text-slate-500 dark:text-slate-400">未繳費用總和</p>
      </div>
      <div class="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">需要生成學費</p>
        <p class="mt-2 text-3xl font-bold text-red-600 dark:text-rose-400">{{ studentsWithTuitionNeeded.length }}</p>
        <p class="text-sm text-slate-500 dark:text-slate-400">學生人數</p>
      </div>
    </section>

    <div class="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm
            dark:border-slate-700 dark:bg-slate-800 dark:shadow-xl"
>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
      
      <thead class="bg-slate-50 dark:bg-slate-900">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">姓名</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">學校 / 年級</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">手機</th>
          <th v-if="isAdmin" class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">帳號 / 密碼</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">總費用 / 待繳</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">緊急聯絡人</th>
          <th class="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">操作</th>
        </tr>
      </thead>
      
      <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
        <tr v-for="student in students" :key="student.id" class="transition hover:bg-slate-50/70 dark:hover:bg-slate-700/70">
          
          <td class="px-4 py-4">
            <p class="font-semibold text-slate-900 dark:text-white">{{ student.name }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400">ID: {{ student.id ?? '—' }}</p>
          </td>
          
          <td class="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">{{ student.school }} / {{ student.grade }}</td>
          <td class="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">{{ student.phone || student.contact || '—' }}</td>
          
          <td v-if="isAdmin" class="px-4 py-4 text-sm">
            <div v-if="student.username" class="space-y-1">
              
              <div class="flex items-center gap-2">
                <p class="text-xs text-slate-500 dark:text-slate-400">帳號</p>
                <span
                  class="rounded-full px-2 py-1 text-xs font-semibold"
                  :class="student.is_account_active 
                            ? 'bg-green-50 text-green-600 dark:bg-green-900/50 dark:text-green-300' 
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-900/50 dark:text-rose-300'"
                >
                  {{ student.is_account_active ? '啟用' : '停用' }}
                </span>
              </div>
              <p class="font-semibold text-slate-900 dark:text-white">{{ student.username }}</p>
              
              <div class="mt-2">
                <div class="flex items-center gap-2">
                  <p class="text-xs text-slate-500 dark:text-slate-400">密碼</p>
                  <button
                    @click="togglePasswordVisibility(student.id)"
                    class="text-xs text-sky-600 hover:text-sky-800 font-semibold dark:text-sky-400 dark:hover:text-sky-300"
                  >
                    {{ visiblePasswords[student.id] ? '隱藏' : '顯示' }}
                  </button>
                </div>
                
                <div v-if="editingPasswords[student.id]" class="mt-1 flex items-center gap-2">
                  <input
                    v-model="passwordForms[student.id].password"
                    type="text"
                    class="flex-1 rounded border px-2 py-1 text-xs focus:border-sky-500 focus:outline-none 
                           border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:border-sky-400"
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
                    class="rounded px-2 py-1 text-xs font-semibold hover:bg-slate-400
                           bg-slate-300 text-slate-700 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500"
                  >
                    取消
                  </button>
                </div>
                
                <div v-else class="mt-1">
                  <p class="font-mono text-sm text-slate-900 dark:text-white">
                    {{ visiblePasswords[student.id] ? (student.password || '—') : '••••••' }}
                  </p>
                </div>
              </div>
              
              <button
                @click="openAccountModal(student)"
                class="mt-3 rounded bg-indigo-500 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-600 transition"
                title="在優化模態框中管理帳號與密碼"
              >
                管理
              </button>

            </div>
            <p v-else class="text-xs text-slate-400">尚未創建帳號</p>
          </td>
          
          <td class="px-4 py-4 text-sm">
            <div>
              <p class="text-slate-900 font-semibold dark:text-white">總：${{ (student.total_fees || 0).toLocaleString() }}</p>
              <p class="text-amber-600 dark:text-amber-400" :class="{'font-semibold': student.unpaid_fees > 0}">
                待繳：${{ (student.unpaid_fees || 0).toLocaleString() }}
              </p>
              <div v-if="student.enrollments_count > 0" class="mt-2">
                <button
                  @click="openTuitionModal(student)"
                  class="rounded bg-indigo-500 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-600 transition"
                  title="生成學生課程學費"
                >
                  生成學費
                </button>
              </div>
            </div>
          </td>
          
          <td class="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
            <p class="dark:text-white">{{ student.emergency_contact_name || '—' }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400">{{ student.emergency_contact_phone || '' }}</p>
          </td>
          
          <td class="px-4 py-4 text-center whitespace-nowrap">
            
            <div class="hidden md:flex justify-center items-center gap-1.5">
              
              <router-link
                :to="`/students/${student.id}/fees`"
                class="rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white hover:bg-green-600 h-7 flex items-center justify-center"
              >
                費用
              </router-link>

              <router-link
                :to="`/students/edit/${student.id}`"
                class="rounded-full bg-sky-500 px-3 py-1 text-xs font-semibold text-white hover:bg-sky-600 h-7 flex items-center justify-center"
              >
                編輯
              </router-link>
              
              <router-link
                :to="`/students/${student.id}/errors`"
                class="rounded-full bg-purple-500 px-3 py-1 text-xs font-semibold text-white hover:bg-purple-600 h-7 flex items-center justify-center"
              >
                錯題
              </router-link>
              
              <button
                @click="deleteStudent(student.id, student.name)"
                class="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-600 h-7 flex items-center justify-center"
              >
                刪除
              </button>
            </div>
            
            <div class="block md:hidden relative inline-block text-left">
              <button
                @click.stop="toggleDropdown(student.id)"
                type="button"
                class="inline-flex justify-center w-8 h-8 rounded-full text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/70 transition"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>

              <div
                v-if="openDropdownId === student.id"
                @click.stop
                class="origin-top-right absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-slate-100 dark:bg-slate-700 dark:divide-slate-600 z-10"
              >
                <div class="py-1">
                  <router-link
                    :to="`/students/${student.id}/fees`"
                    class="block px-4 py-2 text-sm text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-slate-600/50"
                  >
                    費用記錄
                  </router-link>
                  <router-link
                    :to="`/students/${student.id}/errors`"
                    class="block px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-slate-600/50"
                  >
                    錯題本
                  </router-link>
                  <router-link
                    :to="`/students/edit/${student.id}`"
                    class="block px-4 py-2 text-sm text-sky-600 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-slate-600/50"
                  >
                    編輯資料
                  </router-link>
                </div>
                <div class="py-1">
                  <button
                    @click="deleteStudent(student.id, student.name); closeDropdown()"
                    class="block w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-slate-600/50"
                  >
                    刪除學生
                  </button>
                </div>
              </div>
            </div>
            
          </td>
        </tr>
        
        <tr v-if="students.length === 0">
          <td :colspan="isAdmin ? 7 : 6" class="py-4 px-4 text-center text-slate-500 dark:text-slate-400">目前沒有學生資料。</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

    <div
      v-if="showTuitionModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      @click.self="closeTuitionModal"
    >
      <div 
        class="bg-white rounded-3xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto transition-colors duration-300
               dark:bg-slate-800 dark:shadow-2xl dark:text-white"
      >
        <div class="p-6 border-b border-slate-200 dark:border-slate-700">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-slate-900 dark:text-white">
              生成學費 - {{ selectedStudent?.name }}
            </h3>
            <button
              @click="closeTuitionModal"
              class="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div class="p-6">
          <div v-if="loadingTuition" class="text-center py-8 text-slate-500 dark:text-slate-400">載入中...</div>
          <div v-else-if="tuitionStatus.length === 0" class="text-center py-8 text-slate-500 dark:text-slate-400">
            該學生尚未報名任何課程
          </div>
          
          <div v-else class="space-y-4">
            <div
              v-for="(item, index) in tuitionStatus"
              :key="index"
              class="rounded-lg p-4 transition duration-200 border"
              :class="[
                // 根據狀態選擇淺色或深色背景
                !item.has_fee
                  ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/50 dark:border-amber-700'
                  : 'bg-green-50 border-green-200 dark:bg-green-900/50 dark:border-green-700',
              ]"
            >
              <div class="flex items-center justify-between mb-3">
                <div>
                  <p class="font-semibold text-slate-900 dark:text-white">{{ item.course_name }}</p>
                  <p class="text-sm text-slate-600 dark:text-slate-400">{{ item.year }}年{{ item.month }}月</p>
                </div>
                <div class="text-right">
                  <p class="text-sm text-slate-600 dark:text-slate-400">每週費用：${{ item.weekly_fee.toLocaleString() }}</p>
                  <p v-if="item.has_fee" class="text-sm text-green-600 font-semibold dark:text-green-300">
                    已生成：${{ item.current_fee.toLocaleString() }}
                  </p>
                </div>
              </div>
              <div class="grid grid-cols-3 gap-4 items-end">
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1 dark:text-slate-400">週數</label>
                  <input
                    v-model.number="item.weeks"
                    type="number"
                    min="1"
                    max="8"
                    class="w-full rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200
                           border border-slate-300
                           dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/50"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1 dark:text-slate-400">總費用</label>
                  <p class="text-lg font-bold text-slate-900 dark:text-white">
                    ${{ (item.weekly_fee * item.weeks).toLocaleString() }}
                  </p>
                </div>
                <div class="flex items-center">
                  <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <input
                      v-model="item.selected"
                      type="checkbox"
                      class="rounded border-slate-300 text-blue-500 focus:ring-blue-500
                             dark:border-slate-500 dark:bg-slate-700 dark:checked:bg-blue-500 dark:focus:ring-blue-400"
                    />
                    <span>{{ item.has_fee ? '更新' : '生成' }}</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div class="pt-4 border-t border-slate-200 dark:border-slate-700">
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

    <div
      v-if="showAccountModal && passwordModalStudent"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
      @click.self="closeAccountModal"
    >
      <div 
        class="bg-white rounded-3xl shadow-xl max-w-md w-full mx-4 p-6 space-y-6
               dark:bg-slate-800 dark:shadow-2xl dark:text-white"
      >
        <div class="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-700">
          <h3 class="text-xl font-bold text-slate-900 dark:text-white">
            管理 {{ passwordModalStudent.name }} 的帳號
          </h3>
          <button
            @click="closeAccountModal"
            class="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200"
            >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="bg-slate-50 p-4 rounded-xl space-y-2 dark:bg-slate-700">
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400">帳號資訊</p>
          <p class="text-sm text-slate-900 dark:text-white">
            用戶名:{{ passwordModalStudent.username || '—' }}
          </p>
          <div class="flex items-center gap-3">
            <p class="text-sm text-slate-900 dark:text-white">
              狀態:
            </p>
            <span
              class="rounded-full px-2 py-1 text-xs font-semibold"
              :class="passwordModalStudent.is_account_active
                ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                : 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'"
            >
              {{ passwordModalStudent.is_account_active ? '啟用' : '停用' }}
            </span>
          </div>
          <p v-if="passwordModalStudent.must_change_password" class="text-xs text-amber-600 dark:text-amber-400">
            * 首次登入需更改密碼
          </p>
        </div>

        <div class="border border-slate-200 p-4 rounded-xl space-y-4 dark:border-slate-700">
          <h4 class="text-base font-semibold text-slate-900 dark:text-white">密碼重設</h4>
          <form @submit.prevent="savePasswordFromModal" class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">新密碼</label>
              <input
                v-model="passwordForms[passwordModalStudent.id].password"
                type="text"
                required
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-200
                       dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:border-indigo-400"
                placeholder="輸入新密碼"
              />
            </div>
            
            <button
              type="submit"
              :disabled="savingPassword"
              class="w-full rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-50"
            >
              {{ savingPassword ? '儲存中...' : '重設密碼' }}
            </button>
          </form>
        </div>

        <div class="border border-slate-200 p-4 rounded-xl dark:border-slate-700">
          <h4 class="text-base font-semibold text-slate-900 dark:text-white">帳號狀態</h4>
          <button
            @click="toggleAccountStatusFromModal"
            :class="passwordModalStudent.is_account_active 
              ? 'bg-rose-500 hover:bg-rose-600'
              : 'bg-green-500 hover:bg-green-600'"
            class="mt-3 w-full rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {{ passwordModalStudent.is_account_active ? '停用此帳號' : '啟用此帳號' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
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

// ----------------------------------------------------
// 密碼/編輯狀態 (已還原)
// ----------------------------------------------------
const visiblePasswords = ref({})  // 追蹤哪些學生的密碼是顯示的
const editingPasswords = ref({})  // 追蹤哪些學生正在編輯密碼
const passwordForms = ref({})     // 存儲密碼編輯表單數據

// 帳號管理相關狀態 (模態框用)
const showAccountModal = ref(false)
const passwordModalStudent = ref(null)
const savingPassword = ref(false)


// ----------------------------------------------------
// 密碼/編輯操作函數 (已還原)
// ----------------------------------------------------

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

// 保存密碼 (表格內)
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
    const index = students.value.findIndex(s => s.id === student.id)
    if (index !== -1) {
      students.value[index].password = response.data.password 
      students.value[index].must_change_password = true
    }
    
    editingPasswords.value[student.id] = false
    delete passwordForms.value[student.id]
  } catch (error) {
    console.error('更新密碼失敗:', error)
    alert('更新密碼失敗，請稍後再試')
  }
}

// 切換帳號狀態 (表格內，此功能已不再顯示在表格中，但保留其邏輯以供其他需要)
const toggleAccountStatus = async (student) => {
  if (!student.username) {
    alert('該學生尚未創建帳號')
    return
  }

  const action = student.is_account_active ? '停用' : '啟用'
  if (!confirm(`確定要${action}學生 ${student.name} 的帳號嗎？`)) {
    return
  }

  try {
    const response = await studentAPI.toggleAccountStatus(student.id)
    const index = students.value.findIndex(s => s.id === student.id)
    if (index !== -1) {
      students.value[index].is_account_active = response.data.is_active
    }
    alert(`帳號已${response.data.is_account_active ? '啟用' : '停用'}`)
  } catch (error) {
    console.error('切換帳號狀態失敗:', error)
    alert('操作失敗，請稍後再試')
  }
}


// ----------------------------------------------------
// 操作選單邏輯 (Dropdown for Mobile)
// ----------------------------------------------------
const openDropdownId = ref(null)

const toggleDropdown = (studentId) => {
  openDropdownId.value = openDropdownId.value === studentId ? null : studentId
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

// ----------------------------------------------------
// 數據與 API 邏輯 (保持不變)
// ----------------------------------------------------

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
    tuitionStatus.value = months.map(item => ({
      ...item,
      selected: !item.has_fee,
      weeks: item.weeks || 4,
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
      fetchStudents()
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

const isAdmin = computed(() => {
  return currentUser.value && currentUser.value.role === 'ADMIN'
})

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

// ----------------------------------------------------
// 帳號管理邏輯 (模態框用)
// ----------------------------------------------------

const openAccountModal = (student) => {
  if (!student.username) {
    alert('該學生尚未創建帳號，無法進行管理。')
    return
  }
  
  passwordForms.value[student.id] = {
    password: ''
  }
  passwordModalStudent.value = student
  showAccountModal.value = true
}

const closeAccountModal = () => {
  showAccountModal.value = false
  passwordModalStudent.value = null
  savingPassword.value = false
}

const savePasswordFromModal = async () => {
  const student = passwordModalStudent.value
  const newPassword = passwordForms.value[student.id]?.password
  
  if (!newPassword) {
    alert('請輸入新密碼')
    return
  }

  savingPassword.value = true
  try {
    const response = await studentAPI.resetPassword(student.id, newPassword)
    alert('密碼已更新')
    
    // 更新本地數據 (表格內也會自動更新)
    const index = students.value.findIndex(s => s.id === student.id)
    if (index !== -1) {
      students.value[index].password = response.data.password
      students.value[index].must_change_password = true
    }
    
    // 刷新模態框顯示
    passwordModalStudent.value = students.value.find(s => s.id === student.id)
    passwordForms.value[student.id].password = ''
  } catch (error) {
    console.error('更新密碼失敗:', error)
    alert('更新密碼失敗，請稍後再試')
  } finally {
    savingPassword.value = false
  }
}

const toggleAccountStatusFromModal = async () => {
  const student = passwordModalStudent.value
  const action = student.is_account_active ? '停用' : '啟用'
  
  if (!confirm(`確定要${action}學生 ${student.name} 的帳號嗎？`)) {
    return
  }

  try {
    const response = await studentAPI.toggleAccountStatus(student.id)
    
    // 更新本地數據 (表格內也會自動更新)
    const index = students.value.findIndex(s => s.id === student.id)
    if (index !== -1) {
      students.value[index].is_account_active = response.data.is_active
    }

    alert(`帳號已${response.data.is_account_active ? '啟用' : '停用'}`)
    
    passwordModalStudent.value = students.value.find(s => s.id === student.id)
  } catch (error) {
    console.error('切換帳號狀態失敗:', error)
    alert('操作失敗，請稍後再試')
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
  fetchCurrentUser()
  fetchStudents()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>