/**
 * Resource API
 */

import { AxiosResponse } from 'axios'
import type {
  LearningResource,
  CreateLearningResourceDto,
  UpdateLearningResourceDto
} from '@9jang/shared'
import { api } from '../api/index'
import type { PaginatedResponse } from '../api/types'
import { normalizeLearningResourceResponse } from './resource.normalize'

export const resourceAPI = {
  getAll: async (params: Record<string, unknown> = {}): Promise<AxiosResponse<PaginatedResponse<LearningResource> | LearningResource[]>> => {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        query.append(key, String(value))
      }
    })
    const response = await api.get(`/cramschool/resources/?${query.toString()}`)

    // 驗證響應數據
    if (Array.isArray(response.data)) {
      response.data = (response.data as unknown[]).map((item) => normalizeLearningResourceResponse(item))
    } else if (response.data && typeof response.data === 'object' && 'results' in response.data) {
      const paginated = response.data as PaginatedResponse<unknown>
      paginated.results = paginated.results.map((item: unknown) => normalizeLearningResourceResponse(item))
    }

    return response as AxiosResponse<PaginatedResponse<LearningResource> | LearningResource[]>
  },

  getById: async (id: number): Promise<AxiosResponse<LearningResource>> => {
    const response = await api.get(`/cramschool/resources/${id}/`)
    return {
      ...response,
      data: normalizeLearningResourceResponse(response.data)
    }
  },

  create: async (data: CreateLearningResourceDto): Promise<AxiosResponse<LearningResource>> => {
    const response = await api.post('/cramschool/resources/', data)
    return {
      ...response,
      data: normalizeLearningResourceResponse(response.data)
    }
  },

  update: async (id: number, data: UpdateLearningResourceDto): Promise<AxiosResponse<LearningResource>> => {
    const response = await api.put(`/cramschool/resources/${id}/`, data)
    return {
      ...response,
      data: normalizeLearningResourceResponse(response.data)
    }
  },

  delete: async (id: number): Promise<AxiosResponse<void>> => {
    return api.delete(`/cramschool/resources/${id}/`)
  },

  export: async (id: number, formatType: string): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/resources/${id}/export/`, { format_type: formatType })
  },

  grade: async (id: number, submission: unknown): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/resources/${id}/grade/`, submission)
  },

  bindToCourse: async (id: number, courseId: number, action: 'add' | 'remove' = 'add'): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/resources/${id}/bind-to-course/`, { course_id: courseId, action })
  }
}
