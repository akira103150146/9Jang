<template>
  <div class="space-y-6">
    <header class="rounded-3xl border border-blue-100 bg-gradient-to-r from-white to-sky-50 p-6 shadow-sm">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-semibold text-slate-500">權限管理</p>
          <h2 class="text-2xl font-bold text-slate-900">角色與權限設定</h2>
          <p class="mt-2 text-sm text-slate-500">管理系統角色及其可訪問的頁面和 API</p>
        </div>
        <button
          @click="openCreateModal"
          class="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-md hover:from-sky-600 hover:to-indigo-600"
        >
          新增角色
        </button>
      </div>
    </header>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <p class="text-slate-500">載入中...</p>
    </div>

    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="role in roles"
        :key="role.id"
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition"
      >
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-lg font-bold text-slate-900">{{ role.name }}</h3>
            <p class="text-sm text-slate-500 mt-1">{{ role.description || '無描述' }}</p>
          </div>
          <span
            class="rounded-full px-3 py-1 text-xs font-semibold"
            :class="role.is_active ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-600'"
          >
            {{ role.is_active ? '啟用' : '停用' }}
          </span>
        </div>
        
        <div class="mb-4">
          <p class="text-xs text-slate-500 mb-2">權限數量：{{ role.permission_count || 0 }}</p>
          <div class="space-y-1">
            <div
              v-for="perm in role.permissions.slice(0, 3)"
              :key="perm.id"
              class="text-xs text-slate-600"
            >
              <span class="font-semibold">{{ perm.permission_type_display }}:</span>
              <span class="ml-1">{{ perm.resource }}</span>
              <span v-if="perm.method" class="ml-1 text-slate-400">[{{ perm.method }}]</span>
            </div>
            <p v-if="role.permissions.length > 3" class="text-xs text-slate-400">
              還有 {{ role.permissions.length - 3 }} 個權限...
            </p>
          </div>
        </div>

        <div class="flex gap-2">
          <button
            @click="openEditModal(role)"
            class="flex-1 rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-600"
          >
            編輯
          </button>
          <button
            @click="openPermissionModal(role)"
            class="flex-1 rounded-full bg-indigo-500 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-600"
          >
            權限
          </button>
          <!-- 註解：刪除功能已禁用，避免誤刪導致資料庫錯誤 -->
          <!-- 唯一刪除方式是透過 flush_db 指令 -->
          <!-- <button
            @click="deleteRole(role.id, role.name)"
            class="rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-600"
          >
            刪除
          </button> -->
        </div>
      </div>

      <div v-if="roles.length === 0" class="col-span-full text-center py-12 text-slate-500">
        目前沒有角色，請新增第一個角色。
      </div>
    </div>

    <!-- 創建/編輯角色模態框 -->
    <div
      v-if="showRoleModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="closeRoleModal"
    >
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 class="text-xl font-bold text-slate-900 mb-4">
          {{ editingRole ? '編輯角色' : '新增角色' }}
        </h3>
        <form @submit.prevent="saveRole">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">角色名稱</label>
              <input
                v-model="roleForm.name"
                type="text"
                required
                class="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-sky-500 focus:outline-none"
                placeholder="例如：會計、助教"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">描述</label>
              <textarea
                v-model="roleForm.description"
                rows="3"
                class="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-sky-500 focus:outline-none"
                placeholder="角色描述..."
              />
            </div>
            <div>
              <label class="flex items-center gap-2">
                <input
                  v-model="roleForm.is_active"
                  type="checkbox"
                  class="rounded border-slate-300"
                />
                <span class="text-sm font-semibold text-slate-700">啟用此角色</span>
              </label>
            </div>
          </div>
          <div class="mt-6 flex gap-3">
            <button
              type="button"
              @click="closeRoleModal"
              class="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="submit"
              class="flex-1 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:from-sky-600 hover:to-indigo-600"
            >
              儲存
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 權限設定模態框 -->
    <div
      v-if="showPermissionModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto"
      @click.self="closePermissionModal"
    >
      <div class="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl my-8">
        <h3 class="text-xl font-bold text-slate-900 mb-4">
          設定權限：{{ selectedRole?.name }}
        </h3>
        
        <div class="mb-6">
          <div class="flex gap-2 mb-4">
            <button
              @click="activeTab = 'page'"
              class="rounded-full px-4 py-2 text-sm font-semibold transition"
              :class="activeTab === 'page' 
                ? 'bg-sky-500 text-white' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
            >
              頁面權限
            </button>
            <button
              @click="activeTab = 'api'"
              class="rounded-full px-4 py-2 text-sm font-semibold transition"
              :class="activeTab === 'api' 
                ? 'bg-sky-500 text-white' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
            >
              API 權限
            </button>
          </div>

          <!-- 頁面權限 -->
          <div v-if="activeTab === 'page'" class="space-y-3">
            <div
              v-for="page in availablePages"
              :key="page.path"
              class="flex items-center justify-between rounded-lg border border-slate-200 p-3"
            >
              <div>
                <p class="font-semibold text-slate-900">{{ page.title }}</p>
                <p class="text-xs text-slate-500">{{ page.path }}</p>
              </div>
              <input
                type="checkbox"
                :checked="isPageSelected(page.path)"
                @change="togglePagePermission(page.path)"
                class="rounded border-slate-300"
              />
            </div>
          </div>

          <!-- API 權限 -->
          <div v-if="activeTab === 'api'" class="space-y-3">
            <div
              v-for="api in availableAPIs"
              :key="`${api.path}-${api.method}`"
              class="flex items-center justify-between rounded-lg border border-slate-200 p-3"
            >
              <div>
                <p class="font-semibold text-slate-900">{{ api.name }}</p>
                <p class="text-xs text-slate-500">{{ api.path }}</p>
              </div>
              <input
                type="checkbox"
                :checked="isAPISelected(api.path, api.method)"
                @change="toggleAPIPermission(api.path, api.method)"
                class="rounded border-slate-300"
              />
            </div>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="closePermissionModal"
            class="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            取消
          </button>
          <button
            @click="savePermissions"
            class="flex-1 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:from-sky-600 hover:to-indigo-600"
          >
            儲存權限
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { roleAPI } from '../services/api'

