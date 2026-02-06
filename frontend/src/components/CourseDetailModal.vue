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
                {{ course?.course_name }} - {{ isTeacher ? '課程管理' : '課程文件' }}
              </h3>
              
              <div class="mt-4">
                <!-- 操作按鈕區（僅老師可見） -->
                <div v-if="isTeacher" class="flex gap-2 mb-4">
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
                    <div v-if="allResources.length === 0" class="text-center text-gray-500 py-8">
                      暫無教學資源
                    </div>
                    <div v-for="resource in allResources" :key="resource.id" class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div class="flex justify-between items-start">
                        <div class="flex-1">
                          <div class="flex items-center gap-2">
                            <h4 class="text-lg font-medium text-gray-900">{{ resource.display_title || resource.title }}</h4>
                            <span 
                              class="px-2 py-1 text-xs font-semibold rounded-full"
                              :class="resource.type === 'pdf' ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'"
                            >
                              {{ resource.type === 'pdf' ? 'PDF 講義' : getModeDisplay(resource.mode) }}
                            </span>
                            <!-- PDF 專屬標籤 -->
                            <span 
                              v-if="resource.type === 'pdf' && resource.allow_download" 
                              class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700"
                            >
                              可下載
                            </span>
                            <span 
                              v-if="resource.type === 'pdf' && resource.is_visible_to_all" 
                              class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700"
                            >
                              所有學生可見
                            </span>
                          </div>
                          <p class="text-sm text-gray-500 mt-1">建立時間：{{ formatDate(resource.display_created_at || resource.created_at) }}</p>
                          <p v-if="resource.type === 'learning_resource' && resource.course_names && resource.course_names.length > 0" class="text-sm text-gray-600 mt-1">
                            所屬課程：{{ resource.course_names.join('、') }}
                          </p>
                          <p v-if="resource.type === 'pdf' && resource.description" class="text-sm text-gray-600 mt-1">
                            {{ resource.description }}
                          </p>
                          <p v-if="resource.type === 'pdf'" class="text-xs text-gray-400 mt-1">
                            檔案大小：{{ formatFileSize(resource.file_size) }}
                          </p>
                        </div>
                        <div class="flex flex-wrap gap-2">
                          <!-- 教學資源操作 -->
                          <template v-if="resource.type === 'learning_resource'">
                            <button @click="viewResource(resource)" class="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-indigo-100">
                              查看
                            </button>
                            <template v-if="isTeacher">
                              <button @click="editResource(resource)" class="bg-sky-50 text-sky-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-sky-100">
                                編輯
                              </button>
                              <button @click="unbindResource(resource)" class="bg-amber-50 text-amber-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-amber-100">
                                解除綁定
                              </button>
                              <button @click="deleteResource(resource)" class="bg-rose-50 text-rose-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-rose-100">
                                刪除
                              </button>
                            </template>
                          </template>
                          
                          <!-- PDF 操作 -->
                          <template v-if="resource.type === 'pdf'">
                            <button @click="viewPdf(resource)" class="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-indigo-100">
                              檢視 PDF
                            </button>
                            <button 
                              v-if="resource.allow_download" 
                              @click="downloadPdf(resource)" 
                              class="bg-green-50 text-green-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-green-100"
                            >
                              下載
                            </button>
                            <template v-if="isTeacher">
                              <button @click="togglePdfDownload(resource)" class="bg-purple-50 text-purple-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-purple-100">
                                {{ resource.allow_download ? '禁止下載' : '允許下載' }}
                              </button>
                              <button @click="deletePdf(resource)" class="bg-rose-50 text-rose-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-rose-100">
                                刪除
                              </button>
                            </template>
                          </template>
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
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">新增教學資源</h3>
            <div class="space-y-4">
              <!-- 資源類型選擇 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">資源類型</label>
                <select
                  v-model="resourceType"
                  class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="learning_resource">教學資源 (編輯器)</option>
                  <option value="pdf">PDF 講義</option>
                </select>
              </div>

              <!-- 教學資源選項 -->
              <template v-if="resourceType === 'learning_resource'">
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
              </template>

              <!-- PDF 上傳選項 -->
              <template v-if="resourceType === 'pdf'">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">PDF 標題</label>
                  <input
                    v-model="newPdf.title"
                    type="text"
                    class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="請輸入 PDF 標題"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">描述 (選填)</label>
                  <textarea
                    v-model="newPdf.description"
                    class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    rows="2"
                    placeholder="請輸入描述"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">選擇 PDF 檔案</label>
                  <input
                    ref="pdfFileInput"
                    type="file"
                    accept=".pdf,application/pdf"
                    @change="handlePdfFileChange"
                    class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  <p class="mt-1 text-xs text-gray-500">
                    僅支援 PDF 格式，檔案大小不超過 20MB
                  </p>
                  <p v-if="selectedPdfFile" class="mt-2 text-sm text-green-600">
                    已選擇: {{ selectedPdfFile.name }} ({{ formatFileSize(selectedPdfFile.size) }})
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">可見性設定</label>
                  <div class="space-y-2">
                    <label class="flex items-center">
                      <input
                        v-model="newPdf.isVisibleToAll"
                        type="checkbox"
                        class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span class="ml-2 text-sm text-gray-700">所有報名學生可見</span>
                    </label>
                    
                    <div v-if="!newPdf.isVisibleToAll" class="ml-6">
                      <label class="block text-sm font-medium text-gray-700 mb-1">選擇可見的學生群組</label>
                      <select
                        v-model="newPdf.studentGroupIds"
                        multiple
                        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        size="4"
                      >
                        <option v-for="group in studentGroups" :key="group.group_id" :value="group.group_id">
                          {{ group.name }}
                        </option>
                      </select>
                      <p class="mt-1 text-xs text-gray-500">按住 Ctrl/Cmd 可多選</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="flex items-center">
                    <input
                      v-model="newPdf.allowDownload"
                      type="checkbox"
                      class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span class="ml-2 text-sm text-gray-700">允許學生下載 (預設只能線上檢視)</span>
                  </label>
                </div>
              </template>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="createResource"
              :disabled="resourceType === 'learning_resource' ? !newResource.title : !newPdf.title || !selectedPdfFile"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ resourceType === 'pdf' ? '上傳' : '創建' }}
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

    <!-- PDF 檢視器 Modal -->
    <PdfViewerModal
      :is-open="showPdfViewerModal"
      :pdf="selectedPdf"
      :course-id="(course?.course_id || course?.id) as number"
      @close="closePdfViewer"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, type Ref } from 'vue'
