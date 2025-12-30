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
                @change="handleShowDeletedChange"
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

    <!-- 篩選區域（會計和老師可見） -->
    <section v-if="canSeeAccountingFeatures || isTeacher" class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-slate-900">篩選條件</h3>
        <button 
          @click="showFilters = !showFilters" 
          class="text-sm text-sky-600 hover:text-sky-800 font-semibold"
        >
          {{ showFilters ? '收起' : '展開' }}篩選
        </button>
      </div>
      
      <!-- 載入指示器 -->
      <div v-if="isFiltering" class="mb-2 text-xs text-slate-500 flex items-center gap-2">
        <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        搜尋中...
      </div>
      
      <!-- 篩選面板 -->
      <div v-show="showFilters" class="space-y-4">
        <!-- 第一行：文字輸入（需要防抖） -->
        <div class="grid gap-3 md:grid-cols-3">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">學生姓名</label>
            <input
              v-model="filters.name"
              type="text"
              placeholder="模糊搜尋學生姓名"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">電話號碼</label>
            <input
              v-model="filters.phone"
              type="text"
              placeholder="搜尋學生電話或緊急聯絡人電話"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">學校</label>
            <input
              v-model="filters.school"
              type="text"
              placeholder="搜尋學校名稱"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>
        </div>
        
        <!-- 第二行：下拉選單（立即更新） -->
        <div :class="canSeeAccountingFeatures ? 'grid gap-3 md:grid-cols-4' : 'grid gap-3 md:grid-cols-3'">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">標籤</label>
            <select 
              v-model="filters.tag" 
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            >
              <option value="">全部標籤</option>
              <option v-for="tag in availableTags" :key="tag.group_id" :value="tag.group_id">
                {{ tag.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">課程</label>
            <select 
              v-model="filters.course" 
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            >
              <option value="">全部課程</option>
              <option v-for="course in courses" :key="course.course_id" :value="course.course_id">
                {{ course.course_name }}
              </option>
            </select>
          </div>
          <div v-if="canSeeAccountingFeatures">
            <label class="block text-xs font-semibold text-slate-600 mb-1">待繳學費</label>
            <select 
              v-model="filters.hasUnpaidFees" 
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            >
              <option value="">全部</option>
              <option value="yes">有待繳學費</option>
              <option value="no">無待繳學費</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">請假狀態</label>
            <select 
              v-model="filters.hasLeave" 
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            >
              <option value="">全部</option>
              <option value="yes">有請假記錄</option>
              <option value="no">無請假記錄</option>
            </select>
          </div>
        </div>
        
        <!-- 操作按鈕 -->
        <div class="flex gap-2 pt-2 border-t border-slate-200">
          <button 
            @click="clearFilters" 
            class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            清除所有篩選
          </button>
          <div class="flex-1"></div>
          <button 
            v-if="canSeeAccountingFeatures || isTeacher"
            @click="openTagManager" 
            class="rounded-lg border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
          >
            管理標籤
          </button>
        </div>
        
        <!-- 已套用的篩選標籤 -->
        <div v-if="hasActiveFilters" class="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
          <span class="text-xs text-slate-500">已套用：</span>
          <span
            v-for="(filter, key) in activeFilters"
            :key="key"
            class="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700"
          >
            {{ filter.label }}
            <button @click="removeFilter(key as keyof typeof filters)" class="text-sky-600 hover:text-sky-800">×</button>
          </span>
        </div>
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
              <th v-if="canSeeAccountingFeatures || isTeacher" class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">報名課程</th>
              <th v-if="canSeeAccountingFeatures || isTeacher" class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">標籤</th>
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
              <td class="px-4 py-4 text-sm text-slate-700">{{ student.phone || '—' }}</td>
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
              <td v-if="canSeeAccountingFeatures || isTeacher" class="px-4 py-4 text-sm">
                <div v-if="student.enrollments && student.enrollments.length > 0" class="space-y-1">
                  <div
                    v-for="enrollment in student.enrollments"
                    :key="enrollment.enrollment_id"
                    class="flex items-center gap-2"
                  >
                    <span
                      class="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold"
                      :class="enrollment.is_active ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'"
                    >
                      {{ enrollment.course_name }}
                    </span>
                    <span v-if="!enrollment.is_active" class="text-xs text-slate-400">(已暫停)</span>
                  </div>
                </div>
                <p v-else class="text-xs text-slate-400">尚未報名課程</p>
              </td>
              <td v-if="canSeeAccountingFeatures || isTeacher" class="px-4 py-4 text-sm">
                <div v-if="student.student_groups && student.student_groups.length > 0" class="flex flex-wrap gap-1">
                  <span
                    v-for="group in student.student_groups"
                    :key="group.group_id"
                    class="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700"
                  >
                    {{ group.name }}
                    <button
                      v-if="canSeeAccountingFeatures || isTeacher"
                      @click="removeStudentFromTag(student, group)"
                      class="text-indigo-600 hover:text-indigo-800"
                      title="移除標籤"
                    >
                      ×
                    </button>
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <p v-if="!student.student_groups || student.student_groups.length === 0" class="text-xs text-slate-400">無標籤</p>
                  <button
                    v-if="canSeeAccountingFeatures || isTeacher"
                    @click="openAddTagModal(student)"
                    class="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline"
                  >
                    {{ student.student_groups && student.student_groups.length > 0 ? '添加' : '添加標籤' }}
                  </button>
                </div>
              </td>
              <td v-if="canSeeAccountingFeatures" class="px-4 py-4 text-sm">
                <div>
                  <p class="text-slate-900 font-semibold">總：$<span class="font-mono">{{ formatAmount(student.total_fees || 0) }}</span></p>
                  <p class="text-amber-600" :class="{'font-semibold': student.unpaid_fees > 0}">
                    待繳：$<span class="font-mono">{{ formatAmount(student.unpaid_fees || 0) }}</span>
                  </p>
                  <div class="mt-1 space-y-1">
                    <!-- 如果有未生成的學費，顯示「生成學費」按鈕 -->
                    <button
                      v-if="student.has_tuition_needed"
                      @click="openTuitionModal(student)"
                      class="block w-full text-xs text-red-600 hover:text-red-800 font-semibold underline text-left"
                    >
                      生成學費
                    </button>
                    <!-- 如果有費用記錄，顯示「費用明細」按鈕 -->
                    <router-link
                      v-if="student.total_fees > 0"
                      :to="`/fees?student=${student.id}`"
                      class="block w-full text-xs text-blue-600 hover:text-blue-800 font-semibold underline text-left"
                    >
                      費用明細
                    </router-link>
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
                    v-if="!isAccountant"
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
              <td :colspan="tableColspan" class="py-4 px-4 text-center text-slate-500">目前沒有學生資料。</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 標籤管理模態框 -->
    <StudentTagManagerModal
      :is-open="showTagManager"
      :available-tags="availableTags"
      :editing-tag="editingTag"
      :is-creating-tag="isCreatingTag"
      :tag-form="tagForm"
      :saving-tag="savingTag"
      @close="closeTagManager"
      @create="startCreateTag"
      @save="saveTag"
      @cancel="cancelTagForm"
      @edit="editTag"
      @delete="(tagId) => {
        const tag = availableTags.find(t => t.group_id === tagId)
        if (tag) deleteTag(tag)
      }"
      @update:tag-form="(value) => {
        tagForm.name = value.name
        tagForm.description = value.description
      }"
    />

    <!-- 為學生添加標籤模態框 -->
    <StudentAddTagModal
      :is-open="showAddTagModal"
      :student="selectedStudentForTag"
      :available-tags="availableTags"
      :is-adding="addingTagToStudent"
      @close="closeAddTagModal"
      @add="(tagId) => {
        const tag = availableTags.find(t => t.group_id === tagId)
        if (tag) addTagToStudent(tag)
      }"
      @open-tag-manager="() => {
        closeAddTagModal()
        openTagManager()
      }"
    />

    <!-- 課程報名模態框 -->
    <StudentEnrollmentModal
      v-if="canSeeAccountingFeatures"
      :is-open="showEnrollmentModal"
      :student="selectedStudent"
      :courses="courses"
      :enrollments="studentEnrollments"
      :loading="loadingEnrollments"
      :saving="savingEnrollment"
      v-model:enrollment-form="enrollmentForm"
      @close="closeEnrollmentModal"
      @save="saveEnrollment"
      @manage-periods="openPeriodModal"
    />

    <!-- 管理期間模態框 -->
    <StudentPeriodModal
      :is-open="showPeriodModal"
      :enrollment="selectedEnrollment"
      v-model:periods="periods"
      :loading="loadingPeriods"
      :saving="savingPeriods"
      @close="closePeriodModal"
      @save="savePeriods"
      @add-period="addPeriod"
      @remove-period="removePeriod"
    />

    <!-- 學費生成模態框 -->
    <StudentTuitionModal
      v-if="canSeeAccountingFeatures"
      :is-open="showTuitionModal"
      :student="selectedStudent"
      :tuition-status="tuitionStatus"
      :loading="loadingTuition"
      :saving="savingTuitions"
      :has-selected-tuitions="hasSelectedTuitions"
      :selected-count="selectedCount"
      @close="closeTuitionModal"
      @generate="generateAllTuitions"
      @update:tuition-status="(updatedStatus) => {
        tuitionStatus.splice(0, tuitionStatus.length, ...updatedStatus)
      }"
    />

    <!-- 請假記錄模態框 -->
    <StudentLeaveModal
      :is-open="showLeaveModal"
      :student="selectedStudent"
      :courses="courses"
      :leaves="leaveData.leaves"
      :loading="loadingLeave"
      :saving="savingLeave"
      v-model:leave-form="leaveForm"
      @close="closeLeaveModal"
      @submit="submitLeave"
      @delete="deleteLeave"
      @restore="restoreLeave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { courseAPI } from '../services/api'
