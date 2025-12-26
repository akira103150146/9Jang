<template>
  <div class="space-y-6">
    <header class="rounded-3xl border border-blue-100 bg-gradient-to-r from-white to-sky-50 p-6 shadow-sm">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-semibold text-slate-500">學生管理</p>
          <h2 class="text-2xl font-bold text-slate-900">學生資料與緊急聯絡資訊</h2>
          <p class="text-sm text-slate-500">根據規格書顯示電話、緊急聯絡人與備註</p>
        </div>
        <div class="flex gap-3">
          <div class="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2">
            <label class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                v-model="showDeleted"
                type="checkbox"
                @change="fetchStudents"
                class="rounded border-slate-300 text-sky-500 focus:ring-sky-500"
              />
              <span>顯示已刪除</span>
            </label>
          </div>
          <router-link
            v-if="canSeeAccountingFeatures"
            to="/students/add"
            class="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-md hover:from-sky-600 hover:to-indigo-600"
          >
            新增學生資料
          </router-link>
        </div>
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
      <div v-if="canSeeAccountingFeatures" class="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">總費用</p>
        <p class="mt-2 text-3xl font-bold text-slate-900">${{ totalFees.toLocaleString() }}</p>
        <p class="text-sm text-slate-500">所有學生費用總和</p>
      </div>
      <div v-if="canSeeAccountingFeatures" class="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">待繳費用</p>
        <p class="mt-2 text-3xl font-bold text-amber-600">${{ unpaidFees.toLocaleString() }}</p>
        <p class="text-sm text-slate-500">未繳費用總和</p>
      </div>
      <div v-if="canSeeAccountingFeatures" class="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">需要生成學費</p>
        <p class="mt-2 text-3xl font-bold text-red-600">{{ studentsWithTuitionNeeded.length }}</p>
        <p class="text-sm text-slate-500">學生人數</p>
        <button
          v-if="studentsWithTuitionNeeded.length > 0"
          @click="handleBatchGenerateTuitions"
          :disabled="batchGeneratingTuitions"
          class="mt-3 w-full rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {{ batchGeneratingTuitions ? '生成中...' : '批次生成所有學費' }}
        </button>
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
              <th v-if="canSeeAccountingFeatures" class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">總費用 / 待繳</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">緊急聯絡人</th>
              <th class="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="student in students" :key="student.id" :class="{'opacity-50 bg-slate-50': student.is_deleted}" class="transition hover:bg-slate-50/70">
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
              <td v-if="canSeeAccountingFeatures" class="px-4 py-4 text-sm">
                <div>
                  <p class="text-slate-900 font-semibold">總：$<span class="font-mono">{{ formatAmount(student.total_fees || 0) }}</span></p>
                  <p class="text-amber-600" :class="{'font-semibold': student.unpaid_fees > 0}">
                    待繳：$<span class="font-mono">{{ formatAmount(student.unpaid_fees || 0) }}</span>
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
                <div class="flex justify-center gap-2 flex-wrap">
                  <button
                    v-if="canSeeAccountingFeatures"
                    @click="openEnrollmentModal(student)"
                    class="rounded-full bg-indigo-500 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-600"
                  >
                    報名課程
                  </button>
                  <router-link
                    v-if="canSeeAccountingFeatures"
                    :to="`/fees?student=${student.id}`"
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
                  <button
                    @click="openLeaveModal(student)"
                    class="rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white hover:bg-orange-600"
                  >
                    請假
                  </button>
                  <router-link
                    v-if="canSeeAccountingFeatures"
                    :to="`/students/edit/${student.id}`"
                    class="rounded-full bg-sky-500 px-3 py-1 text-xs font-semibold text-white hover:bg-sky-600"
                  >
                    編輯
                  </router-link>
                  <!-- 註解：刪除功能已禁用，避免誤刪導致資料庫錯誤 -->
                  <!-- 唯一刪除方式是透過 flush_db 指令 -->
                  <!-- <button
                    v-if="isAdmin && !student.is_deleted"
                    @click="deleteStudent(student.id, student.name)"
                    class="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-600"
                  >
                    刪除
                  </button>
                  <button
                    v-if="isAdmin && student.is_deleted"
                    @click="restoreStudent(student.id, student.name)"
                    class="rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white hover:bg-green-600"
                  >
                    恢復
                  </button> -->
                </div>
              </td>
            </tr>
            <tr v-if="students.length === 0">
              <td :colspan="isAdmin ? (canSeeAccountingFeatures ? 7 : 6) : (canSeeAccountingFeatures ? 6 : 5)" class="py-4 px-4 text-center text-slate-500">目前沒有學生資料。</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 課程報名模態框 -->
    <div
      v-if="showEnrollmentModal && canSeeAccountingFeatures"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
      @click.self="closeEnrollmentModal"
    >
      <div class="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-slate-900">
            {{ selectedStudent?.name }} - 課程報名管理
          </h3>
          <button @click="closeEnrollmentModal" class="text-slate-400 hover:text-slate-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-if="loadingEnrollments" class="text-center py-12 text-slate-500">載入中...</div>
        
        <div v-else class="space-y-6">
          <!-- 已報名課程列表 -->
          <section v-if="studentEnrollments.length > 0">
            <h4 class="text-lg font-semibold text-slate-900 mb-3">已報名課程</h4>
            <div class="space-y-3">
              <div
                v-for="enrollment in studentEnrollments"
                :key="enrollment.enrollment_id"
                :class="{'opacity-50 bg-slate-100': enrollment.is_deleted}"
                class="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1">
                    <p class="font-semibold text-slate-900">{{ enrollment.course_name }}</p>
                    <p class="text-sm text-slate-600">報名日期：{{ formatDate(enrollment.enroll_date) }}</p>
                    <p class="text-sm text-slate-600">折扣：{{ enrollment.discount_rate }}%</p>
                    <div v-if="enrollment.periods && enrollment.periods.length > 0" class="mt-2">
                      <p class="text-xs font-semibold text-slate-600 mb-1">上課期間：</p>
                      <div class="space-y-1">
                        <div
                          v-for="period in enrollment.periods"
                          :key="period.period_id"
                          class="text-xs text-slate-700"
                        >
                          <span v-if="period.is_active" class="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                          <span v-else class="inline-block w-2 h-2 rounded-full bg-slate-400 mr-1"></span>
                          {{ formatDate(period.start_date) }} ~ 
                          {{ period.end_date ? formatDate(period.end_date) : '進行中' }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="flex gap-2 ml-4">
                    <button
                      @click="openPeriodModal(enrollment)"
                      class="rounded-full bg-indigo-500 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-600"
                    >
                      管理期間
                    </button>
                    <button
                      v-if="!enrollment.is_deleted"
                      @click="deleteEnrollment(enrollment.enrollment_id, enrollment.course_name)"
                      class="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-600"
                    >
                      刪除
                    </button>
                    <button
                      v-else
                      @click="restoreEnrollment(enrollment.enrollment_id, enrollment.course_name)"
                      class="rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white hover:bg-green-600"
                    >
                      恢復
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 新增報名表單 -->
          <section class="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h4 class="text-lg font-semibold text-slate-900 mb-4">新增課程報名</h4>
            <form @submit.prevent="saveEnrollment" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">學生</label>
            <input
              :value="selectedStudent?.name"
              type="text"
              disabled
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-slate-100 text-slate-600"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">課程 *</label>
            <select
              v-model="enrollmentForm.course"
              required
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            >
              <option value="">請選擇課程</option>
              <option
                v-for="course in courses"
                :key="course.course_id || course.id"
                :value="course.course_id || course.id"
              >
                {{ course.course_name }} ({{ getDayDisplay(course.day_of_week) }} {{ formatTime(course.start_time) }}-{{ formatTime(course.end_time) }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">報名日期 *</label>
            <input
              v-model="enrollmentForm.enroll_date"
              type="date"
              required
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">折扣百分比 (%)</label>
            <input
              v-model.number="enrollmentForm.discount_rate"
              type="number"
              step="0.01"
              min="0"
              max="100"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="0.00"
            />
            <p class="mt-1 text-xs text-slate-500">輸入折扣百分比，例如：10 表示 10% 折扣</p>
          </div>

              <div class="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  @click="closeEnrollmentModal"
                  class="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  關閉
                </button>
                <button
                  type="submit"
                  :disabled="savingEnrollment"
                  class="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50"
                >
                  {{ savingEnrollment ? '處理中...' : '新增報名' }}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>

    <!-- 管理期間模態框 -->
    <div
      v-if="showPeriodModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
      @click.self="closePeriodModal"
    >
      <div class="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-slate-900">
            管理上課期間 - {{ selectedEnrollment?.course_name }}
          </h3>
          <button @click="closePeriodModal" class="text-slate-400 hover:text-slate-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-if="loadingPeriods" class="text-center py-12 text-slate-500">載入中...</div>
        
        <div v-else class="space-y-4">
          <p class="text-sm text-slate-600 mb-4">管理學生的上課期間，系統會根據期間生成學費</p>
          
          <div
            v-for="(period, index) in periods"
            :key="period.period_id || index"
            class="p-4 bg-slate-50 rounded-lg border border-slate-200"
          >
            <div class="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">開始日期 *</label>
                <input
                  v-model="period.start_date"
                  type="date"
                  required
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">結束日期（可選）</label>
                <input
                  v-model="period.end_date"
                  type="date"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
                <p class="text-xs text-slate-500 mt-1">留空表示持續中</p>
              </div>
            </div>
            <div class="mb-3">
              <label class="block text-xs font-semibold text-slate-700 mb-1">備註</label>
              <textarea
                v-model="period.notes"
                rows="2"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="例如：請假中、恢復上課等..."
              ></textarea>
            </div>
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2 text-sm text-slate-700">
                <input
                  v-model="period.is_active"
                  type="checkbox"
                  class="rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                />
                <span>啟用此期間</span>
              </label>
              <button
                type="button"
                @click="removePeriod(index)"
                class="px-3 py-1 text-xs font-semibold text-rose-600 hover:text-rose-800"
              >
                刪除期間
              </button>
            </div>
          </div>
          
          <button
            type="button"
            @click="addPeriod"
            class="w-full rounded-lg border-2 border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-sky-500 hover:text-sky-600"
          >
            + 新增上課期間
          </button>

          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="closePeriodModal"
              class="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="button"
              @click="savePeriods"
              :disabled="savingPeriods"
              class="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50"
            >
              {{ savingPeriods ? '處理中...' : '儲存' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 學費生成模態框 -->
    <div
      v-if="showTuitionModal && canSeeAccountingFeatures"
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
                  <p class="text-sm text-slate-600">每週費用：$<span class="font-mono">{{ formatAmount(item.weekly_fee) }}</span></p>
                  <p v-if="item.has_fee" class="text-sm text-green-600 font-semibold">
                    已生成：$<span class="font-mono">{{ formatAmount(item.current_fee) }}</span>
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
                    $<span class="font-mono">{{ formatAmount(item.weekly_fee * item.weeks) }}</span>
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

    <!-- 請假記錄模態框 -->
    <div
      v-if="showLeaveModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
      @click.self="closeLeaveModal"
    >
      <div class="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-slate-900">
            {{ selectedStudent?.name }} - 請假記錄
          </h3>
          <button @click="closeLeaveModal" class="text-slate-400 hover:text-slate-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-if="loadingLeave" class="text-center py-12 text-slate-500">載入中...</div>
        
        <div v-else class="space-y-6">
          <!-- 新增請假按鈕 -->
          <div class="flex justify-end">
            <button
              @click="showLeaveForm = !showLeaveForm"
              class="rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-md hover:from-sky-600 hover:to-indigo-600"
            >
              {{ showLeaveForm ? '取消新增' : '新增請假' }}
            </button>
          </div>

          <!-- 新增請假表單 -->
          <section v-if="showLeaveForm" class="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h4 class="text-lg font-semibold text-slate-900 mb-4">新增請假記錄</h4>
            <form @submit.prevent="submitLeave" class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1">學生</label>
                <input
                  :value="selectedStudent?.name"
                  type="text"
                  disabled
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-slate-100 text-slate-600"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1">課程 *</label>
                <select
                  v-model="leaveForm.course"
                  required
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                >
                  <option value="">請選擇課程</option>
                  <option
                    v-for="course in courses"
                    :key="course.course_id || course.id"
                    :value="course.course_id || course.id"
                  >
                    {{ course.course_name }} ({{ getDayDisplay(course.day_of_week) }} {{ formatTime(course.start_time) }}-{{ formatTime(course.end_time) }})
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1">請假日期 *</label>
                <input
                  v-model="leaveForm.leave_date"
                  type="date"
                  required
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1">請假原因 *</label>
                <textarea
                  v-model="leaveForm.reason"
                  required
                  rows="3"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="請輸入請假原因"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1">審核狀態 *</label>
                <select
                  v-model="leaveForm.approval_status"
                  required
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                >
                  <option value="Pending">待審核</option>
                  <option value="Approved">已核准</option>
                  <option value="Rejected">已拒絕</option>
                </select>
              </div>

              <div class="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  @click="showLeaveForm = false"
                  class="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  :disabled="savingLeave"
                  class="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50"
                >
                  {{ savingLeave ? '處理中...' : '新增' }}
                </button>
              </div>
            </form>
          </section>

          <!-- 請假記錄區塊 -->
          <section>
            <h4 class="text-lg font-semibold text-slate-900 mb-3">請假記錄</h4>
            <div v-if="leaveData.leaves && leaveData.leaves.length > 0" class="overflow-x-auto">
              <table class="min-w-full divide-y divide-slate-100">
                <thead class="bg-slate-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">日期</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">課程</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">原因</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">審核狀態</th>
                    <th class="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">操作</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="leave in leaveData.leaves" :key="leave.leave_id" class="transition hover:bg-slate-50/70">
                    <td class="px-4 py-4 text-sm text-slate-700">{{ formatDate(leave.leave_date) }}</td>
                    <td class="px-4 py-4 text-sm text-slate-700">{{ leave.course_name }}</td>
                    <td class="px-4 py-4 text-sm text-slate-700">{{ leave.reason }}</td>
                    <td class="px-4 py-4">
                      <span 
                        class="rounded-full px-3 py-1 text-xs font-semibold" 
                        :class="getLeaveStatusColor(leave.approval_status)"
                      >
                        {{ getLeaveStatusDisplay(leave.approval_status) }}
                      </span>
                    </td>
                    <td class="px-4 py-4 text-center">
                      <button
                        v-if="!leave.is_deleted"
                        @click="deleteLeave(leave.leave_id, selectedStudent?.name)"
                        class="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-600"
                      >
                        刪除
                      </button>
                      <button
                        v-else
                        @click="restoreLeave(leave.leave_id, selectedStudent?.name)"
                        class="rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white hover:bg-green-600"
                      >
                        恢復
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-else class="text-sm text-slate-500 py-4">目前沒有請假記錄</p>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { studentAPI, enrollmentAPI, enrollmentPeriodAPI, courseAPI, leaveAPI } from '../services/api'
import { mockStudents } from '../data/mockData'

const router = useRouter()

const students = ref([])
const batchGeneratingTuitions = ref(false)
const loading = ref(false)
const usingMock = ref(false)
const showDeleted = ref(false)  // 是否顯示已刪除的學生
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
const showEnrollmentModal = ref(false)
const courses = ref([])
const savingEnrollment = ref(false)
const loadingEnrollments = ref(false)
const studentEnrollments = ref([])
const showDeletedEnrollments = ref(false)  // 是否顯示已刪除的報名記錄
const enrollmentForm = ref({
  course: '',
  enroll_date: new Date().toISOString().split('T')[0],
  discount_rate: 0
})
const showPeriodModal = ref(false)
const selectedEnrollment = ref(null)
const loadingPeriods = ref(false)
const savingPeriods = ref(false)
const periods = ref([])
const showLeaveModal = ref(false)
const loadingLeave = ref(false)
const showLeaveForm = ref(false)
const savingLeave = ref(false)
const showDeletedLeaves = ref(false)  // 是否顯示已刪除的請假記錄
const leaveData = ref({
  leaves: []
})
const leaveForm = ref({
  course: '',
  leave_date: new Date().toISOString().split('T')[0],
  reason: '',
  approval_status: 'Pending'
})

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
  has_tuition_needed: student.has_tuition_needed || false,
  username: student.username || '',
  password: student.password || '',
  is_account_active: student.is_account_active,
  must_change_password: student.must_change_password,
  is_deleted: student.is_deleted || false,
  deleted_at: student.deleted_at || null,
})

const totalFees = computed(() => {
  return students.value.reduce((sum, s) => sum + (s.total_fees || 0), 0)
})

const unpaidFees = computed(() => {
  return students.value.reduce((sum, s) => sum + (s.unpaid_fees || 0), 0)
})

const studentsWithTuitionNeeded = computed(() => {
  // 檢查學生是否有報名課程且需要生成學費
  return students.value.filter(s => s.has_tuition_needed === true)
})

const fetchStudents = async () => {
  loading.value = true
  try {
    const response = await studentAPI.getAll(showDeleted.value)
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

  if (!confirm(`確定要刪除學生 ${name} 的資料嗎？\n（此操作為軟刪除，資料將被隱藏但不會真正刪除）`)) {
    return
  }

  try {
    await studentAPI.delete(id)
    alert('刪除成功（已隱藏）')
    fetchStudents()
  } catch (error) {
    console.error('刪除失敗:', error)
    alert('刪除失敗，請稍後再試')
  }
}

const restoreStudent = async (id, name) => {
  if (!confirm(`確定要恢復學生 ${name} 的資料嗎？`)) {
    return
  }

  try {
    await studentAPI.restore(id)
    alert('恢復成功')
    fetchStudents()
  } catch (error) {
    console.error('恢復失敗:', error)
    alert('恢復失敗，請稍後再試')
  }
}

const openTuitionModal = async (student) => {
  if (!canSeeAccountingFeatures.value) {
    return
  }
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

// 檢查是否為老師
const isTeacher = computed(() => {
  return currentUser.value && currentUser.value.role === 'TEACHER'
})

// 檢查是否為會計
const isAccountant = computed(() => {
  return currentUser.value && currentUser.value.role === 'ACCOUNTANT'
})

// 批次生成所有學生的學費
const handleBatchGenerateTuitions = async () => {
  const studentsNeedingTuition = studentsWithTuitionNeeded.value
  
  if (studentsNeedingTuition.length === 0) {
    alert('目前沒有需要生成學費的學生')
    return
  }
  
  if (!confirm(`確定要批次生成 ${studentsNeedingTuition.length} 位學生的學費嗎？\n系統將為每位學生生成所有未生成的學費月份。`)) {
    return
  }
  
  batchGeneratingTuitions.value = true
  
  try {
    // 獲取需要生成學費的學生ID列表
    const studentIds = studentsNeedingTuition.map(s => s.id)
    
    const response = await studentAPI.batchGenerateTuitions(studentIds, 4) // 預設4週
    const result = response.data
    
    let message = `批次生成完成！\n`
    message += `處理學生數：${result.total_students}\n`
    message += `成功：${result.success_count} 位\n`
    message += `失敗：${result.fail_count} 位\n`
    message += `總共生成：${result.total_fees_generated} 筆學費記錄`
    
    if (result.errors && result.errors.length > 0) {
      console.error('批次生成學費錯誤：', result.errors)
      message += `\n\n有 ${result.errors.length} 個錯誤，請查看控制台詳情`
    }
    
    alert(message)
    
    // 刷新學生列表以更新「需要生成學費」的數量
    await fetchStudents()
  } catch (error) {
    console.error('批次生成學費失敗：', error)
    alert('批次生成學費時發生錯誤，請稍後再試')
  } finally {
    batchGeneratingTuitions.value = false
  }
}

// 檢查是否為管理員或會計（可看到會計專屬功能）
const canSeeAccountingFeatures = computed(() => {
  return isAdmin.value || isAccountant.value
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

const dayMap = {
  'Mon': '週一',
  'Tue': '週二',
  'Wed': '週三',
  'Thu': '週四',
  'Fri': '週五',
  'Sat': '週六',
  'Sun': '週日',
}

const getDayDisplay = (day) => {
  return dayMap[day] || day
}

const formatTime = (time) => {
  if (!time) return ''
  return typeof time === 'string' ? time.substring(0, 5) : time
}

const fetchCourses = async () => {
  try {
    const response = await courseAPI.getAll()
    const data = response.data.results || response.data
    courses.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.warn('獲取課程列表失敗:', error)
    courses.value = []
  }
}

const openEnrollmentModal = async (student) => {
  selectedStudent.value = student
  enrollmentForm.value = {
    course: '',
    enroll_date: new Date().toISOString().split('T')[0],
    discount_rate: 0
  }
  showEnrollmentModal.value = true
  loadingEnrollments.value = true
  
  // 獲取學生的報名記錄
  try {
    const response = await enrollmentAPI.getAll(showDeletedEnrollments.value)
    const data = response.data.results || response.data
    const allEnrollments = Array.isArray(data) ? data : []
    
    // 過濾出該學生的報名記錄
    studentEnrollments.value = allEnrollments
      .filter(e => {
        const enrollmentStudentId = e.student || e.student_id || (e.student && typeof e.student === 'object' ? e.student.student_id || e.student.id : null)
        return enrollmentStudentId === student.id || enrollmentStudentId === student.student_id
      })
      .map(e => ({
        enrollment_id: e.enrollment_id || e.id,
        course_name: e.course_name || e.course?.course_name || '',
        enroll_date: e.enroll_date,
        discount_rate: e.discount_rate || 0,
        periods: e.periods || [],
        is_deleted: e.is_deleted || false,
        deleted_at: e.deleted_at || null,
      }))
  } catch (error) {
    console.error('獲取報名記錄失敗:', error)
    studentEnrollments.value = []
  } finally {
    loadingEnrollments.value = false
  }
}

const closeEnrollmentModal = () => {
  showEnrollmentModal.value = false
  selectedStudent.value = null
  studentEnrollments.value = []
  enrollmentForm.value = {
    course: '',
    enroll_date: new Date().toISOString().split('T')[0],
    discount_rate: 0
  }
}

const saveEnrollment = async () => {
  if (!selectedStudent.value) return

  savingEnrollment.value = true
  try {
    const submitData = {
      student: selectedStudent.value.id,
      course: parseInt(enrollmentForm.value.course),
      enroll_date: enrollmentForm.value.enroll_date,
      discount_rate: parseFloat(enrollmentForm.value.discount_rate) || 0
    }

    await enrollmentAPI.create(submitData)
    alert('報名成功！')
    
    // 重置表單
    enrollmentForm.value = {
      course: '',
      enroll_date: new Date().toISOString().split('T')[0],
      discount_rate: 0
    }
    
    // 重新載入報名記錄
    await openEnrollmentModal(selectedStudent.value)
    fetchStudents() // 刷新學生列表
  } catch (error) {
    console.error('報名失敗:', error)
    if (error.response?.data) {
      const errorMsg = error.response.data.detail || JSON.stringify(error.response.data)
      alert(`報名失敗：${errorMsg}`)
    } else {
      alert('報名失敗，請稍後再試')
    }
  } finally {
    savingEnrollment.value = false
  }
}

const deleteEnrollment = async (enrollmentId, courseName) => {
  if (!confirm(`確定要刪除「${courseName}」的報名記錄嗎？\n（此操作為軟刪除，資料將被隱藏但不會真正刪除）`)) {
    return
  }

  try {
    await enrollmentAPI.delete(enrollmentId)
    alert('刪除成功（已隱藏）')
    // 重新載入報名記錄
    if (selectedStudent.value) {
      await openEnrollmentModal(selectedStudent.value)
    }
    fetchStudents() // 刷新學生列表
  } catch (error) {
    console.error('刪除報名記錄失敗:', error)
    alert('刪除報名記錄失敗，請稍後再試')
  }
}

const restoreEnrollment = async (enrollmentId, courseName) => {
  if (!confirm(`確定要恢復「${courseName}」的報名記錄嗎？`)) {
    return
  }

  try {
    await enrollmentAPI.restore(enrollmentId)
    alert('恢復成功')
    // 重新載入報名記錄
    if (selectedStudent.value) {
      await openEnrollmentModal(selectedStudent.value)
    }
    fetchStudents() // 刷新學生列表
  } catch (error) {
    console.error('恢復報名記錄失敗:', error)
    alert('恢復報名記錄失敗，請稍後再試')
  }
}

const openPeriodModal = async (enrollment) => {
  selectedEnrollment.value = enrollment
  showPeriodModal.value = true
  loadingPeriods.value = true
  
  try {
    const response = await enrollmentPeriodAPI.getByEnrollment(enrollment.enrollment_id)
    const data = response.data.results || response.data
    periods.value = Array.isArray(data) 
      ? data.map(p => ({
          period_id: p.period_id,
          start_date: p.start_date ? p.start_date.split('T')[0] : '',
          end_date: p.end_date ? p.end_date.split('T')[0] : '',
          is_active: p.is_active !== undefined ? p.is_active : true,
          notes: p.notes || '',
        }))
      : []
    
    // 如果沒有期間記錄，創建一個初始期間
    if (periods.value.length === 0 && enrollment.enroll_date) {
      periods.value = [{
        period_id: null,
        start_date: enrollment.enroll_date.split('T')[0] || enrollment.enroll_date,
        end_date: '',
        is_active: true,
        notes: '初始上課期間',
      }]
    }
  } catch (error) {
    console.error('獲取上課期間失敗:', error)
    periods.value = []
  } finally {
    loadingPeriods.value = false
  }
}

const closePeriodModal = () => {
  showPeriodModal.value = false
  selectedEnrollment.value = null
  periods.value = []
}

const addPeriod = () => {
  periods.value.push({
    period_id: null,
    start_date: '',
    end_date: '',
    is_active: true,
    notes: '',
  })
}

const removePeriod = (index) => {
  if (periods.value.length > 1) {
    periods.value.splice(index, 1)
  } else {
    alert('至少需要保留一個上課期間')
  }
}

const savePeriods = async () => {
  if (!selectedEnrollment.value) return

  savingPeriods.value = true
  try {
    const enrollmentId = selectedEnrollment.value.enrollment_id
    
    // 獲取現有的期間記錄
    const existingResponse = await enrollmentPeriodAPI.getByEnrollment(enrollmentId)
    const existingData = existingResponse.data.results || existingResponse.data
    const existingPeriods = Array.isArray(existingData) ? existingData : []
    const existingIds = existingPeriods.map(p => p.period_id)
    
    // 保存或更新期間
    for (const period of periods.value) {
      const periodData = {
        enrollment: enrollmentId,
        start_date: period.start_date,
        end_date: period.end_date || null,
        is_active: period.is_active,
        notes: period.notes || '',
      }
      
      if (period.period_id && existingIds.includes(period.period_id)) {
        // 更新現有期間
        await enrollmentPeriodAPI.update(period.period_id, periodData)
      } else if (!period.period_id) {
        // 創建新期間
        await enrollmentPeriodAPI.create(periodData)
      }
    }
    
    // 刪除已移除的期間
    const currentIds = periods.value.filter(p => p.period_id).map(p => p.period_id)
    for (const existing of existingPeriods) {
      if (!currentIds.includes(existing.period_id)) {
        await enrollmentPeriodAPI.delete(existing.period_id)
      }
    }
    
    alert('儲存成功！')
    closePeriodModal()
    
    // 重新載入報名記錄
    if (selectedStudent.value) {
      await openEnrollmentModal(selectedStudent.value)
    }
  } catch (error) {
    console.error('儲存期間失敗:', error)
    if (error.response?.data) {
      const errorMsg = error.response.data.detail || JSON.stringify(error.response.data)
      alert(`儲存失敗：${errorMsg}`)
    } else {
      alert('儲存失敗，請稍後再試')
    }
  } finally {
    savingPeriods.value = false
  }
}

const openLeaveModal = async (student) => {
  selectedStudent.value = student
  showLeaveModal.value = true
  showLeaveForm.value = false
  loadingLeave.value = true
  
  try {
    // 獲取請假記錄（根據 filter 決定是否包含已刪除）
    const leavesResponse = await leaveAPI.getAll(showDeletedLeaves.value)
    const leavesData = leavesResponse.data.results || leavesResponse.data
    const allLeaves = Array.isArray(leavesData) ? leavesData : []
    
    // 過濾出該學生的請假記錄
    leaveData.value = {
      leaves: allLeaves
        .filter(l => {
          const leaveStudentId = l.student || l.student_id || (l.student && typeof l.student === 'object' ? l.student.student_id || l.student.id : null)
          return leaveStudentId === student.id || leaveStudentId === student.student_id
        })
        .map(l => ({
          leave_id: l.leave_id || l.id,
          student_name: l.student_name || l.student?.name || '',
          course_name: l.course_name || l.course?.course_name || '',
          leave_date: l.leave_date,
          reason: l.reason || '',
          approval_status: l.approval_status || 'Pending',
          is_deleted: l.is_deleted || false,
          deleted_at: l.deleted_at || null,
        }))
    }
  } catch (error) {
    console.error('獲取請假記錄失敗：', error)
    alert('獲取請假記錄失敗')
    leaveData.value = {
      leaves: []
    }
  } finally {
    loadingLeave.value = false
  }
}

const closeLeaveModal = () => {
  showLeaveModal.value = false
  showLeaveForm.value = false
  selectedStudent.value = null
  leaveData.value = {
    leaves: []
  }
  leaveForm.value = {
    course: '',
    leave_date: new Date().toISOString().split('T')[0],
    reason: '',
    approval_status: 'Pending'
  }
}

const submitLeave = async () => {
  if (!selectedStudent.value) return

  savingLeave.value = true
  try {
    const submitData = {
      student: selectedStudent.value.id,
      course: parseInt(leaveForm.value.course),
      leave_date: leaveForm.value.leave_date,
      reason: leaveForm.value.reason,
      approval_status: leaveForm.value.approval_status
    }

    await leaveAPI.create(submitData)
    alert('新增請假記錄成功！')
    showLeaveForm.value = false
    
    // 重置表單
    leaveForm.value = {
      course: '',
      leave_date: new Date().toISOString().split('T')[0],
      reason: '',
      approval_status: 'Pending'
    }
    
    // 重新載入請假記錄
    await openLeaveModal(selectedStudent.value)
  } catch (error) {
    console.error('新增請假記錄失敗:', error)
    if (error.response?.data) {
      const errorMsg = error.response.data.detail || JSON.stringify(error.response.data)
      alert(`新增請假記錄失敗：${errorMsg}`)
    } else {
      alert('新增請假記錄失敗，請稍後再試')
    }
  } finally {
    savingLeave.value = false
  }
}

const deleteLeave = async (leaveId, studentName) => {
  if (!confirm(`確定要刪除 ${studentName} 的這筆請假記錄嗎？\n（此操作為軟刪除，資料將被隱藏但不會真正刪除）`)) {
    return
  }

  try {
    await leaveAPI.delete(leaveId)
    alert('刪除成功（已隱藏）')
    // 重新載入請假記錄
    if (selectedStudent.value) {
      await openLeaveModal(selectedStudent.value)
    }
  } catch (error) {
    console.error('刪除請假記錄失敗:', error)
    alert('刪除請假記錄失敗，請稍後再試')
  }
}

const restoreLeave = async (leaveId, studentName) => {
  if (!confirm(`確定要恢復 ${studentName} 的這筆請假記錄嗎？`)) {
    return
  }

  try {
    await leaveAPI.restore(leaveId)
    alert('恢復成功')
    // 重新載入請假記錄
    if (selectedStudent.value) {
      await openLeaveModal(selectedStudent.value)
    }
  } catch (error) {
    console.error('恢復請假記錄失敗:', error)
    alert('恢復請假記錄失敗，請稍後再試')
  }
}

const getLeaveStatusColor = (status) => {
  const colorMap = {
    'Pending': 'bg-amber-50 text-amber-600',
    'Approved': 'bg-green-50 text-green-600',
    'Rejected': 'bg-rose-50 text-rose-600'
  }
  return colorMap[status] || 'bg-slate-50 text-slate-600'
}

const getLeaveStatusDisplay = (status) => {
  const statusMap = {
    'Pending': '待審核',
    'Approved': '已核准',
    'Rejected': '已拒絕'
  }
  return statusMap[status] || status
}

const formatDate = (date) => {
  if (!date) return ''
  if (typeof date === 'string') {
    return date.replace(/-/g, '/')
  }
  return date
}

const formatAmount = (amount) => {
  // 格式化為整數，並加上千分位分隔符
  const intAmount = Math.round(parseFloat(amount || 0))
  return intAmount.toLocaleString('zh-TW', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

onMounted(() => {
  fetchCurrentUser()
  fetchStudents()
  fetchCourses()
})
</script>

