<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="close"></div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                {{ course?.course_name }} - 課程管理
              </h3>
              
              <div class="mt-4">
                <!-- 操作按鈕區 -->
                <div class="flex gap-2 mb-4">
                  <button
                    @click="showCreateResourceModal = true"
                    class="bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-600"
                  >
                    新增教學資源
                  </button>
                  <button
                    @click="showBindResourceModal = true"
                    class="bg-green-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-600"
                  >
                    從已有資源綁定
                  </button>
                </div>

                <!-- Content -->
                <div class="min-h-[400px]">
                  <!-- Loading State -->
                  <div v-if="loading" class="flex justify-center items-center h-64">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>

                  <!-- 教學資源列表 -->
                  <div v-else class="space-y-4">
                    <div v-if="resources.length === 0" class="text-center text-gray-500 py-8">
                      暫無教學資源
                    </div>
                    <div v-for="resource in resources" :key="resource.resource_id" class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div class="flex justify-between items-start">
                        <div class="flex-1">
                          <div class="flex items-center gap-2">
                            <h4 class="text-lg font-medium text-gray-900">{{ resource.title }}</h4>
                            <span class="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700">
                              {{ getModeDisplay(resource.mode) }}
                            </span>
                          </div>
                          <p class="text-sm text-gray-500 mt-1">建立時間：{{ formatDate(resource.created_at) }}</p>
                          <p v-if="resource.course_names && resource.course_names.length > 0" class="text-sm text-gray-600 mt-1">
                            所屬課程：{{ resource.course_names.join('、') }}
                          </p>
                        </div>
                        <div class="flex gap-2">
                          <button @click="viewResource(resource)" class="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-indigo-100">
                            查看
                          </button>
                          <button @click="editResource(resource)" class="bg-sky-50 text-sky-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-sky-100">
                            編輯
                          </button>
                          <button @click="unbindResource(resource)" class="bg-amber-50 text-amber-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-amber-100">
                            解除綁定
                          </button>
                          <button @click="deleteResource(resource)" class="bg-rose-50 text-rose-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-rose-100">
                            刪除
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" @click="close">
            關閉
          </button>
        </div>
      </div>
    </div>

    <!-- 新增教學資源 Modal -->
    <div v-if="showCreateResourceModal" class="fixed inset-0 z-[60] overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showCreateResourceModal = false"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">新增教學資源</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">標題</label>
                <input
                  v-model="newResource.title"
                  type="text"
                  class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="請輸入標題"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">模式類型</label>
                <select
                  v-model="newResource.mode"
                  class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="HANDOUT">講義模式</option>
                  <option value="ONLINE_QUIZ">線上測驗模式</option>
                  <option value="LEETCODE">程式題模式</option>
                  <option value="LISTENING_TEST">聽力測驗模式</option>
                  <option value="FLASHCARD">單字卡模式</option>
                </select>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="createResource"
              :disabled="!newResource.title"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              創建
            </button>
            <button
              @click="showCreateResourceModal = false"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 綁定已有資源 Modal -->
    <div v-if="showBindResourceModal" class="fixed inset-0 z-[60] overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showBindResourceModal = false"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">從已有資源綁定</h3>
            <div v-if="loadingAvailableResources" class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
            <div v-else class="space-y-2 max-h-96 overflow-y-auto">
              <div v-if="availableResources.length === 0" class="text-center text-gray-500 py-8">
                沒有可綁定的教學資源
              </div>
              <div
                v-for="resource in availableResources"
                :key="resource.resource_id"
                @click="bindResource(resource)"
                class="border rounded-lg p-3 hover:bg-indigo-50 cursor-pointer transition-colors"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium text-gray-900">{{ resource.title }}</p>
                    <p class="text-sm text-gray-500">{{ getModeDisplay(resource.mode) }}</p>
                  </div>
                  <button class="text-indigo-600 hover:text-indigo-700">
                    選擇
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="showBindResourceModal = false"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              關閉
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { learningResourceAPI } from '../services/api'
import axios from 'axios'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  course: {
    type: Object,
    required: true
  },
  isTeacher: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const loading = ref(false)
const resources = ref([])
const showCreateResourceModal = ref(false)
const showBindResourceModal = ref(false)
const loadingAvailableResources = ref(false)
const availableResources = ref([])

const newResource = ref({
  title: '',
  mode: 'HANDOUT'
})

