/**
 * 編輯器事件管理 Composable
 * 使用 provide/inject 替代 window 事件，提供更好的類型安全和組件解耦
 */
import { ref, provide, inject, type InjectionKey, type Ref } from 'vue'

/**
 * 圖片映射更新數據
 */
export interface ImageMappingUpdateData {
  filename: string
  url: string
  [key: string]: unknown
}

/**
 * 選擇器選項
 */
export interface SelectorOptions {
  onSelect?: (item: unknown) => void
  [key: string]: unknown
}

/**
 * 編輯器事件管理器介面
 */
export interface EditorEventBus {
  notifyImageMappingUpdated: (data: ImageMappingUpdateData) => void
  openImageSelector: (options?: SelectorOptions) => void
  openTemplateSelector: (options?: SelectorOptions) => void
  onImageMappingUpdated: (callback: (data: ImageMappingUpdateData) => void) => () => void
  onImageSelectorOpen: (callback: (options?: SelectorOptions) => void) => () => void
  onTemplateSelectorOpen: (callback: (options?: SelectorOptions) => void) => () => void
}

const INJECT_KEY: InjectionKey<EditorEventBus> = Symbol('editorEvents')

/**
 * 編輯器事件管理器
 */
export function useEditorEventsProvider(): EditorEventBus {
  // 圖片映射更新回調
  const imageMappingUpdateCallbacks: Ref<Set<(data: ImageMappingUpdateData) => void>> = ref(new Set())

  // 圖片選擇器打開回調
  const imageSelectorCallbacks: Ref<Set<(options?: SelectorOptions) => void>> = ref(new Set())

  // 模板選擇器打開回調
  const templateSelectorCallbacks: Ref<Set<(options?: SelectorOptions) => void>> = ref(new Set())

  /**
   * 通知圖片映射已更新
   */
  const notifyImageMappingUpdated = (data: ImageMappingUpdateData): void => {
    imageMappingUpdateCallbacks.value.forEach((callback) => {
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
  const openImageSelector = (options?: SelectorOptions): void => {
    imageSelectorCallbacks.value.forEach((callback) => {
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
  const openTemplateSelector = (options?: SelectorOptions): void => {
    templateSelectorCallbacks.value.forEach((callback) => {
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
  const onImageMappingUpdated = (callback: (data: ImageMappingUpdateData) => void): (() => void) => {
    imageMappingUpdateCallbacks.value.add(callback)
    // 返回取消註冊函數
    return () => {
      imageMappingUpdateCallbacks.value.delete(callback)
    }
  }

  /**
   * 註冊圖片選擇器打開監聽器
   */
  const onImageSelectorOpen = (callback: (options?: SelectorOptions) => void): (() => void) => {
    imageSelectorCallbacks.value.add(callback)
    return () => {
      imageSelectorCallbacks.value.delete(callback)
    }
  }

  /**
   * 註冊模板選擇器打開監聽器
   */
  const onTemplateSelectorOpen = (callback: (options?: SelectorOptions) => void): (() => void) => {
    templateSelectorCallbacks.value.add(callback)
    return () => {
      templateSelectorCallbacks.value.delete(callback)
    }
  }

  const eventBus: EditorEventBus = {
    notifyImageMappingUpdated,
    openImageSelector,
    openTemplateSelector,
    onImageMappingUpdated,
    onImageSelectorOpen,
    onTemplateSelectorOpen
  }

  provide(INJECT_KEY, eventBus)

  return eventBus
}

/**
 * 使用編輯器事件管理器
 */
export function useEditorEvents(): EditorEventBus {
  const eventBus = inject(INJECT_KEY)

  if (!eventBus) {
    throw new Error('useEditorEvents must be used within a component that calls useEditorEventsProvider')
  }

  return eventBus
}
