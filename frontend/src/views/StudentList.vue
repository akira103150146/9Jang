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
    <StudentFilters
      :show-filters="showFilters"
      :is-filtering="isFiltering"
      :filters="filters"
      :available-tags="availableTags"
      :courses="courses"
      :can-see-accounting-features="canSeeAccountingFeatures"
      :is-teacher="isTeacher"
      :has-active-filters="hasActiveFilters"
      :active-filters="activeFilters"
      @toggle-filters="showFilters = !showFilters"
      @update:name="filters.name = $event"
      @update:phone="filters.phone = $event"
      @update:school="filters.school = $event"
      @update:tag="filters.tag = $event"
      @update:course="filters.course = $event"
      @update:hasUnpaidFees="filters.hasUnpaidFees = $event"
      @update:hasLeave="filters.hasLeave = $event"
      @clear-filters="clearFilters"
      @open-tag-manager="openTagManager"
      @remove-filter="removeFilter"
    />

    <!-- 學生表格 -->
    <StudentTable
      :students="students"
      :is-admin="isAdmin"
      :is-teacher="isTeacher"
      :is-accountant="isAccountant"
      :can-see-accounting-features="canSeeAccountingFeatures"
      :table-colspan="tableColspan"
      :visible-passwords="visiblePasswords"
      :editing-passwords="editingPasswords"
      :password-forms="passwordForms"
      @toggle-password-visibility="togglePasswordVisibility"
      @update:password-form="(value) => { passwordForms[value.id] = { password: value.password } }"
      @save-password="savePassword"
      @cancel-edit-password="cancelEditPassword"
      @start-edit-password="startEditPassword"
      @toggle-account-status="toggleAccountStatus"
      @remove-student-from-tag="removeStudentFromTag"
      @open-add-tag-modal="openAddTagModal"
      @open-tuition-modal="openTuitionModal"
      @open-enrollment-modal="openEnrollmentModal"
      @open-leave-modal="openLeaveModal"
    />

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
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

// Composables
import { useStudentListComposables } from '../composables/student-list/useStudentListComposables'

// Components
import StudentTagManagerModal from '../components/StudentTagManagerModal.vue'
import StudentAddTagModal from '../components/StudentAddTagModal.vue'
import StudentEnrollmentModal from '../components/StudentEnrollmentModal.vue'
import StudentPeriodModal from '../components/StudentPeriodModal.vue'
import StudentTuitionModal from '../components/StudentTuitionModal.vue'
import StudentLeaveModal from '../components/StudentLeaveModal.vue'
import StudentFilters from '../components/student-list/StudentFilters.vue'
import StudentTable from '../components/student-list/StudentTable.vue'

const route = useRoute()

// 使用統一的 composable 管理所有邏輯
const {
  // 用戶權限
  fetchCurrentUser,
  isAdmin,
  isTeacher,
  isAccountant,
  canSeeAccountingFeatures,

  // 學生列表
  students,
  loading,
  usingMock,
  showDeleted,
  totalFees,
  unpaidFees,
  studentsWithTuitionNeeded,
  fetchStudents,

  // 課程
  courses,
  fetchCourses,

  // 模態框狀態
  selectedStudent,
  showTagManager,
  showAddTagModal,
  selectedStudentForTag,
  showEnrollmentModal,
  showPeriodModal,
  showTuitionModal,
  showLeaveModal,

  // 模態框操作
  openTagManager,
  closeTagManager,
  openAddTagModal,
  closeAddTagModal,
  openEnrollmentModal,
  closeEnrollmentModal,
  openPeriodModal,
  closePeriodModal,
  openTuitionModal,
  closeTuitionModal,
  openLeaveModal,
  closeLeaveModal,

  // 篩選
  filters,
  showFilters,
  isFiltering,
  hasActiveFilters,
  activeFilters,
  clearFilters,
  removeFilter,
  syncFiltersFromRoute,
  handleShowDeletedChange,

  // 報名
  enrollmentForm,
  studentEnrollments,
  loadingEnrollments,
  savingEnrollment,
  selectedEnrollment,
  periods,
  loadingPeriods,
  savingPeriods,
  saveEnrollment,
  addPeriod,
  removePeriod,
  savePeriods,

  // 學費
  tuitionStatus,
  loadingTuition,
  savingTuitions,
  batchGeneratingTuitions,
  hasSelectedTuitions,
  selectedCount,
  generateAllTuitions,
  handleBatchGenerateTuitions,

  // 標籤
  availableTags,
  tagForm,
  editingTag,
  isCreatingTag,
  savingTag,
  addingTagToStudent,
  fetchTags,
  startCreateTag,
  saveTag,
  cancelTagForm,
  editTag,
  deleteTag,
  addTagToStudent,
  removeStudentFromTag,

  // 請假
  loadingLeave,
  savingLeave,
  leaveData,
  leaveForm,
  submitLeave,
  deleteLeave,
  restoreLeave,

  // 帳號
  visiblePasswords,
  editingPasswords,
  passwordForms,
  togglePasswordVisibility,
  startEditPassword,
  cancelEditPassword,
  savePassword,
  toggleAccountStatus,

  // 表格
  tableColspan,
} = useStudentListComposables()

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