const modeDisplayMap = {
  'HANDOUT': '講義模式',
  'ONLINE_QUIZ': '線上測驗模式',
  'LEETCODE': '程式題模式',
  'LISTENING_TEST': '聽力測驗模式',
  'FLASHCARD': '單字卡模式'
}

const getModeDisplay = (mode) => {
  return modeDisplayMap[mode] || mode
}

const fetchData = async () => {
  if (!props.course) return
  
  loading.value = true
  try {
    const courseId = props.course.course_id || props.course.id
    
    // Fetch resources (使用 course query param)
    const resourcesRes = await learningResourceAPI.getAll({ course: courseId })
    const resourcesData = resourcesRes.data.results || resourcesRes.data
    resources.value = Array.isArray(resourcesData) ? resourcesData : []
  } catch (error) {
    console.error('Error fetching course data:', error)
    resources.value = []
  } finally {
    loading.value = false
  }
}

const fetchAvailableResources = async () => {
  loadingAvailableResources.value = true
  try {
    // 獲取所有自己的教學資源（不限定課程）
    const res = await learningResourceAPI.getAll()
    const allResources = res.data.results || res.data
    
    // 過濾出未綁定到當前課程的資源
    const courseId = props.course.course_id || props.course.id
    availableResources.value = allResources.filter(r => {
      // 如果資源沒有綁定課程，或者沒有綁定到當前課程
      return !r.courses || !r.courses.includes(courseId)
    })
  } catch (error) {
    console.error('Error fetching available resources:', error)
    availableResources.value = []
  } finally {
    loadingAvailableResources.value = false
  }
}

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    fetchData()
  } else {
    // Reset state when closed
    resources.value = []
    showCreateResourceModal.value = false
    showBindResourceModal.value = false
    newResource.value = { title: '', mode: 'HANDOUT' }
  }
})

watch(() => showBindResourceModal.value, (newVal) => {
  if (newVal) {
    fetchAvailableResources()
  }
})

const close = () => {
  emit('close')
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const createResource = async () => {
  if (!newResource.value.title) {
    alert('請輸入標題')
    return
  }
  
  try {
    const courseId = props.course.course_id || props.course.id
    
    await learningResourceAPI.create({
      title: newResource.value.title,
      mode: newResource.value.mode,
      course_ids: [courseId],
      structure: [],
      settings: {}
    })
    
    alert('創建成功')
    showCreateResourceModal.value = false
    newResource.value = { title: '', mode: 'HANDOUT' }
    fetchData()
  } catch (error) {
    console.error('創建教學資源失敗:', error)
    alert('創建失敗，請稍後再試')
  }
}

const bindResource = async (resource) => {
  try {
    const courseId = props.course.course_id || props.course.id
    
    await axios.post(
      `/api/resources/${resource.resource_id}/bind-to-course/`,
      {
        course_id: courseId,
        action: 'add'
      }
    )
    
    alert('綁定成功')
    showBindResourceModal.value = false
    fetchData()
  } catch (error) {
    console.error('綁定資源失敗:', error)
    alert('綁定失敗，請稍後再試')
  }
}

const unbindResource = async (resource) => {
  if (!confirm(`確定要從此課程解除綁定「${resource.title}」嗎？`)) {
    return
  }
  
  try {
    const courseId = props.course.course_id || props.course.id
    
    await axios.post(
      `/api/resources/${resource.resource_id}/bind-to-course/`,
      {
        course_id: courseId,
        action: 'remove'
      }
    )
    
    alert('解除綁定成功')
    fetchData()
  } catch (error) {
    console.error('解除綁定失敗:', error)
    alert('解除綁定失敗，請稍後再試')
  }
}

const viewResource = (resource) => {
  // 導航到資源查看頁面
  window.location.href = `/resources/view/${resource.resource_id}`
}

const editResource = (resource) => {
  // 導航到資源編輯頁面
  window.location.href = `/resources/edit/${resource.resource_id}`
}

const deleteResource = async (resource) => {
  if (!confirm(`確定要刪除「${resource.title}」嗎？此操作無法復原！`)) {
    return
  }
  
  try {
    await learningResourceAPI.delete(resource.resource_id)
    alert('刪除成功')
    fetchData()
  } catch (error) {
    console.error('刪除教學資源失敗:', error)
    if (error.response?.status === 403) {
      alert('您沒有權限刪除此資源')
    } else {
      alert('刪除失敗，請稍後再試')
    }
  }
}
</script>
