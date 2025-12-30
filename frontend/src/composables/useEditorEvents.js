/**
 * 編輯器事件管理 Composable
 * 使用 provide/inject 替代 window 事件，提供更好的類型安全和組件解耦
 */
import { ref, provide, inject } from 'vue'

const INJECT_KEY = 'editorEvents'

/**
 * 編輯器事件管理器
 */
export function useEditorEventsProvider() {
  // 圖片映射更新回調
  const imageMappingUpdateCallbacks = ref(new Set())
  
  // 圖片選擇器打開回調
  const imageSelectorCallbacks = ref(new Set())
  
  // 模板選擇器打開回調
  const templateSelectorCallbacks = ref(new Set())

  /**
   * 通知圖片映射已更新
   */
  const notifyImageMappingUpdated = (data) => {
    imageMappingUpdateCallbacks.value.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error('圖片映射更新回調執行失敗:', error)
      }
    })
  }

  /**
   * 打開圖片選擇器
   */
  const openImageSelector = (options) => {
    imageSelectorCallbacks.value.forEach(callback => {
      try {
        callback(options)
      } catch (error) {
        console.error('打開圖片選擇器回調執行失敗:', error)
      }
    })
  }

  /**
   * 打開模板選擇器
   */
  const openTemplateSelector = (options) => {
    templateSelectorCallbacks.value.forEach(callback => {
      try {
        callback(options)
      } catch (error) {
        console.error('打開模板選擇器回調執行失敗:', error)
      }
    })
  }

  /**
   * 註冊圖片映射更新監聽器
   */
  const onImageMappingUpdated = (callback) => {
    imageMappingUpdateCallbacks.value.add(callback)
    // 返回取消註冊函數
    return () => {
      imageMappingUpdateCallbacks.value.delete(callback)
    }
  }

  /**
   * 註冊圖片選擇器打開監聽器
   */
  const onImageSelectorOpen = (callback) => {
    imageSelectorCallbacks.value.add(callback)
    return () => {
      imageSelectorCallbacks.value.delete(callback)
    }
  }

  /**
   * 註冊模板選擇器打開監聽器
   */
  const onTemplateSelectorOpen = (callback) => {
    templateSelectorCallbacks.value.add(callback)
    return () => {
      templateSelectorCallbacks.value.delete(callback)
    }
  }

  const eventBus = {
    notifyImageMappingUpdated,
    openImageSelector,
    openTemplateSelector,
    onImageMappingUpdated,
    onImageSelectorOpen,
    onTemplateSelectorOpen,
  }

  // Provide 給子組件使用
  provide(INJECT_KEY, eventBus)

  return eventBus
}

/**
 * 在子組件中注入事件總線
 */
export function useEditorEvents() {
  const eventBus = inject(INJECT_KEY, null)
  
  if (!eventBus) {
    console.warn('useEditorEvents: 未找到事件總線，請確保父組件使用了 useEditorEventsProvider')
    // 返回一個空的事件總線，避免錯誤
    return {
      notifyImageMappingUpdated: () => {},
      openImageSelector: () => {},
      openTemplateSelector: () => {},
      onImageMappingUpdated: () => () => {},
      onImageSelectorOpen: () => () => {},
      onTemplateSelectorOpen: () => () => {},
    }
  }
  
  return eventBus
}
