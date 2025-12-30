import type { Ref } from 'vue'
import type { Tag, LearningResource } from '@9jang/shared'

/**
 * 標籤管理功能 Composable
 * 處理標籤的添加、移除等邏輯
 */
export function useTagManagement(
  resource: Ref<LearningResource> | LearningResource,
  availableTags: Ref<Tag[]> | Tag[]
) {
  /**
   * 獲取標籤名稱
   */
  const getTagName = (id: number): string => {
    const tags = 'value' in availableTags ? availableTags.value : availableTags
    const tag = tags.find((t) => t.tag_id === id)
    return tag ? tag.tag_name : 'Unknown'
  }

  /**
   * 添加標籤
   */
  const addTag = (id: number | string): void => {
    if (!id) return
    const tagId = typeof id === 'string' ? parseInt(id, 10) : id
    const resourceValue = 'value' in resource ? resource.value : resource
    
    if (!resourceValue.tag_ids || !Array.isArray(resourceValue.tag_ids)) {
      if ('value' in resource) {
        (resource as Ref<LearningResource>).value = {
          ...resourceValue,
          tag_ids: [tagId]
        }
      }
      return
    }
    
    if (!resourceValue.tag_ids.includes(tagId)) {
      const updatedTagIds = [...resourceValue.tag_ids, tagId]
      if ('value' in resource) {
        (resource as Ref<LearningResource>).value = {
          ...resourceValue,
          tag_ids: updatedTagIds
        }
      } else {
        resource.tag_ids = updatedTagIds
      }
    }
  }

  /**
   * 移除標籤
   */
  const removeTag = (id: number): void => {
    const resourceValue = 'value' in resource ? resource.value : resource
    
    if (!resourceValue.tag_ids || !Array.isArray(resourceValue.tag_ids)) {
      return
    }
    
    const index = resourceValue.tag_ids.indexOf(id)
    if (index > -1) {
      const updatedTagIds = resourceValue.tag_ids.filter((tagId) => tagId !== id)
      if ('value' in resource) {
        (resource as Ref<LearningResource>).value = {
          ...resourceValue,
          tag_ids: updatedTagIds
        }
      } else {
        resource.tag_ids = updatedTagIds
      }
    }
  }

  return {
    getTagName,
    addTag,
    removeTag
  }
}
