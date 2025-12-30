import { provide, inject } from 'vue'

/**
 * Resource Editor Context Key
 */
const RESOURCE_EDITOR_CONTEXT_KEY = Symbol('resourceEditorContext')

/**
 * 提供 Resource Editor 上下文
 * 用於在組件樹中共享資源編輯器的狀態和方法
 */
export function provideResourceEditorContext(context) {
  provide(RESOURCE_EDITOR_CONTEXT_KEY, context)
}

/**
 * 注入 Resource Editor 上下文
 * 用於訪問資源編輯器的狀態和方法
 */
export function useResourceEditorContext() {
  const context = inject(RESOURCE_EDITOR_CONTEXT_KEY)
  
  if (!context) {
    throw new Error('useResourceEditorContext must be used within a ResourceEditor component')
  }
  
  return context
}
