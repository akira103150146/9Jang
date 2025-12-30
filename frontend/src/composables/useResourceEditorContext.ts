import { provide, inject, type InjectionKey } from 'vue'
import type { LearningResource, Tag } from '@9jang/shared'

/**
 * Resource Editor 上下文類型
 */
export interface ResourceEditorContext {
  resource: LearningResource
  viewMode?: boolean
  courses?: unknown[]
  studentGroups?: unknown[]
  availableTags?: Tag[]
  imageMappings?: Record<string, string>
  uploadingImages?: boolean
  replacingImages?: boolean
  watermarkEnabled?: boolean
  watermarkImage?: string | null
  watermarkOpacity?: number
  tiptapStructureRef?: unknown
  getTagName?: (id: number) => string
  [key: string]: unknown
}

/**
 * Resource Editor Context Key
 */
const RESOURCE_EDITOR_CONTEXT_KEY: InjectionKey<ResourceEditorContext> = Symbol('resourceEditorContext')

/**
 * 提供 Resource Editor 上下文
 * 用於在組件樹中共享資源編輯器的狀態和方法
 */
export function provideResourceEditorContext(context: ResourceEditorContext): void {
  provide(RESOURCE_EDITOR_CONTEXT_KEY, context)
}

/**
 * 注入 Resource Editor 上下文
 * 用於訪問資源編輯器的狀態和方法
 */
export function useResourceEditorContext(): ResourceEditorContext {
  const context = inject(RESOURCE_EDITOR_CONTEXT_KEY)

  if (!context) {
    throw new Error('useResourceEditorContext must be used within a ResourceEditor component')
  }

  return context
}