import { formatDate, formatTime, getDayDisplay, formatAmount } from '../utils/studentFormatters'
import type { NormalizedStudent } from '../utils/studentUtils'

// Composables
import { useStudentUser } from '../composables/useStudentUser'
import { useStudentList } from '../composables/useStudentList'
import { useStudentFilters } from '../composables/useStudentFilters'
import { useStudentEnrollment } from '../composables/useStudentEnrollment'
import { useStudentTuition } from '../composables/useStudentTuition'
import { useStudentTags } from '../composables/useStudentTags'
import { useStudentLeave } from '../composables/useStudentLeave'
import { useStudentAccount } from '../composables/useStudentAccount'

// Components
import StudentTagManagerModal from '../components/StudentTagManagerModal.vue'
import StudentAddTagModal from '../components/StudentAddTagModal.vue'
import StudentEnrollmentModal from '../components/StudentEnrollmentModal.vue'
import StudentPeriodModal from '../components/StudentPeriodModal.vue'
import StudentTuitionModal from '../components/StudentTuitionModal.vue'
import StudentLeaveModal from '../components/StudentLeaveModal.vue'

const router = useRouter()
const route = useRoute()

// 課程列表（需要在 composables 之外，因為多個 composables 都需要）
const courses = ref<Array<{ course_id?: number; id?: number; course_name?: string; day_of_week?: string; start_time?: string; end_time?: string; [key: string]: unknown }>>([])

