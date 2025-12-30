import { ref } from 'vue'

/**
 * 標籤管理功能 Composable
 * 處理標籤的添加、移除等邏輯
 */
export function useTagManagement(resource, availableTags) {
  /**
   * 獲取標籤名稱
   */
  const getTagName = (id) => {
    const tag = availableTags.value.find(t => t.tag_id === id)
    return tag ? tag.tag_name : 'Unknown'
  }

  /**
   * 添加標籤
   */
  const addTag = (id) => {
    if (!id) return
    const tagId = parseInt(id)
    if (!resource.tag_ids.includes(tagId)) {
      resource.tag_ids.push(tagId)
    }
  }

  /**
   * 移除標籤
   */
  const removeTag = (id) => {
    const index = resource.tag_ids.indexOf(id)
    if (index > -1) {
      resource.tag_ids.splice(index, 1)
    }
  }

  return {
    getTagName,
    addTag,
    removeTag
  }
}
