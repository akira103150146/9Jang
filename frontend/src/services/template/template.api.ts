/**
 * Template API
 */

import { AxiosResponse } from 'axios'
import type {
  ContentTemplate,
  CreateContentTemplateDto,
  UpdateContentTemplateDto
} from '@9jang/shared'
import { api } from '../api/index'
import type { PaginatedResponse } from '../api/types'
import { normalizeContentTemplateResponse } from './template.normalize'

export const templateAPI = {
  getAll: async (params: Record<string, unknown> = {}): Promise<AxiosResponse<PaginatedResponse<ContentTemplate> | ContentTemplate[]>> => {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        query.append(key, String(value))
      }
    })
    const response = await api.get(`/cramschool/templates/?${query.toString()}`)

    // 驗證響應數據
    if (Array.isArray(response.data)) {
      response.data = (response.data as unknown[]).map((item) => normalizeContentTemplateResponse(item))
    } else if (response.data && typeof response.data === 'object' && 'results' in response.data) {
      const paginated = response.data as PaginatedResponse<unknown>
      paginated.results = paginated.results.map((item: unknown) => normalizeContentTemplateResponse(item))
    }

    return response as AxiosResponse<PaginatedResponse<ContentTemplate> | ContentTemplate[]>
  },

  getById: async (id: number): Promise<AxiosResponse<ContentTemplate>> => {
    const response = await api.get(`/cramschool/templates/${id}/`)
    return {
      ...response,
      data: normalizeContentTemplateResponse(response.data)
    }
  },

  create: async (data: CreateContentTemplateDto): Promise<AxiosResponse<ContentTemplate>> => {
    const response = await api.post('/cramschool/templates/', data)
    return {
      ...response,
      data: normalizeContentTemplateResponse(response.data)
    }
  },

  update: async (id: number, data: UpdateContentTemplateDto): Promise<AxiosResponse<ContentTemplate>> => {
    const response = await api.put(`/cramschool/templates/${id}/`, data)
    return {
      ...response,
      data: normalizeContentTemplateResponse(response.data)
    }
  },

  delete: async (id: number): Promise<AxiosResponse<void>> => {
    return api.delete(`/cramschool/templates/${id}/`)
  }
}
