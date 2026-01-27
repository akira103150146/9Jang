/**
 * Student API
 */

import { AxiosResponse } from 'axios'
import type {
  Student,
  CreateStudentDto,
  UpdateStudentDto,
  StudentQuery,
  StudentTuitionStatus
} from '@9jang/shared'
import { StudentTuitionStatusSchema } from '@9jang/shared'
import { api } from '../api/index'
import type { PaginatedResponse } from '../api/types'
import { normalizeStudentResponse } from './student.normalize'

export const studentAPI = {
  /**
   * 獲取所有學生（支持查詢參數）
   */
  getAll: async (includeDeleted = false, queryParams: StudentQuery | string = ''): Promise<AxiosResponse<PaginatedResponse<Student> | Student[]>> => {
    const params = new URLSearchParams()
    if (includeDeleted) params.append('include_deleted', 'true')
    
    if (typeof queryParams === 'string') {
      const existingParams = new URLSearchParams(queryParams)
      existingParams.forEach((value, key) => {
        params.append(key, value)
      })
    } else {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, String(value))
        }
      })
    }
    
    const queryString = params.toString()
    const response = await api.get(`/cramschool/students/${queryString ? `?${queryString}` : ''}`)
    
    // 驗證響應數據
    if (Array.isArray(response.data)) {
      response.data = response.data.map((item: unknown) => normalizeStudentResponse(item))
    } else if (response.data && typeof response.data === 'object' && 'results' in response.data) {
      const paginated = response.data as PaginatedResponse<unknown>
      paginated.results = paginated.results.map((item: unknown) => normalizeStudentResponse(item))
    }
    
    return response
  },

  /**
   * 獲取單個學生
   */
  getById: async (id: number): Promise<AxiosResponse<Student>> => {
    const response = await api.get(`/cramschool/students/${id}/`)
    return {
      ...response,
      data: normalizeStudentResponse(response.data)
    }
  },

  /**
   * 創建學生
   */
  create: async (data: CreateStudentDto): Promise<AxiosResponse<Student>> => {
    const response = await api.post('/cramschool/students/', data)
    return {
      ...response,
      data: normalizeStudentResponse(response.data)
    }
  },

  /**
   * 更新學生
   */
  update: async (id: number, data: UpdateStudentDto): Promise<AxiosResponse<Student>> => {
    const response = await api.put(`/cramschool/students/${id}/`, data)
    return {
      ...response,
      data: normalizeStudentResponse(response.data)
    }
  },

  /**
   * 刪除學生
   */
  delete: async (id: number): Promise<AxiosResponse<void>> => {
    return api.delete(`/cramschool/students/${id}/`)
  },

  /**
   * 獲取學生學費狀態
   */
  getTuitionStatus: async (id: number): Promise<AxiosResponse<StudentTuitionStatus>> => {
    const response = await api.get(`/cramschool/students/${id}/tuition_status/`)
    return {
      ...response,
      data: StudentTuitionStatusSchema.parse(response.data)
    }
  },

  /**
   * 生成學費
   */
  generateTuition: async (id: number, data: { weeks?: number }): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/students/${id}/generate_tuition/`, data)
  },

  /**
   * 批次生成所有學生的學費
   */
  batchGenerateTuitions: async (studentIds: number[] | null = null, weeks = 4): Promise<AxiosResponse<unknown>> => {
    const requestData: { weeks: number; student_ids?: number[] } = { weeks }
    if (studentIds && studentIds.length > 0) {
      requestData.student_ids = studentIds
    }
    return api.post('/cramschool/students/batch-generate-tuitions/', requestData)
  },

  /**
   * 重置學生密碼
   */
  resetPassword: async (id: number, password: string): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/students/${id}/reset-password/`, { password })
  },

  /**
   * 切換帳號狀態
   */
  toggleAccountStatus: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/students/${id}/toggle-account-status/`)
  },

  /**
   * 獲取學生出缺勤和請假記錄
   */
  getAttendanceAndLeaves: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/cramschool/students/${id}/attendance_and_leaves/`)
  },

  /**
   * 恢復已刪除的學生
   */
  restore: async (id: number): Promise<AxiosResponse<Student>> => {
    const response = await api.post(`/cramschool/students/${id}/restore/`)
    return {
      ...response,
      data: normalizeStudentResponse(response.data)
    }
  }
}
