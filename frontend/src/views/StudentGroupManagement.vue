<template>
  <div class="space-y-6">
    <header class="rounded-3xl border border-blue-100 bg-gradient-to-r from-white to-indigo-50 p-6 shadow-sm">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-semibold text-slate-500">教學模組</p>
          <h2 class="text-2xl font-bold text-slate-900">學生群組管理</h2>
          <p class="mt-2 text-sm text-slate-500">管理學生群組，用於個別化教學</p>
        </div>
        <button
          @click="openFormModal()"
          class="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-2 text-sm font-semibold text-white shadow-md hover:from-indigo-600 hover:to-purple-600"
        >
          新增群組
        </button>
      </div>
    </header>

    <!-- 載入中 -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-slate-500">載入中...</div>
    </div>

    <!-- 群組列表 -->
    <section v-else class="grid gap-4 lg:grid-cols-2">
      <article
        v-for="group in groups"
        :key="group.group_id"
        class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">
              群組 #{{ group.group_id }}
            </p>
            <h3 class="mt-1 text-lg font-semibold text-slate-900">{{ group.name }}</h3>
            <p v-if="group.description" class="mt-1 text-sm text-slate-600">{{ group.description }}</p>
            <p class="mt-2 text-sm text-slate-500">
              {{ group.students_count }} 位學生
            </p>
            <div v-if="group.student_names && group.student_names.length > 0" class="mt-2">
              <p class="text-xs text-slate-500">學生：{{ group.student_names.join('、') }}</p>
            </div>
          </div>
        </div>
        <div class="mt-4 flex gap-2">
          <button
            @click="openFormModal(group)"
            class="rounded-full bg-indigo-500 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-600"
          >
            編輯
          </button>
          <button
            @click="deleteGroup(group.group_id)"
            class="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-600"
          >
            刪除
          </button>
        </div>
      </article>
      <div v-if="groups.length === 0" class="col-span-2 rounded-3xl border border-slate-100 bg-white p-12 text-center">
        <p class="text-slate-500">目前沒有群組，點擊「新增群組」開始建立。</p>
      </div>
    </section>

    <!-- 表單對話框 -->
    <div
      v-if="showFormModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
      @click.self="closeFormModal"
    >
      <div class="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-slate-900">
            {{ editingGroup ? '編輯群組' : '新增群組' }}
          </h3>
          <button @click="closeFormModal" class="text-slate-400 hover:text-slate-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveGroup" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">群組名稱 *</label>
            <input
              v-model="formData.name"
              type="text"
              required
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">描述</label>
            <textarea
              v-model="formData.description"
              rows="3"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">學生 *</label>
            <div class="border border-slate-300 rounded-lg p-3 max-h-[400px] overflow-y-auto">
              <div v-if="availableStudents.length === 0" class="text-sm text-slate-400 text-center py-4">
                尚無學生，請先到學生管理新增學生
              </div>
              <div v-else class="space-y-2">
                <label
                  v-for="student in availableStudents"
                  :key="student.student_id"
                  class="flex items-start gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    :value="student.student_id"
                    v-model="formData.student_ids"
                    class="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div class="flex-1">
                    <p class="text-sm font-semibold text-slate-900">{{ student.name }}</p>
                    <p class="text-xs text-slate-500">{{ student.school }} - {{ student.grade }}</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="closeFormModal"
              class="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-50"
            >
              {{ saving ? '儲存中...' : '儲存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { studentGroupAPI, studentAPI } from '../services/api'

const groups = ref([])
const availableStudents = ref([])
const loading = ref(false)
const showFormModal = ref(false)
const editingGroup = ref(null)
const saving = ref(false)

const formData = ref({
  name: '',
  description: '',
  student_ids: []
})

const fetchGroups = async () => {
  loading.value = true
  try {
    const response = await studentGroupAPI.getAll()
    groups.value = response.data.results || response.data || []
  } catch (error) {
    console.error('獲取群組失敗：', error)
  } finally {
    loading.value = false
  }
}

const fetchStudents = async () => {
  try {
    const response = await studentAPI.getAll()
    availableStudents.value = response.data.results || response.data || []
  } catch (error) {
    console.error('獲取學生失敗：', error)
  }
}

const openFormModal = (group = null) => {
  editingGroup.value = group
  if (group) {
    formData.value = {
      name: group.name,
      description: group.description || '',
      student_ids: group.students?.map(s => s.student_id) || []
    }
  } else {
    formData.value = {
      name: '',
      description: '',
      student_ids: []
    }
  }
  showFormModal.value = true
}

const closeFormModal = () => {
  showFormModal.value = false
  editingGroup.value = null
}

const saveGroup = async () => {
  saving.value = true
  try {
    if (editingGroup.value) {
      await studentGroupAPI.update(editingGroup.value.group_id, formData.value)
    } else {
      await studentGroupAPI.create(formData.value)
    }
    await fetchGroups()
    closeFormModal()
  } catch (error) {
    console.error('儲存群組失敗：', error)
    alert('儲存失敗，請稍後再試')
  } finally {
    saving.value = false
  }
}

const deleteGroup = async (id) => {
  if (!confirm('確定要刪除這個群組嗎？')) return
  try {
    await studentGroupAPI.delete(id)
    await fetchGroups()
  } catch (error) {
    console.error('刪除群組失敗：', error)
    alert('刪除失敗，請稍後再試')
  }
}

onMounted(() => {
  fetchGroups()
  fetchStudents()
})
</script>


