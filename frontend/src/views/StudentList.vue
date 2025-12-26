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
            <button @click="removeFilter(key)" class="text-sky-600 hover:text-sky-800">×</button>
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
                  <div v-if="student.enrollments_count > 0" class="mt-1 space-y-1">
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
    <div
      v-if="showTagManager"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      @click.self="closeTagManager"
    >
      <div class="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl max-h-[80vh] overflow-y-auto">
        <div class="mb-6 flex items-center justify-between">
          <h3 class="text-xl font-bold text-slate-900">
            {{ editingTag ? '編輯標籤' : '標籤管理' }}
          </h3>
          <div class="flex gap-2">
            <button
              v-if="editingTag || isCreatingTag"
              @click="cancelTagForm"
              class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {{ editingTag ? '返回列表' : '取消' }}
            </button>
            <button
              v-if="!editingTag && !isCreatingTag"
              @click="startCreateTag"
              class="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600"
            >
              新增標籤
            </button>
            <button
              @click="closeTagManager"
              class="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- 編輯/新增表單 -->
        <div v-if="editingTag || isCreatingTag" class="mb-6 space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">標籤名稱 *</label>
            <input
              v-model="tagForm.name"
              type="text"
              placeholder="請輸入標籤名稱"
              class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">描述</label>
            <textarea
              v-model="tagForm.description"
              rows="3"
              placeholder="請輸入標籤描述（選填）"
              class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            ></textarea>
          </div>
          <div class="flex justify-end gap-3">
            <button
              @click="cancelTagForm"
              class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              取消
            </button>
            <button
              @click="saveTag"
              :disabled="savingTag"
              class="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ savingTag ? '儲存中...' : (editingTag ? '更新' : '創建') }}
            </button>
          </div>
        </div>

        <!-- 標籤列表 -->
        <div v-if="!editingTag && !isCreatingTag">
          <div v-if="availableTags.length === 0" class="text-center py-8 text-slate-500">
            目前沒有標籤，點擊「新增標籤」開始創建
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="tag in availableTags"
              :key="tag.group_id"
              class="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 hover:bg-slate-50"
            >
              <div class="flex-1">
                <h4 class="font-semibold text-slate-900">{{ tag.name }}</h4>
                <p v-if="tag.description" class="mt-1 text-sm text-slate-500">{{ tag.description }}</p>
                <p class="mt-1 text-xs text-slate-400">學生數：{{ tag.students_count || 0 }}</p>
              </div>
              <div class="flex gap-2">
                <button
                  @click="editTag(tag)"
                  class="rounded-lg border border-sky-300 bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700 hover:bg-sky-100"
                >
                  編輯
                </button>
                <button
                  @click="deleteTag(tag)"
                  class="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                >
                  刪除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 為學生添加標籤模態框 -->
    <div
      v-if="showAddTagModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      @click.self="closeAddTagModal"
    >
      <div class="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <div class="mb-6 flex items-center justify-between">
          <h3 class="text-xl font-bold text-slate-900">
            為「{{ selectedStudentForTag?.name }}」添加標籤
          </h3>
          <button
            @click="closeAddTagModal"
            class="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-if="availableTags.length === 0" class="text-center py-8">
          <p class="text-slate-500 mb-4">目前沒有標籤</p>
          <button
            @click="closeAddTagModal(); openTagManager()"
            class="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600"
          >
            新增標籤
          </button>
        </div>
        <div v-else class="space-y-2 max-h-96 overflow-y-auto">
          <div
            v-for="tag in availableTags"
            :key="tag.group_id"
            class="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 hover:bg-slate-50"
          >
            <div class="flex-1">
              <h4 class="font-semibold text-slate-900">{{ tag.name }}</h4>
              <p v-if="tag.description" class="mt-1 text-sm text-slate-500">{{ tag.description }}</p>
            </div>
            <div>
              <button
                v-if="selectedStudentForTag && selectedStudentForTag.student_groups && selectedStudentForTag.student_groups.some(g => g.group_id === tag.group_id)"
                disabled
                class="rounded-lg border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-400 cursor-not-allowed"
              >
                已添加
              </button>
              <button
                v-else
                @click="addTagToStudent(tag)"
                :disabled="addingTagToStudent"
                class="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ addingTagToStudent ? '添加中...' : '添加' }}
              </button>
            </div>
          </div>
        </div>
        <div v-if="availableTags.length > 0" class="mt-4 pt-4 border-t border-slate-200">
          <button
            @click="closeAddTagModal(); openTagManager()"
            class="w-full rounded-lg border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
          >
            管理標籤
          </button>
        </div>
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
          <div>
            <div class="flex items-center justify-between mb-2">
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
            <p class="text-sm text-slate-500">只顯示未生成的學費月份，您可以在費用明細頁面查看和編輯已生成的學費</p>
          </div>
        </div>
        <div class="p-6">
          <div v-if="loadingTuition" class="text-center py-8 text-slate-500">載入中...</div>
          <div v-else-if="tuitionStatus.length === 0" class="text-center py-8 text-slate-500">
            <p>該學生沒有需要生成的學費</p>
            <p class="text-sm mt-2">
              <router-link :to="`/fees?student=${selectedStudent?.id}`" class="text-blue-600 hover:text-blue-800 underline">
                前往費用明細頁面查看已生成的學費
              </router-link>
            </p>
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="(item, index) in tuitionStatus"
              :key="index"
              class="border border-slate-200 rounded-lg p-4 bg-amber-50"
            >
              <div class="flex items-center justify-between mb-3">
                <div>
                  <p class="font-semibold text-slate-900">{{ item.course_name }}</p>
                  <p class="text-sm text-slate-600">{{ item.year }}年{{ item.month }}月</p>
                </div>
                <div class="text-right">
                  <p class="text-sm text-slate-600">每週費用：$<span class="font-mono">{{ formatAmount(item.weekly_fee) }}</span></p>
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
                    <span>生成</span>
                  </label>
                </div>
              </div>
            </div>
            <div class="pt-4 border-t border-slate-200">
              <button
                @click="generateAllTuitions"
                :disabled="savingTuitions || !hasSelectedTuitions"
                class="w-full rounded-full bg-red-500 px-5 py-3 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ savingTuitions ? '生成中...' : `生成選中的學費 (${selectedCount} 項)` }}
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
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { studentAPI, enrollmentAPI, enrollmentPeriodAPI, courseAPI, leaveAPI, studentGroupAPI } from '../services/api'
import { mockStudents } from '../data/mockData'

