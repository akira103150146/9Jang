import { ref, type Ref } from 'vue'
import { courseAPI, studentGroupAPI, hashtagAPI, contentTemplateAPI } from '../services/api'
import type { Course, ContentTemplate } from '@9jang/shared'
import type { Tag } from '@9jang/shared'

/**
 * 學生群組類型（暫時使用 unknown，待定義 Schema）
 */
type StudentGroup = unknown

/**
 * 資源元數據管理 Composable
 * 處理課程、學生群組、標籤、模板等元數據的獲取
 */
export function useResourceMetadata() {
  const courses: Ref<Course[]> = ref([])
  const studentGroups: Ref<StudentGroup[]> = ref([])
  const availableTags: Ref<Tag[]> = ref([])
  const templates: Ref<ContentTemplate[]> = ref([])

  /**
   * 獲取所有元數據
   */
  const fetchMetadata = async (): Promise<void> => {
    try {
      const [cRes, gRes, tRes, templateRes] = await Promise.all([
        courseAPI.getAll(),
        studentGroupAPI.getAll(),
        hashtagAPI.getAll(),
        contentTemplateAPI.getAll()
      ])

      courses.value = (Array.isArray(cRes.data) ? cRes.data : cRes.data.results) as Course[]
      studentGroups.value = (Array.isArray(gRes.data) ? gRes.data : (gRes.data as { results?: unknown[] }).results || []) as StudentGroup[]
      availableTags.value = (Array.isArray(tRes.data) ? tRes.data : (tRes.data as { results?: unknown[] }).results || []) as Tag[]
      templates.value = (Array.isArray(templateRes.data)
        ? templateRes.data
        : templateRes.data.results) as ContentTemplate[]
    } catch (error) {
      console.error('Failed to fetch metadata', error)
      throw error
    }
  }

  return {
    courses,
    studentGroups,
    availableTags,
    templates,
    fetchMetadata
  }
}
