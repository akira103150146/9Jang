/**
 * Student Mistake Note API
 */

import { AxiosResponse } from 'axios'
import { api } from '../api/index'

export const studentMistakeNoteAPI = {
  getAll: async (queryString: string | Record<string, unknown> = ''): Promise<AxiosResponse<unknown>> => {
    if (typeof queryString === 'string' && queryString) {
      return api.get(`/cramschool/student-mistake-notes/?${queryString}`)
    }
    if (typeof queryString === 'object') {
      const params = new URLSearchParams()
      if (queryString.q) params.append('q', String(queryString.q))
      if (queryString.includeDeleted) params.append('include_deleted', 'true')
      if (queryString.student_id) params.append('student_id', String(queryString.student_id))
      const query = params.toString()
      return api.get(`/cramschool/student-mistake-notes/${query ? `?${query}` : ''}`)
    }
    return api.get('/cramschool/student-mistake-notes/')
  },
  getById: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/cramschool/student-mistake-notes/${id}/`)
  },
  create: async (data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.post('/cramschool/student-mistake-notes/', data)
  },
  update: async (id: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.put(`/cramschool/student-mistake-notes/${id}/`, data)
  },
  delete: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.delete(`/cramschool/student-mistake-notes/${id}/`)
  },
  restore: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/student-mistake-notes/${id}/restore/`)
  },
  uploadImages: async (id: number, formData: FormData): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/student-mistake-notes/${id}/upload-images/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  reorderImages: async (id: number, imageIds: number[]): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/student-mistake-notes/${id}/reorder-images/`, { image_ids: imageIds })
  },
  importToQuestionBank: async (id: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/student-mistake-notes/${id}/import-to-question-bank/`, data)
  }
}
