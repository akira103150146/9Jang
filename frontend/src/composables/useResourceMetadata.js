import { ref } from 'vue'
import { courseAPI, studentGroupAPI, hashtagAPI, contentTemplateAPI } from '../services/api'

/**
 * 資源元數據管理 Composable
 * 處理課程、學生群組、標籤、模板等元數據的獲取
 */
export function useResourceMetadata() {
  const courses = ref([])
  const studentGroups = ref([])
  const availableTags = ref([])
  const templates = ref([])

  /**
   * 獲取所有元數據
   */
  const fetchMetadata = async () => {
    try {
      const [cRes, gRes, tRes, templateRes] = await Promise.all([
        courseAPI.getAll(),
        studentGroupAPI.getAll(),
        hashtagAPI.getAll(),
        contentTemplateAPI.getAll()
      ])

      courses.value = cRes.data.results || cRes.data
      studentGroups.value = gRes.data.results || gRes.data
      availableTags.value = tRes.data.results || tRes.data
      templates.value = templateRes.data.results || templateRes.data
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
