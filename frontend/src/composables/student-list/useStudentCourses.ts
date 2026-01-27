/**
 * useStudentCourses
 * 處理課程相關的邏輯
 */

import { ref } from 'vue'
import { courseAPI } from '../../services/api'

export interface Course {
  course_id?: number
  id?: number
  course_name?: string
  day_of_week?: string
  start_time?: string
  end_time?: string
  [key: string]: unknown
}

export function useStudentCourses() {
  const courses = ref<Course[]>([])

  /**
   * 獲取課程列表
   */
  const fetchCourses = async (): Promise<void> => {
    try {
      const response = await courseAPI.getAll()
      const responseData = response.data as { results?: unknown[] } | unknown[]
      const data = Array.isArray(responseData)
        ? responseData
        : 'results' in responseData
          ? responseData.results || []
          : []
      courses.value = (data as Course[]) || []
    } catch (error) {
      console.warn('獲取課程列表失敗:', error)
      courses.value = []
    }
  }

  return {
    courses,
    fetchCourses,
  }
}