// 初始化 composables
const { currentUser, fetchCurrentUser, isAdmin, isTeacher, isAccountant, canSeeAccountingFeatures } = useStudentUser()

const {
  students,
  loading,
  usingMock,
  showDeleted,
  totalFees,
  unpaidFees,
  studentsWithTuitionNeeded,
  fetchStudents,
  deleteStudent,
  restoreStudent,
  updateStudent,
} = useStudentList()

// 篩選 composable（需要 canSeeAccountingFeatures 和 fetchStudents）
const {
  filters,
  showFilters,
  isFiltering,
  hasActiveFilters,
  buildQueryParams,
  applyFilters,
  clearFilters,
  removeFilter,
  syncFiltersFromRoute: syncFiltersFromRouteComposable,
  getActiveFilters,
} = useStudentFilters(canSeeAccountingFeatures, async (queryString: string) => {
  await fetchStudents(queryString)
})

// 選中的學生（用於多個模態框）
const selectedStudent = ref<NormalizedStudent | null>(null)

// 報名管理 composable
const enrollmentComposable = useStudentEnrollment(
  selectedStudent,
  students,
  updateStudent,
  fetchStudents,
  route
)

// 學費管理 composable
const tuitionComposable = useStudentTuition(
  selectedStudent,
  studentsWithTuitionNeeded,
  fetchStudents,
  canSeeAccountingFeatures
)

// 標籤管理 composable
const tagsComposable = useStudentTags(students, updateStudent, fetchStudents, route)

// 請假管理 composable
const leaveComposable = useStudentLeave(selectedStudent, courses)

// 帳號管理 composable
const accountComposable = useStudentAccount()