const router = useRouter()
const route = useRoute()

const students = ref([])
const batchGeneratingTuitions = ref(false)
const loading = ref(false)
const usingMock = ref(false)
const showDeleted = ref(false)  // 是否顯示已刪除的學生
const showFilters = ref(false)  // 是否顯示篩選面板
const isFiltering = ref(false)  // 是否正在篩選

// 篩選條件
const filters = ref({
  name: '',
  phone: '',
  school: '',
  tag: '',
  course: '',
  hasUnpaidFees: '',
  hasLeave: ''
})

const availableTags = ref([])  // 標籤列表
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
  enrollments: student.enrollments || [], // 報名課程列表
  student_groups: student.student_groups || [], // 標籤列表
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

const fetchStudents = async (queryParams = '') => {
  loading.value = true
  try {
    const response = await studentAPI.getAll(showDeleted.value, queryParams)
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
    // 只顯示未生成的學費項目（has_fee = false），並初始化每個項目
    tuitionStatus.value = months
      .filter(item => !item.has_fee) // 只保留未生成的項目
      .map(item => ({
        ...item,
        selected: true, // 預設選中所有未生成的項目
        weeks: item.weeks || 4, // 預設4週
      }))
    
    // 如果沒有未生成的項目，顯示提示並關閉模態框
    if (tuitionStatus.value.length === 0) {
      alert('該學生沒有需要生成的學費，請在費用明細頁面查看已生成的學費')
      closeTuitionModal()
    }
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

  if (!confirm(`確定要生成 ${selectedCount.value} 項學費嗎？`)) {
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

// 計算表格欄位數（用於 colspan）
const tableColspan = computed(() => {
  let cols = 5 // 基礎欄位：姓名、學校/年級、手機、緊急聯絡人、操作
  if (isAdmin.value) cols += 1 // 帳號/密碼
  if (canSeeAccountingFeatures.value || isTeacher.value) cols += 1 // 報名課程
  if (canSeeAccountingFeatures.value || isTeacher.value) cols += 1 // 標籤
  if (canSeeAccountingFeatures.value) cols += 1 // 總費用/待繳
  return cols
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

// 防抖函數
let debounceTimer = null
const debounce = (fn, delay) => {
  return (...args) => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

// 構建查詢參數
const buildQueryParams = () => {
  const params = {}
  if (filters.value.name) params.name = filters.value.name
  if (filters.value.phone) params.phone = filters.value.phone
  if (filters.value.school) params.school = filters.value.school
  if (filters.value.tag) params.tag = filters.value.tag
  if (filters.value.course) params.course = filters.value.course
  // 只有會計可以看到待繳學費篩選
  if (canSeeAccountingFeatures.value && filters.value.hasUnpaidFees) params.has_unpaid_fees = filters.value.hasUnpaidFees
  if (filters.value.hasLeave) params.has_leave = filters.value.hasLeave
  return params
}

// 應用篩選（更新 URL 並獲取數據）
const applyFilters = async () => {
  if (isFiltering.value) return // 防止重複請求
  
  isFiltering.value = true
  try {
    const query = buildQueryParams()
    // 使用 replace 避免產生過多歷史記錄
    await router.replace({ path: '/students', query })
    
    // 獲取學生列表
    const queryString = new URLSearchParams(query).toString()
    await fetchStudents(queryString)
  } finally {
    isFiltering.value = false
  }
}

// 防抖版本的 applyFilters（用於文字輸入）
const debouncedApplyFilters = debounce(applyFilters, 400)

// 清除所有篩選
const clearFilters = () => {
  filters.value = {
    name: '',
    phone: '',
    school: '',
    tag: '',
    course: '',
    hasUnpaidFees: '',
    hasLeave: ''
  }
  router.replace({ path: '/students', query: {} })
  fetchStudents()
}

// 移除單個篩選
const removeFilter = (key) => {
  filters.value[key] = ''
  applyFilters()
}

// 檢查是否有活躍的篩選
const hasActiveFilters = computed(() => {
  return Object.values(filters.value).some(value => value !== '')
})

// 獲取活躍篩選的顯示標籤
const activeFilters = computed(() => {
  const result = {}
  if (filters.value.name) result.name = { label: `姓名：${filters.value.name}` }
  if (filters.value.phone) result.phone = { label: `電話：${filters.value.phone}` }
  if (filters.value.school) result.school = { label: `學校：${filters.value.school}` }
  if (filters.value.tag) {
    const tag = availableTags.value.find(t => t.group_id == filters.value.tag)
    result.tag = { label: `標籤：${tag?.name || filters.value.tag}` }
  }
  if (filters.value.course) {
    const course = courses.value.find(c => c.course_id == filters.value.course)
    result.course = { label: `課程：${course?.course_name || filters.value.course}` }
  }
  // 只有會計可以看到待繳學費篩選
  if (canSeeAccountingFeatures.value && filters.value.hasUnpaidFees) {
    result.hasUnpaidFees = { label: filters.value.hasUnpaidFees === 'yes' ? '有待繳學費' : '無待繳學費' }
  }
  if (filters.value.hasLeave) {
    result.hasLeave = { label: filters.value.hasLeave === 'yes' ? '有請假記錄' : '無請假記錄' }
  }
  return result
})

// 監聽需要防抖的篩選條件（文字輸入）
watch(
  () => [filters.value.name, filters.value.phone, filters.value.school],
  () => {
    debouncedApplyFilters()
  }
)

// 監聽下拉選單（立即更新）
watch(
  () => {
    // 基礎監聽項目
    const watched = [filters.value.tag, filters.value.course, filters.value.hasLeave]
    // 只有會計才監聽待繳學費
    if (canSeeAccountingFeatures.value) {
      return [...watched, filters.value.hasUnpaidFees]
    }
    return watched
  },
  () => {
    applyFilters() // 立即執行
  }
)

// 從 URL 同步篩選條件（頁面載入或返回時）
const syncFiltersFromRoute = () => {
  filters.value = {
    name: route.query.name || '',
    phone: route.query.phone || route.query.parent_phone || '', // 兼容舊的 parent_phone 參數
    school: route.query.school || '',
    tag: route.query.tag || '',
    course: route.query.course || '',
    hasUnpaidFees: canSeeAccountingFeatures.value ? (route.query.has_unpaid_fees || '') : '', // 只有會計才同步待繳學費
    hasLeave: route.query.has_leave || ''
  }
  // 如果有篩選條件，自動展開篩選面板
  if (hasActiveFilters.value) {
    showFilters.value = true
  }
}

// 獲取標籤列表（統一為標籤，不再區分類型）
const fetchTags = async () => {
  try {
    const response = await studentGroupAPI.getAll()
    const data = response.data.results || response.data || []
    availableTags.value = data
  } catch (error) {
    console.error('獲取標籤失敗:', error)
    availableTags.value = []
  }
}

// 標籤管理相關狀態
const showTagManager = ref(false)
const tagForm = ref({
  name: '',
  description: ''
})
const editingTag = ref(null)
const isCreatingTag = ref(false)
const savingTag = ref(false)

// 打開標籤管理模態框
const openTagManager = () => {
  showTagManager.value = true
  editingTag.value = null
  isCreatingTag.value = false
  tagForm.value = { name: '', description: '' }
}

// 關閉標籤管理模態框
const closeTagManager = () => {
  showTagManager.value = false
  editingTag.value = null
  isCreatingTag.value = false
  tagForm.value = { name: '', description: '' }
}

// 開始創建新標籤
const startCreateTag = () => {
  editingTag.value = null
  isCreatingTag.value = true
  tagForm.value = { name: '', description: '' }
}

// 創建新標籤
const createTag = async () => {
  if (!tagForm.value.name.trim()) {
    alert('請輸入標籤名稱')
    return
  }
  
  savingTag.value = true
  try {
    await studentGroupAPI.create({
      name: tagForm.value.name.trim(),
      description: tagForm.value.description.trim() || ''
    })
    alert('標籤創建成功')
    await fetchTags()
    isCreatingTag.value = false
    tagForm.value = { name: '', description: '' }
    // 不關閉模態框，讓用戶可以繼續創建或管理標籤
  } catch (error) {
    console.error('創建標籤失敗:', error)
    const errorMsg = error.response?.data?.detail || error.response?.data?.name?.[0] || '創建標籤失敗'
    alert(`創建標籤失敗：${errorMsg}`)
  } finally {
    savingTag.value = false
  }
}

// 編輯標籤
const editTag = (tag) => {
  editingTag.value = tag
  tagForm.value = {
    name: tag.name,
    description: tag.description || ''
  }
}

// 更新標籤
const updateTag = async () => {
  if (!tagForm.value.name.trim()) {
    alert('請輸入標籤名稱')
    return
  }
  
  if (!editingTag.value) return
  
  savingTag.value = true
  try {
    await studentGroupAPI.update(editingTag.value.group_id, {
      name: tagForm.value.name.trim(),
      description: tagForm.value.description.trim() || ''
    })
    alert('標籤更新成功')
    await fetchTags()
    editingTag.value = null
    tagForm.value = { name: '', description: '' }
    // 不關閉模態框，讓用戶可以繼續管理標籤
  } catch (error) {
    console.error('更新標籤失敗:', error)
    const errorMsg = error.response?.data?.detail || error.response?.data?.name?.[0] || '更新標籤失敗'
    alert(`更新標籤失敗：${errorMsg}`)
  } finally {
    savingTag.value = false
  }
}

// 刪除標籤
const deleteTag = async (tag) => {
  if (!confirm(`確定要刪除標籤「${tag.name}」嗎？`)) {
    return
  }
  
  try {
    await studentGroupAPI.delete(tag.group_id)
    alert('標籤刪除成功')
    await fetchTags()
  } catch (error) {
    console.error('刪除標籤失敗:', error)
    alert('刪除標籤失敗，請稍後再試')
  }
}

// 保存標籤（創建或更新）
const saveTag = () => {
  if (editingTag.value) {
    updateTag()
  } else {
    createTag()
  }
}

// 為學生添加/移除標籤相關狀態
const showAddTagModal = ref(false)
const selectedStudentForTag = ref(null)
const addingTagToStudent = ref(false)

// 打開為學生添加標籤的模態框
const openAddTagModal = (student) => {
  selectedStudentForTag.value = student
  showAddTagModal.value = true
}

// 關閉添加標籤模態框
const closeAddTagModal = () => {
  showAddTagModal.value = false
  selectedStudentForTag.value = null
}

// 為學生添加標籤
const addTagToStudent = async (tag) => {
  if (!selectedStudentForTag.value) return
  
  addingTagToStudent.value = true
  try {
    await studentGroupAPI.addStudents(tag.group_id, [selectedStudentForTag.value.id])
    alert('標籤添加成功')
    // 重新獲取學生列表以更新標籤
    const queryString = new URLSearchParams(route.query).toString()
    await fetchStudents(queryString)
    closeAddTagModal()
  } catch (error) {
    console.error('添加標籤失敗:', error)
    const errorMsg = error.response?.data?.detail || '添加標籤失敗'
    alert(`添加標籤失敗：${errorMsg}`)
  } finally {
    addingTagToStudent.value = false
  }
}

// 從學生移除標籤
const removeStudentFromTag = async (student, tag) => {
  if (!confirm(`確定要從「${student.name}」移除標籤「${tag.name}」嗎？`)) {
    return
  }
  
  try {
    await studentGroupAPI.removeStudents(tag.group_id, [student.id])
    alert('標籤移除成功')
    // 重新獲取學生列表以更新標籤
    const queryString = new URLSearchParams(route.query).toString()
    await fetchStudents(queryString)
  } catch (error) {
    console.error('移除標籤失敗:', error)
    alert('移除標籤失敗，請稍後再試')
  }
}

// 處理顯示已刪除選項的變更
const handleShowDeletedChange = () => {
  const queryString = new URLSearchParams(route.query).toString()
  fetchStudents(queryString)
}

onMounted(() => {
  fetchCurrentUser()
  syncFiltersFromRoute()
  const queryString = new URLSearchParams(route.query).toString()
  fetchStudents(queryString)
  fetchCourses()
  fetchTags() // 獲取標籤列表
})
</script>