import { learningResourceAPI, courseAPI, coursePdfAPI, studentGroupAPI, type CoursePdf } from '../services/api'
import type { Course, LearningResource } from '@9jang/shared'
import type { TiptapDocument } from '@9jang/shared'
import PdfViewerModal from './PdfViewerModal.vue'

type ResourceMode = 'HANDOUT' | 'ONLINE_QUIZ' | 'LEETCODE' | 'LISTENING_TEST' | 'FLASHCARD'

interface Resource extends Partial<LearningResource> {
  resource_id: number
  title: string
  mode: ResourceMode
  created_at?: string
  course_names?: string[]
  courses?: number[]
  [key: string]: unknown
}

interface NewResource {
  title: string
  mode: ResourceMode
}

interface Props {
  isOpen: boolean
  course: Course & { course_id?: number; id?: number; course_name?: string }
  isTeacher?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isTeacher: false
})

interface Emits {
  (e: 'close'): void
}

const emit = defineEmits<Emits>()

const loading: Ref<boolean> = ref(false)
const resources: Ref<Resource[]> = ref([])
const pdfs: Ref<CoursePdf[]> = ref([])
const showCreateResourceModal: Ref<boolean> = ref(false)
const showBindResourceModal: Ref<boolean> = ref(false)
const loadingAvailableResources: Ref<boolean> = ref(false)
const availableResources: Ref<Resource[]> = ref([])
const studentGroups: Ref<any[]> = ref([])

