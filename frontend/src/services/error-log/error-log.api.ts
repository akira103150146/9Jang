/**
 * Error Log API
 */

import { AxiosResponse } from 'axios'
import { api } from '../api/index'

export const errorLogAPI = {
  getAll: async (studentId: number | null = null, includeDeleted = false): Promise<AxiosResponse<unknown>> => {
    const params = new URLSearchParams()
    if (studentId) params.append('student', String(studentId))
    if (includeDeleted) params.append('include_deleted', 'true')
    const query = params.toString()
    const url = query ? `/cramschool/error-logs/?${query}` : '/cramschool/error-logs/'
    return api.get(url)
  },
  getById: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/cramschool/error-logs/${id}/`)
  },
  create: async (data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.post('/cramschool/error-logs/', data)
  },
  update: async (id: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.put(`/cramschool/error-logs/${id}/`, data)
  },
  delete: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.delete(`/cramschool/error-logs/${id}/`)
  },
  restore: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/error-logs/${id}/restore/`)
  },
  uploadImages: async (id: number, formData: FormData): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/error-logs/${id}/upload-images/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  reorderImages: async (id: number, imageIds: number[]): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/error-logs/${id}/reorder-images/`, { image_ids: imageIds })
  },
  importToQuestionBank: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/error-logs/${id}/import-to-question-bank/`)
  }
}
