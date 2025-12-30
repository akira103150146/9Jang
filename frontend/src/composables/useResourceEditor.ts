import { ref, reactive, computed, watch, nextTick, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { learningResourceAPI, contentTemplateAPI } from '../services/api'
import type { LearningResource, ContentTemplate, TiptapDocument } from '@9jang/shared'

/**
 * 資源編輯選項
 */
export interface ResourceEditorOptions {
  viewMode?: boolean
}

/**
 * 初始化資源選項
 */
export interface InitializeResourceOptions {
  loadImageMappings?: () => void
}

/**
 * 保存資源選項
 */
export interface SaveResourceOptions {
  migrateTempMappings?: (resourceId: number) => void
}

/**
 * 資源編輯功能 Composable
 * 處理資源的 CRUD、自動保存、初始化等邏輯
 */
export function useResourceEditor(options: ResourceEditorOptions = {}) {
  const { viewMode = false } = options

  const route = useRoute()
  const router = useRouter()

  // 保存狀態
  const isSaving: Ref<boolean> = ref(false)
  const lastSaved: Ref<Date | null> = ref(null)
  const isInitializing: Ref<boolean> = ref(true)

  // Resource Data
  const resource = reactive<Partial<LearningResource> & { course_ids: number[]; student_group_ids: number[]; tag_ids: number[] }>({
    title: '未命名文件',
    mode: 'HANDOUT',
    course_ids: [],
    student_group_ids: [],
    tag_ids: [],
    settings: {}
  })

  // 統一使用 Tiptap JSON 格式
  const tiptapStructureRef: Ref<TiptapDocument> = ref({
    type: 'doc',
    content: [{ type: 'paragraph', content: [] }]
  })

  // Tiptap 格式的 structure（用於 BlockEditor）
  const tiptapStructure = computed<TiptapDocument>({
    get() {
      return tiptapStructureRef.value
    },
    set(value: TiptapDocument) {
      tiptapStructureRef.value = value
    }
  })

  /**
   * 處理 BlockEditor 更新
   */
  const handleBlockEditorUpdate = (newStructure: TiptapDocument): void => {
    tiptapStructure.value = newStructure
    // 自動儲存會觸發
  }

  /**
   * 載入資源數據
   */
  const loadResource = async (resourceId: number | string): Promise<void> => {
    try {
      const id = typeof resourceId === 'string' ? parseInt(resourceId, 10) : resourceId
      const res = await learningResourceAPI.getById(id)
      const data = res.data

      resource.title = data.title
      resource.mode = data.mode || 'HANDOUT'
      resource.course_ids = data.course_ids || []
      resource.student_group_ids = data.student_group_ids || []
      resource.tag_ids = data.tag_ids || []
      resource.settings = data.settings || {}

      // 統一使用 tiptap_structure
      if (data.tiptap_structure && data.tiptap_structure.type === 'doc') {
        tiptapStructureRef.value = data.tiptap_structure
      } else {
        // 如果沒有 tiptap_structure，使用空結構
        tiptapStructureRef.value = {
          type: 'doc',
          content: [{ type: 'paragraph', content: [] }]
        }
      }

      // 圖片映射表載入由外部處理
    } catch (error) {
      console.error('載入資源失敗：', error)
      throw error
    }
  }

  /**
   * 載入模板內容
   */
  const loadTemplate = async (templateId: number | string): Promise<void> => {
    try {
      const id = typeof templateId === 'string' ? parseInt(templateId, 10) : templateId
      const templateRes = await contentTemplateAPI.getById(id)
      const template: ContentTemplate = templateRes.data

      if (template.tiptap_structure && template.tiptap_structure.type === 'doc') {
        // 將 template 的 tiptap_structure 插入到文件開頭
        tiptapStructureRef.value = template.tiptap_structure
      }
    } catch (error) {
      console.error('載入模板失敗：', error)
    }
  }

  /**
   * 保存資源
   */
  const saveResource = async (
    manual = false,
    options: SaveResourceOptions = {}
  ): Promise<void> => {
    const { migrateTempMappings = null } = options

    if (!resource.title) return

    isSaving.value = true

    // 過濾掉 course_ids 中的 null 值
    const cleanedCourseIds = (resource.course_ids || []).filter(
      (id) => id !== null && id !== undefined
    ) as number[]

    const payload: Partial<LearningResource> = {
      ...resource,
      course_ids: cleanedCourseIds,
      tiptap_structure: tiptapStructureRef.value,
      tag_ids: resource.tag_ids,
      student_group_ids: resource.student_group_ids
    }

    try {
      let response
      const routeId = route.params.id as string | undefined
      if (routeId) {
        const id = parseInt(routeId, 10)
        response = await learningResourceAPI.update(id, payload)
      } else {
        response = await learningResourceAPI.create(payload as LearningResource)
        // Redirect to edit mode if created
        if (!route.params.id && manual) {
          const newResourceId = response.data.resource_id
          router.replace(`/resources/edit/${newResourceId}`)

          // 新資源創建後，將臨時映射表遷移到資源專屬的映射表
          if (migrateTempMappings && newResourceId) {
            migrateTempMappings(newResourceId)
          }
        }
      }
      lastSaved.value = new Date()
    } catch (error) {
      console.error('Save failed', error)
      if (manual) {
        const axiosError = error as { response?: { data?: { detail?: string } } }
        const errorMsg = axiosError.response?.data?.detail || '儲存失敗，請稍後再試'
        alert(errorMsg)
      }
      throw error
    } finally {
      isSaving.value = false
    }
  }

  /**
   * 初始化資源數據
   */
  const initializeResource = async (options: InitializeResourceOptions = {}): Promise<void> => {
    const { loadImageMappings = null } = options

    isInitializing.value = true

    try {
      // 如果從模板創建，載入模板內容
      const templateId = route.query.template_id as string | undefined
      if (templateId) {
        await loadTemplate(templateId)

        // 如果是新文件，載入臨時映射表
        if (!route.params.id && loadImageMappings) {
          loadImageMappings()
        }
      }

      // 如果是編輯模式，載入資源數據
      const routeId = route.params.id as string | undefined
      if (routeId) {
        await loadResource(routeId)
        // 載入該資源的圖片映射表
        if (loadImageMappings) {
          loadImageMappings()
        }
      } else if (!templateId && loadImageMappings) {
        // 新文件且不是從模板創建，載入臨時映射表
        loadImageMappings()
      }
    } catch (error) {
      console.error('初始化資源失敗：', error)
    } finally {
      // 初始化完成後，等待一個 tick 再啟用自動保存
      await nextTick()
      setTimeout(() => {
        isInitializing.value = false
      }, 100)
    }
  }

  /**
   * 設置自動保存
   */
  const setupAutoSave = (debouncedSave: () => void): void => {
    // 只在非查看模式下啟用自動保存 watcher
    if (!viewMode) {
      watch(
        [
          () => resource.title,
          () => resource.mode,
          () => resource.course_ids,
          () => resource.student_group_ids,
          () => resource.tag_ids,
          () => resource.settings,
          () => tiptapStructureRef.value
        ],
        () => {
          // 初始化期間不觸發自動保存
          if (isInitializing.value) return

          // Only auto-save if editing or title changed
          const routeId = route.params.id as string | undefined
          if (routeId || resource.title !== '未命名文件') {
            debouncedSave()
          }
        },
        { deep: true }
      )
    }
  }

  return {
    resource,
    tiptapStructure,
    tiptapStructureRef,
    isSaving,
    lastSaved,
    isInitializing,
    handleBlockEditorUpdate,
    saveResource,
    initializeResource,
    setupAutoSave
  }
}
