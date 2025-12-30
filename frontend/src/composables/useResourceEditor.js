import { ref, reactive, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { learningResourceAPI, contentTemplateAPI } from '../services/api'

/**
 * 資源編輯功能 Composable
 * 處理資源的 CRUD、自動保存、初始化等邏輯
 */
export function useResourceEditor(options = {}) {
  const {
    viewMode = false
  } = options

  const route = useRoute()
  const router = useRouter()

  // 保存狀態
  const isSaving = ref(false)
  const lastSaved = ref(null)
  const isInitializing = ref(true)

  // Resource Data
  const resource = reactive({
    title: '未命名文件',
    mode: 'HANDOUT',
    course_ids: [],
    student_group_ids: [],
    tag_ids: [],
    settings: {}
  })

  // 統一使用 Tiptap JSON 格式
  const tiptapStructureRef = ref({
    type: 'doc',
    content: [{ type: 'paragraph', content: [] }]
  })

  // Tiptap 格式的 structure（用於 BlockEditor）
  const tiptapStructure = computed({
    get() {
      return tiptapStructureRef.value
    },
    set(value) {
      tiptapStructureRef.value = value
    }
  })

  /**
   * 處理 BlockEditor 更新
   */
  const handleBlockEditorUpdate = (newStructure) => {
    tiptapStructure.value = newStructure
    // 自動儲存會觸發
  }

  /**
   * 載入資源數據
   */
  const loadResource = async (resourceId) => {
    try {
      const res = await learningResourceAPI.getById(resourceId)
      const data = res.data
      
      resource.title = data.title
      resource.mode = data.mode || 'HANDOUT'
      resource.course_ids = data.courses?.map(c => c.course_id) || []
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
  const loadTemplate = async (templateId) => {
    try {
      const templateRes = await contentTemplateAPI.getById(templateId)
      const template = templateRes.data
      
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
  const saveResource = async (manual = false, options = {}) => {
    const {
      migrateTempMappings = null
    } = options
    
    if (!resource.title) return
    
    isSaving.value = true
    
    // 過濾掉 course_ids 中的 null 值
    const cleanedCourseIds = (resource.course_ids || []).filter(id => id !== null && id !== undefined)
    
    const payload = {
      ...resource,
      course_ids: cleanedCourseIds,
      tiptap_structure: tiptapStructureRef.value,
      tag_ids_input: resource.tag_ids,
      student_group_ids: resource.student_group_ids
    }
    
    try {
      let response
      if (route.params.id) {
        response = await learningResourceAPI.update(route.params.id, payload)
      } else {
        response = await learningResourceAPI.create(payload)
        // Redirect to edit mode if created
        if (!route.params.id && manual) {
          const newResourceId = response.data.resource_id
          router.replace(`/resources/edit/${newResourceId}`)
          
          // 新資源創建後，將臨時映射表遷移到資源專屬的映射表
          if (migrateTempMappings) {
            migrateTempMappings(newResourceId)
          }
        }
      }
      lastSaved.value = new Date()
    } catch (error) {
      console.error('Save failed', error)
      if (manual) {
        const errorMsg = error.response?.data?.detail || '儲存失敗，請稍後再試'
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
  const initializeResource = async (options = {}) => {
    const {
      loadImageMappings = null
    } = options
    
    isInitializing.value = true
    
    try {
      // 如果從模板創建，載入模板內容
      if (route.query.template_id) {
        await loadTemplate(route.query.template_id)
        
        // 如果是新文件，載入臨時映射表
        if (!route.params.id && loadImageMappings) {
          loadImageMappings()
        }
      }
      
      // 如果是編輯模式，載入資源數據
      if (route.params.id) {
        await loadResource(route.params.id)
        // 載入該資源的圖片映射表
        if (loadImageMappings) {
          loadImageMappings()
        }
      } else if (!route.query.template_id && loadImageMappings) {
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
  const setupAutoSave = (debouncedSave) => {
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
          if (route.params.id || resource.title !== '未命名文件') {
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
