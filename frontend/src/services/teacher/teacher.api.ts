/**
 * Teacher API
 */

import { AxiosResponse } from 'axios'
import type {
  Teacher,
  CreateTeacherDto,
  UpdateTeacherDto
} from '@9jang/shared'
import { api } from '../api/index'
import { normalizeTeacherResponse } from './teacher.normalize'

export const teacherAPI = {
  getAll: async (): Promise<AxiosResponse<Teacher[]>> => {
    const response = await api.get('/cramschool/teachers/')
    // 處理分頁響應格式或直接數組格式
    const dataArray = Array.isArray(response.data)
      ? response.data
      : (response.data as { results?: unknown[] }).results || []
    return {
      ...response,
      data: dataArray.map((item) => normalizeTeacherResponse(item))
    }
  },

  getById: async (id: number): Promise<AxiosResponse<Teacher>> => {
    const response = await api.get(`/cramschool/teachers/${id}/`)
    return {
      ...response,
      data: normalizeTeacherResponse(response.data)
    }
  },

  create: async (data: CreateTeacherDto): Promise<AxiosResponse<Teacher>> => {
    const response = await api.post('/cramschool/teachers/', data)
    return {
      ...response,
      data: normalizeTeacherResponse(response.data)
    }
  },

  update: async (id: number, data: UpdateTeacherDto): Promise<AxiosResponse<Teacher>> => {
    const response = await api.put(`/cramschool/teachers/${id}/`, data)
    return {
      ...response,
      data: normalizeTeacherResponse(response.data)
    }
  },

  delete: async (id: number): Promise<AxiosResponse<void>> => {
    return api.delete(`/cramschool/teachers/${id}/`)
  }
}