const roles = ref([])
const loading = ref(false)
const showRoleModal = ref(false)
const showPermissionModal = ref(false)
const editingRole = ref(null)
const selectedRole = ref(null)
const activeTab = ref('page')

const roleForm = ref({
  name: '',
  description: '',
  is_active: true
})

// 可用的頁面列表
const availablePages = ref([
  { path: '/', title: '儀表板' },
  { path: '/students', title: '學生資訊' },
  { path: '/teachers', title: '老師管理' },
  { path: '/courses', title: '課程管理' },
  { path: '/enrollments', title: '課程報名' },
  { path: '/attendance', title: '出缺勤' },
  { path: '/questions', title: '題庫系統' },
  { path: '/lunch-orders', title: '訂便當系統' },
])

// 可用的 API 列表
const availableAPIs = ref([
  { path: '/api/cramschool/students/', method: 'GET', name: '查看學生列表' },
  { path: '/api/cramschool/students/', method: 'POST', name: '新增學生' },
  { path: '/api/cramschool/students/', method: 'PUT', name: '更新學生' },
  { path: '/api/cramschool/students/', method: 'DELETE', name: '刪除學生' },
  { path: '/api/cramschool/teachers/', method: 'GET', name: '查看老師列表' },
  { path: '/api/cramschool/teachers/', method: 'POST', name: '新增老師' },
  { path: '/api/cramschool/teachers/', method: 'PUT', name: '更新老師' },
  { path: '/api/cramschool/teachers/', method: 'DELETE', name: '刪除老師' },
  { path: '/api/cramschool/courses/', method: 'GET', name: '查看課程列表' },
  { path: '/api/cramschool/courses/', method: 'POST', name: '新增課程' },
  { path: '/api/cramschool/courses/', method: 'PUT', name: '更新課程' },
  { path: '/api/cramschool/courses/', method: 'DELETE', name: '刪除課程' },
])

const selectedPermissions = ref([])

const fetchRoles = async () => {
  loading.value = true
  try {
    const response = await roleAPI.getAll()
    roles.value = response.data.results || response.data
  } catch (error) {
    console.error('獲取角色失敗:', error)
    alert('獲取角色失敗，請稍後再試')
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  editingRole.value = null
  roleForm.value = { name: '', description: '', is_active: true }
  showRoleModal.value = true
}

const openEditModal = (role) => {
  editingRole.value = role
  roleForm.value = {
    name: role.name,
    description: role.description || '',
    is_active: role.is_active
  }
  showRoleModal.value = true
}

const closeRoleModal = () => {
  showRoleModal.value = false
  editingRole.value = null
  roleForm.value = { name: '', description: '', is_active: true }
}

const saveRole = async () => {
  try {
    if (editingRole.value) {
      await roleAPI.update(editingRole.value.id, roleForm.value)
    } else {
      await roleAPI.create(roleForm.value)
    }
    alert('儲存成功')
    closeRoleModal()
    fetchRoles()
  } catch (error) {
    console.error('儲存角色失敗:', error)
    alert('儲存失敗，請稍後再試')
  }
}

const deleteRole = async (id, name) => {
  if (!confirm(`確定要刪除角色「${name}」嗎？`)) {
    return
  }
  try {
    await roleAPI.delete(id)
    alert('刪除成功')
    fetchRoles()
  } catch (error) {
    console.error('刪除角色失敗:', error)
    alert('刪除失敗，請稍後再試')
  }
}

const openPermissionModal = (role) => {
  selectedRole.value = role
  selectedPermissions.value = role.permissions || []
  showPermissionModal.value = true
}

const closePermissionModal = () => {
  showPermissionModal.value = false
  selectedRole.value = null
  selectedPermissions.value = []
}

const isPageSelected = (path) => {
  return selectedPermissions.value.some(
    p => p.permission_type === 'page' && p.resource === path
  )
}

const isAPISelected = (path, method) => {
  return selectedPermissions.value.some(
    p => p.permission_type === 'api' && p.resource === path && p.method === method
  )
}

const togglePagePermission = (path) => {
  const index = selectedPermissions.value.findIndex(
    p => p.permission_type === 'page' && p.resource === path
  )
  if (index >= 0) {
    selectedPermissions.value.splice(index, 1)
  } else {
    selectedPermissions.value.push({
      permission_type: 'page',
      resource: path,
      method: null
    })
  }
}

const toggleAPIPermission = (path, method) => {
  const index = selectedPermissions.value.findIndex(
    p => p.permission_type === 'api' && p.resource === path && p.method === method
  )
  if (index >= 0) {
    selectedPermissions.value.splice(index, 1)
  } else {
    selectedPermissions.value.push({
      permission_type: 'api',
      resource: path,
      method: method
    })
  }
}

const savePermissions = async () => {
  try {
    await roleAPI.updatePermissions(selectedRole.value.id, selectedPermissions.value)
    alert('權限儲存成功')
    closePermissionModal()
    fetchRoles()
  } catch (error) {
    console.error('儲存權限失敗:', error)
    alert('儲存權限失敗，請稍後再試')
  }
}

onMounted(() => {
  fetchRoles()
})
</script>