// 資源類型選擇
const resourceType: Ref<'learning_resource' | 'pdf'> = ref('learning_resource')

const newResource: Ref<NewResource> = ref({
  title: '',
  mode: 'HANDOUT'
})

// PDF 相關狀態
const selectedPdfFile: Ref<File | null> = ref(null)
const pdfFileInput: Ref<HTMLInputElement | null> = ref(null)
const showPdfViewerModal: Ref<boolean> = ref(false)
const selectedPdf: Ref<CoursePdf | null> = ref(null)

interface NewPdf {
  title: string
  description: string
  isVisibleToAll: boolean
  studentGroupIds: number[]
  allowDownload: boolean
}

const newPdf: Ref<NewPdf> = ref({
  title: '',
  description: '',
  isVisibleToAll: true,
  studentGroupIds: [],
  allowDownload: false
})

const modeDisplayMap: Record<string, string> = {
  HANDOUT: '講義模式',
  ONLINE_QUIZ: '線上測驗模式',
  LEETCODE: '程式題模式',
  LISTENING_TEST: '聽力測驗模式',
  FLASHCARD: '單字卡模式'
}

const getModeDisplay = (mode: string): string => {
  return modeDisplayMap[mode] || mode
}

const fetchData = async (): Promise<void> => {
  if (!props.course) return

  loading.value = true
  try {
    const courseId = (props.course.course_id || props.course.id) as number

    // 並行獲取教學資源和 PDF
    const [resourcesRes, pdfsRes] = await Promise.all([
      courseAPI.getResources(courseId),
      courseAPI.getPdfs(courseId)
    ])

    const resourcesData = resourcesRes.data as Resource[] | { results?: Resource[] }
    resources.value = Array.isArray(resourcesData) ? resourcesData : (resourcesData as { results?: Resource[] }).results || []

    const pdfsData = pdfsRes.data as CoursePdf[] | { results?: CoursePdf[] }
    pdfs.value = Array.isArray(pdfsData) ? pdfsData : (pdfsData as { results?: CoursePdf[] }).results || []
  } catch (error) {
    console.error('Error fetching course data:', error)
    resources.value = []
    pdfs.value = []
  } finally {
    loading.value = false
  }
}