// 從 composables 提取需要的狀態和方法
const {
  showEnrollmentModal,
  enrollmentForm,
  studentEnrollments,
  loadingEnrollments,
  savingEnrollment,
  showPeriodModal,
  selectedEnrollment,
  periods,
  loadingPeriods,
  savingPeriods,
  openEnrollmentModal,
  closeEnrollmentModal,
  saveEnrollment,
  openPeriodModal,
  closePeriodModal,
  addPeriod,
  removePeriod,
  savePeriods,
} = enrollmentComposable

const {
  showTuitionModal,
  tuitionStatus,
  loadingTuition,
  savingTuitions,
  batchGeneratingTuitions,
  hasSelectedTuitions,
  selectedCount,
  openTuitionModal,
  closeTuitionModal,
  generateAllTuitions,
  handleBatchGenerateTuitions,
} = tuitionComposable

const {
  availableTags,
  showTagManager,
  tagForm,
  editingTag,
  isCreatingTag,
  savingTag,
  showAddTagModal,
  selectedStudentForTag,
  addingTagToStudent,
  fetchTags,
  openTagManager,
  closeTagManager,
  startCreateTag,
  createTag,
  editTag,
  updateTag,
  deleteTag,
  saveTag,
  openAddTagModal,
  closeAddTagModal,
  addTagToStudent,
  removeStudentFromTag,
} = tagsComposable

const {
  showLeaveModal,
  loadingLeave,
  savingLeave,
  leaveData,
  leaveForm,
  openLeaveModal,
  closeLeaveModal,
  submitLeave,
  deleteLeave,
  restoreLeave,
  getLeaveStatusColor,
  getLeaveStatusDisplay,
} = leaveComposable

const {
  visiblePasswords,
  editingPasswords,
  passwordForms,
  togglePasswordVisibility,
  startEditPassword,
  cancelEditPassword,
  savePassword,
  toggleAccountStatus,
} = accountComposable

// 計算表格欄位數（用於 colspan）
const tableColspan = computed(() => {
  let cols = 5 // 基礎欄位：姓名、學校/年級、手機、緊急聯絡人、操作
  if (isAdmin.value) cols += 1 // 帳號/密碼
  if (canSeeAccountingFeatures.value || isTeacher.value) cols += 1 // 報名課程
  if (canSeeAccountingFeatures.value || isTeacher.value) cols += 1 // 標籤
  if (canSeeAccountingFeatures.value) cols += 1 // 總費用/待繳
  return cols
})

// 獲取課程列表
const fetchCourses = async (): Promise<void> => {
  try {
    const response = await courseAPI.getAll()
    const responseData = response.data as { results?: unknown[] } | unknown[]
    const data = Array.isArray(responseData) ? responseData : ('results' in responseData ? (responseData.results || []) : [])
    courses.value = (data as typeof courses.value) || []
  } catch (error) {
    console.warn('獲取課程列表失敗:', error)
    courses.value = []
  }
}

// 處理顯示已刪除選項的變更
const handleShowDeletedChange = (): void => {
  const queryParams: Record<string, string> = {}
  Object.keys(route.query).forEach(key => {
    const value = route.query[key]
    if (typeof value === 'string') {
      queryParams[key] = value
    }
  })
  const queryString = new URLSearchParams(queryParams).toString()
  fetchStudents(queryString)
}

// 取消標籤表單（返回到列表視圖）
const cancelTagForm = (): void => {
  if (editingTag.value) {
    editingTag.value = null
  }
  if (isCreatingTag.value) {
    isCreatingTag.value = false
  }
  tagForm.value = { name: '', description: '' }
}

// 獲取活躍篩選的顯示標籤（computed）
const activeFilters = computed(() => {
  return getActiveFilters(
    availableTags.value,
    courses.value.map(c => ({
      course_id: c.course_id || c.id || 0,
      course_name: c.course_name || ''
    }))
  )
})

// 同步篩選從路由（使用 composable 的版本）
const syncFiltersFromRoute = (): void => {
  syncFiltersFromRouteComposable()
}

onMounted(() => {
  fetchCurrentUser()
  syncFiltersFromRoute()
  const queryParams: Record<string, string> = {}
  Object.keys(route.query).forEach(key => {
    const value = route.query[key]
    if (typeof value === 'string') {
      queryParams[key] = value
    }
  })
  const queryString = new URLSearchParams(queryParams).toString()
  fetchStudents(queryString)
  fetchCourses()
  fetchTags() // 獲取標籤列表
})
</script>
