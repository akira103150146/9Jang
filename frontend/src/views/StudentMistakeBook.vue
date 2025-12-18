<template>
  <div class="space-y-6">
    <header class="rounded-3xl border border-blue-100 bg-gradient-to-r from-white via-sky-50 to-indigo-50 p-6 shadow-sm">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-semibold text-slate-500">學生功能</p>
          <h2 class="text-2xl font-bold text-slate-900">我的錯題本</h2>
          <p class="mt-2 text-sm text-slate-500">可自行新增、編輯與整理錯題筆記（Markdown）</p>
        </div>
        <div class="flex flex-wrap gap-3">
          <button
            @click="openCreate"
            class="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-md hover:from-sky-600 hover:to-indigo-600"
          >
            + 新增筆記
          </button>
        </div>
      </div>
    </header>

    <section class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div class="flex-1">
          <label class="text-xs font-semibold uppercase tracking-widest text-slate-500">搜尋</label>
          <input
            v-model="search"
            type="text"
            class="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            placeholder="依標題/科目/內容關鍵字搜尋"
            @keydown.enter.prevent="fetchNotes"
          />
        </div>
        <div class="flex gap-2">
          <button
            @click="fetchNotes"
            class="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            查詢
          </button>
          <button
            v-if="search"
            @click="clearSearch"
            class="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            清除
          </button>
        </div>
      </div>
    </section>

    <section class="rounded-3xl border border-slate-100 bg-white shadow-sm">
      <div class="p-5 border-b border-slate-100">
        <h3 class="text-lg font-semibold text-slate-900">筆記列表</h3>
        <p class="text-sm text-slate-500">點擊可編輯；刪除後可在「包含已刪除」中復原（如需要可再加 UI）</p>
      </div>

      <div v-if="loading" class="p-12 text-center text-slate-500">載入中...</div>

      <div v-else-if="notes.length === 0" class="p-12 text-center">
        <p class="text-slate-500">目前沒有筆記。</p>
        <button
          @click="openCreate"
          class="mt-4 rounded-full bg-indigo-500 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-600"
        >
          新增第一筆
        </button>
      </div>

      <div v-else class="divide-y divide-slate-100">
        <div
          v-for="note in notes"
          :key="note.note_id"
          class="p-5 hover:bg-slate-50/70 transition cursor-pointer"
          @click="openEdit(note)"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <h4 class="truncate text-base font-semibold text-slate-900">{{ note.title }}</h4>
                <span
                  v-if="note.subject"
                  class="shrink-0 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-600"
                >
                  {{ note.subject }}
                </span>
              </div>
              <div class="mt-2 text-sm text-slate-600 line-clamp-2 whitespace-pre-wrap">
                {{ note.content || '（無內容）' }}
              </div>
              <div class="mt-3 text-xs text-slate-400">
                最後更新：{{ formatDateTime(note.updated_at) }}
              </div>
            </div>
            <div class="flex shrink-0 gap-2">
              <button
                class="rounded-full bg-indigo-500 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-600"
                @click.stop="openView(note)"
              >
                檢視
              </button>
              <button
                class="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                @click.stop="openEdit(note)"
              >
                編輯
              </button>
              <button
                class="rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-600"
                @click.stop="removeNote(note)"
              >
                刪除
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 檢視 Modal -->
    <div
      v-if="showViewModal && selectedNoteForView"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
      @click.self="closeViewModal"
    >
      <div class="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-slate-900">筆記詳情</h3>
          <button @click="closeViewModal" class="text-slate-400 hover:text-slate-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div class="flex items-center gap-3 mb-3">
              <span v-if="selectedNoteForView.subject" class="text-sm text-slate-600">
                {{ selectedNoteForView.subject }}
              </span>
              <span class="text-sm text-slate-600">
                {{ formatDateTime(selectedNoteForView.updated_at) }}
              </span>
            </div>
            <h4 class="text-lg font-semibold text-slate-900 mb-2">{{ selectedNoteForView.title }}</h4>
            <div v-if="selectedNoteForView.content" class="text-sm text-slate-700 mb-3 markdown-preview" v-html="renderMarkdownWithLatex(selectedNoteForView.content)"></div>
            <div v-else class="text-sm text-slate-500 italic">（無內容）</div>
          </div>

          <div v-if="selectedNoteForView.images && selectedNoteForView.images.length > 0" class="rounded-lg border border-slate-200 bg-white p-4">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-sm font-semibold text-slate-700">筆記照片</h4>
              <span class="text-xs text-slate-500">{{ selectedNoteForView.images.length }} 張</span>
            </div>
            <div class="grid grid-cols-1 gap-4">
              <div v-for="img in selectedNoteForView.images" :key="img.image_id" class="flex justify-center">
                <ImageRotator :image-url="img.image_url || img.image_path" :alt="img.caption || '筆記圖片'" />
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              @click="closeViewModal"
              class="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              關閉
            </button>
            <button
              @click="editFromView"
              class="rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-600"
            >
              編輯
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 編輯/新增 Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
      @click.self="closeModal"
    >
      <div class="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-slate-900">{{ editingId ? '編輯筆記' : '新增筆記' }}</h3>
          <button @click="closeModal" class="text-slate-400 hover:text-slate-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form class="space-y-4" @submit.prevent="save">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">標題 *</label>
            <input
              v-model="form.title"
              required
              type="text"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="例如：向量內積常犯錯"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">科目/分類（選填）</label>
            <input
              v-model="form.subject"
              type="text"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="例如：數學 / 物理"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">內容（Markdown，選填）</label>
            <textarea
              v-model="form.content"
              rows="10"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="可記錄：題目、自己的錯因、正確觀念、下次避免方式..."
            ></textarea>
          </div>

          <div class="border-t border-slate-200 pt-4">
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-sm font-semibold text-slate-700">照片</h4>
              <label class="inline-flex items-center justify-center rounded-full bg-sky-50 px-4 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100 cursor-pointer">
                + 拍照/選照片
                <input
                  class="hidden"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  @change="onPickImages"
                />
              </label>
            </div>

            <p class="text-xs text-slate-500 mb-3">建議直接拍照上傳；系統會自動壓縮以加快速度。</p>

            <div v-if="existingImages.length > 0" class="mb-4">
              <div class="text-xs font-semibold text-slate-500 mb-2">已上傳</div>
              <div class="grid grid-cols-3 gap-3 sm:grid-cols-4">
                <div v-for="img in existingImages" :key="img.image_id" class="relative">
                  <img :src="img.image_url || img.image_path" class="h-24 w-full rounded-xl object-cover border border-slate-200" />
                  <button
                    type="button"
                    class="absolute top-2 right-2 rounded-full bg-rose-600/90 text-white text-xs px-2 py-1 hover:bg-rose-700"
                    @click="deleteExistingImage(img)"
                  >
                    刪除
                  </button>
                </div>
              </div>
            </div>

            <div v-if="localImages.length > 0">
              <div class="text-xs font-semibold text-slate-500 mb-2">待上傳</div>
              <div class="grid grid-cols-3 gap-3 sm:grid-cols-4">
                <div v-for="(img, idx) in localImages" :key="img.url" class="relative">
                  <img :src="img.url" class="h-24 w-full rounded-xl object-cover border border-slate-200" />
                  <button
                    type="button"
                    class="absolute top-2 right-2 rounded-full bg-slate-900/85 text-white text-xs px-2 py-1 hover:bg-slate-900"
                    @click="removeLocalImage(idx)"
                  >
                    移除
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button
              type="button"
              class="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              @click="closeModal"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="saving || uploading"
              class="rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-50"
            >
              {{ saving || uploading ? '儲存中...' : '儲存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { studentMistakeNoteAPI, studentMistakeNoteImageAPI } from '../services/api'
import { compressImageFile } from '../utils/imageCompress'
import { useMarkdownRenderer } from '../composables/useMarkdownRenderer'
import ImageRotator from '../components/ImageRotator.vue'

// 使用 Markdown 渲染 composable
const { renderMarkdownWithLatex } = useMarkdownRenderer()

const notes = ref([])
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const editingId = ref(null)
const uploading = ref(false)
const uploadProgress = ref([])

// 檢視相關 state
const showViewModal = ref(false)
const selectedNoteForView = ref(null)

const search = ref('')

const form = ref({
  title: '',
  subject: '',
  content: '',
})

const localImages = ref([]) // { id?, url, uploading, error, remote? }
const existingImages = ref([]) // from API (images[])

const formatDateTime = (datetime) => {
  if (!datetime) return ''
  const d = new Date(datetime)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const fetchNotes = async () => {
  loading.value = true
  try {
    const res = await studentMistakeNoteAPI.getAll({ q: search.value })
    const data = res.data.results || res.data
    notes.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('載入錯題筆記失敗：', e)
    notes.value = []
  } finally {
    loading.value = false
  }
}

const clearSearch = () => {
  search.value = ''
  fetchNotes()
}

const openCreate = () => {
  editingId.value = null
  form.value = { title: '', subject: '', content: '' }
  existingImages.value = []
  localImages.value = []
  showModal.value = true
}

const openEdit = (note) => {
  editingId.value = note.note_id
  form.value = {
    title: note.title || '',
    subject: note.subject || '',
    content: note.content || '',
  }
  existingImages.value = Array.isArray(note.images) ? note.images : []
  localImages.value = []
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingId.value = null
  existingImages.value = []
  localImages.value.forEach((x) => x?.url && URL.revokeObjectURL(x.url))
  localImages.value = []
}

const onPickImages = async (evt) => {
  const files = Array.from(evt.target.files || [])
  evt.target.value = '' // allow re-pick same file
  if (files.length === 0) return

  // 建立 local preview
  for (const f of files) {
    localImages.value.push({
      file: f,
      url: URL.createObjectURL(f),
      uploading: false,
      error: null,
    })
  }
}

const removeLocalImage = (idx) => {
  const item = localImages.value[idx]
  if (item?.url) URL.revokeObjectURL(item.url)
  localImages.value.splice(idx, 1)
}

const deleteExistingImage = async (img) => {
  if (!confirm('確定要刪除這張照片嗎？')) return
  try {
    await studentMistakeNoteImageAPI.delete(img.image_id)
    existingImages.value = existingImages.value.filter((x) => x.image_id !== img.image_id)
  } catch (e) {
    console.error('刪除圖片失敗：', e)
    alert('刪除圖片失敗，請稍後再試')
  }
}

const uploadSelectedImages = async (noteId) => {
  if (localImages.value.length === 0) return
  uploading.value = true
  uploadProgress.value = []
  try {
    const formData = new FormData()
    // 壓縮後加入
    for (let i = 0; i < localImages.value.length; i++) {
      const item = localImages.value[i]
      item.uploading = true
      item.error = null
      const compressed = await compressImageFile(item.file)
      formData.append('images', compressed)
    }

    const res = await studentMistakeNoteAPI.uploadImages(noteId, formData)
    const created = res.data || []
    existingImages.value = [...existingImages.value, ...created]

    // 清空 local
    localImages.value.forEach((x) => x?.url && URL.revokeObjectURL(x.url))
    localImages.value = []
  } finally {
    uploading.value = false
  }
}

const save = async () => {
  saving.value = true
  try {
    if (editingId.value) {
      await studentMistakeNoteAPI.update(editingId.value, {
        title: form.value.title,
        subject: form.value.subject || null,
        content: form.value.content || null,
      })
      await uploadSelectedImages(editingId.value)
    } else {
      const created = await studentMistakeNoteAPI.create({
        title: form.value.title,
        subject: form.value.subject || null,
        content: form.value.content || null,
      })
      const noteId = created?.data?.note_id
      if (noteId) {
        await uploadSelectedImages(noteId)
      }
    }
    closeModal()
    fetchNotes()
  } catch (e) {
    console.error('儲存失敗：', e)
    alert('儲存失敗，請稍後再試')
  } finally {
    saving.value = false
  }
}

const removeNote = async (note) => {
  if (!confirm(`確定要刪除「${note.title}」嗎？`)) return
  try {
    await studentMistakeNoteAPI.delete(note.note_id)
    fetchNotes()
  } catch (e) {
    console.error('刪除失敗：', e)
    alert('刪除失敗，請稍後再試')
  }
}

// 檢視相關方法
const openView = (note) => {
  selectedNoteForView.value = note
  showViewModal.value = true
}

const closeViewModal = () => {
  showViewModal.value = false
  selectedNoteForView.value = null
}

const editFromView = () => {
  if (!selectedNoteForView.value) return
  closeViewModal()
  // 延遲一下確保 Modal 關閉動畫完成
  setTimeout(() => {
    openEdit(selectedNoteForView.value)
  }, 100)
}

onMounted(() => {
  fetchNotes()
})
</script>