const fetchAvailableResources = async (): Promise<void> => {
  loadingAvailableResources.value = true
  try {
    // 獲取所有自己的教學資源（不限定課程）
    const res = await learningResourceAPI.getAll()
    const allResources = Array.isArray(res.data)
      ? res.data
      : (res.data as { results?: Resource[] }).results || []

    // 過濾出未綁定到當前課程的資源
    const courseId = (props.course.course_id || props.course.id) as number
    availableResources.value = (allResources as Resource[]).filter((r) => {
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

// 獲取學生群組
const fetchStudentGroups = async (): Promise<void> => {
  try {
    const res = await studentGroupAPI.getAll()
    const groupsData = res.data as any[] | { results?: any[] }
    studentGroups.value = Array.isArray(groupsData) ? groupsData : (groupsData as { results?: any[] }).results || []
  } catch (error) {
    console.error('Error fetching student groups:', error)
    studentGroups.value = []
  }
}

// 處理 PDF 檔案選擇
const handlePdfFileChange = (event: Event): void => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) {
    selectedPdfFile.value = null
    return
  }
  
  // 驗證檔案類型
  if (file.type !== 'application/pdf') {
    alert('請選擇 PDF 檔案')
    target.value = ''
    return
  }
  
  // 驗證檔案大小 (20MB)
  if (file.size > 20 * 1024 * 1024) {
    alert('PDF 檔案大小不能超過 20MB')
    target.value = ''
    return
  }
  
  selectedPdfFile.value = file
}

// 格式化檔案大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// 重置 PDF 表單
const resetPdfForm = (): void => {
  newPdf.value = {
    title: '',
    description: '',
    isVisibleToAll: true,
    studentGroupIds: [],
    allowDownload: false
  }
  selectedPdfFile.value = null
  if (pdfFileInput.value) {
    pdfFileInput.value.value = ''
  }
}

// 合併所有資源（教學資源 + PDF）
const allResources = computed(() => {
  const learningResources = resources.value.map(r => ({ 
    ...r, 
    type: 'learning_resource', 
    id: `lr_${r.resource_id}`,
    display_title: r.title,
    display_created_at: r.created_at
  }))
  
  const pdfResources = pdfs.value.map(p => ({ 
    ...p, 
    type: 'pdf', 
    id: `pdf_${p.pdf_id}`,
    display_title: p.title,
    display_created_at: p.created_at,
    resource_id: p.pdf_id
  }))
  
  return [...learningResources, ...pdfResources].sort((a, b) => 
    new Date(b.display_created_at || 0).getTime() - new Date(a.display_created_at || 0).getTime()
  )
})

// 同時監聽 isOpen 和 course，確保兩者都準備好時才載入數據
watch(
  () => [props.isOpen, props.course],
  ([newIsOpen, _newCourse]) => {
    if (newIsOpen && props.course) {
      fetchData()
    } else if (!newIsOpen) {
      // Reset state when closed
      resources.value = []
      pdfs.value = []
      showCreateResourceModal.value = false
      showBindResourceModal.value = false
      newResource.value = { title: '', mode: 'HANDOUT' }
      resetPdfForm()
      resourceType.value = 'learning_resource'
    }
  },
  { immediate: true }
)

watch(
  () => showBindResourceModal.value,
  (newVal) => {
    if (newVal) {
      fetchAvailableResources()
    }
  }
)

watch(
  () => showCreateResourceModal.value,
  (newVal) => {
    if (newVal) {
      fetchStudentGroups()
    }
  }
)

const close = (): void => {
  emit('close')
}

const formatDate = (dateString: string | unknown): string => {
  if (!dateString) return ''
  return new Date(dateString as string).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const createResource = async (): Promise<void> => {
  if (resourceType.value === 'pdf') {
    await uploadPdf()
  } else {
    await createLearningResource()
  }
}

// 原有的教學資源創建邏輯
const createLearningResource = async (): Promise<void> => {
  if (!newResource.value.title) {
    alert('請輸入標題')
    return
  }

  try {
    const courseId = (props.course.course_id || props.course.id) as number

    await learningResourceAPI.create({
      title: newResource.value.title,
      mode: newResource.value.mode,
      course_ids: [courseId],
      tiptap_structure: {
        type: 'doc',
        content: [{ type: 'paragraph', content: [] }]
      } as TiptapDocument,
      settings: {}
    })

    alert('創建成功')
    showCreateResourceModal.value = false
    newResource.value = { title: '', mode: 'HANDOUT' }
    resourceType.value = 'learning_resource'
    fetchData()
  } catch (error) {
    console.error('創建教學資源失敗:', error)
    alert('創建失敗，請稍後再試')
  }
}

// 新增的 PDF 上傳邏輯
const uploadPdf = async (): Promise<void> => {
  if (!newPdf.value.title) {
    alert('請輸入 PDF 標題')
    return
  }
  
  if (!selectedPdfFile.value) {
    alert('請選擇 PDF 檔案')
    return
  }
  
  if (!newPdf.value.isVisibleToAll && newPdf.value.studentGroupIds.length === 0) {
    alert('請選擇至少一個學生群組，或勾選「所有報名學生可見」')
    return
  }

  try {
    const courseId = (props.course.course_id || props.course.id) as number
    
    await coursePdfAPI.upload(courseId, selectedPdfFile.value, {
      title: newPdf.value.title,
      description: newPdf.value.description,
      is_visible_to_all: newPdf.value.isVisibleToAll,
      allow_download: newPdf.value.allowDownload,
      student_group_ids: newPdf.value.studentGroupIds
    })

    alert('PDF 上傳成功!')
    showCreateResourceModal.value = false
    resetPdfForm()
    resourceType.value = 'learning_resource'
    fetchData()
  } catch (error) {
    console.error('上傳 PDF 失敗:', error)
    alert('上傳失敗，請稍後再試')
  }
}

const bindResource = async (resource: Resource): Promise<void> => {
  try {
    const courseId = (props.course.course_id || props.course.id) as number
    await learningResourceAPI.bindToCourse(resource.resource_id, courseId, 'add')

    alert('綁定成功')
    showBindResourceModal.value = false
    fetchData()
  } catch (error) {
    console.error('綁定資源失敗:', error)
    alert('綁定失敗，請稍後再試')
  }
}

const unbindResource = async (resource: Resource): Promise<void> => {
  if (!confirm(`確定要從此課程解除綁定「${resource.title}」嗎？`)) {
    return
  }

  try {
    const courseId = (props.course.course_id || props.course.id) as number

    await learningResourceAPI.bindToCourse(resource.resource_id, courseId, 'remove')

    alert('解除綁定成功')
    fetchData()
  } catch (error) {
    console.error('解除綁定失敗:', error)
    alert('解除綁定失敗，請稍後再試')
  }
}

const viewResource = (resource: Resource): void => {
  // 導航到資源查看頁面
  window.location.href = `/resources/view/${resource.resource_id}`
}

const editResource = (resource: Resource): void => {
  // 導航到資源編輯頁面
  window.location.href = `/resources/edit/${resource.resource_id}`
}

const deleteResource = async (resource: Resource): Promise<void> => {
  if (!confirm(`確定要刪除「${resource.title}」嗎？此操作無法復原！`)) {
    return
  }

  try {
    await learningResourceAPI.delete(resource.resource_id)
    alert('刪除成功')
    fetchData()
  } catch (error) {
    console.error('刪除教學資源失敗:', error)
    const axiosError = error as { response?: { status?: number } }
    if (axiosError.response?.status === 403) {
      alert('您沒有權限刪除此資源')
    } else {
      alert('刪除失敗，請稍後再試')
    }
  }
}

// PDF 相關操作
const viewPdf = (pdf: any): void => {
  selectedPdf.value = pdf as CoursePdf
  showPdfViewerModal.value = true
}

const closePdfViewer = (): void => {
  showPdfViewerModal.value = false
  selectedPdf.value = null
}

const downloadPdf = (pdf: any): void => {
  const courseId = (props.course.course_id || props.course.id) as number
  const downloadUrl = coursePdfAPI.getDownloadUrl(courseId, pdf.pdf_id)
  window.open(downloadUrl, '_blank')
}

const togglePdfDownload = async (pdf: any): Promise<void> => {
  try {
    const courseId = (props.course.course_id || props.course.id) as number
    await coursePdfAPI.toggleDownload(courseId, pdf.pdf_id, !pdf.allow_download)
    alert(`已${pdf.allow_download ? '禁止' : '允許'}下載`)
    fetchData()
  } catch (error) {
    console.error('切換下載權限失敗:', error)
    alert('操作失敗，請稍後再試')
  }
}

const deletePdf = async (pdf: any): Promise<void> => {
  if (!confirm(`確定要刪除 PDF「${pdf.title}」嗎？此操作無法復原！`)) {
    return
  }

  try {
    const courseId = (props.course.course_id || props.course.id) as number
    await coursePdfAPI.delete(courseId, pdf.pdf_id)
    alert('刪除成功')
    fetchData()
  } catch (error) {
    console.error('刪除 PDF 失敗:', error)
    const axiosError = error as { response?: { status?: number } }
    if (axiosError.response?.status === 403) {
      alert('您沒有權限刪除此 PDF')
    } else {
      alert('刪除失敗，請稍後再試')
    }
  }
}
</script>
