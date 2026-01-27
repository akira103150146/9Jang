/**
 * Question API
 */

import { AxiosResponse } from 'axios'
import type {
  Question,
  CreateQuestionDto,
  UpdateQuestionDto,
  QuestionQuery
} from '@9jang/shared'
import { api } from '../api/index'
import type { PaginatedResponse } from '../api/types'
import { normalizeQuestionResponse } from './question.normalize'

export const questionBankAPI = {
  getAll: async (config: { params?: QuestionQuery } = {}): Promise<AxiosResponse<PaginatedResponse<Question> | Question[]>> => {
    let response: AxiosResponse<unknown>
    
    if (config.params) {
      const params = new URLSearchParams()
      Object.entries(config.params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, String(v)))
        } else if (value) {
          params.append(key, String(value))
        }
      })
      response = await api.get(`/cramschool/questions/?${params.toString()}`)
    } else {
      response = await api.get('/cramschool/questions/', config)
    }
    
    // 驗證響應數據
    if (Array.isArray(response.data)) {
      response.data = (response.data as unknown[]).map((item) => normalizeQuestionResponse(item))
    } else if (response.data && typeof response.data === 'object' && 'results' in response.data) {
      const paginated = response.data as PaginatedResponse<unknown>
      paginated.results = paginated.results.map((item: unknown) => normalizeQuestionResponse(item))
    }
    
    return response as AxiosResponse<PaginatedResponse<Question> | Question[]>
  },

  getById: async (id: number): Promise<AxiosResponse<Question>> => {
    const response = await api.get(`/cramschool/questions/${id}/`)
    return {
      ...response,
      data: normalizeQuestionResponse(response.data)
    }
  },

  create: async (data: CreateQuestionDto): Promise<AxiosResponse<Question>> => {
    const response = await api.post('/cramschool/questions/', data)
    return {
      ...response,
      data: normalizeQuestionResponse(response.data)
    }
  },

  update: async (id: number, data: UpdateQuestionDto): Promise<AxiosResponse<Question>> => {
    const response = await api.put(`/cramschool/questions/${id}/`, data)
    return {
      ...response,
      data: normalizeQuestionResponse(response.data)
    }
  },

  delete: async (id: number): Promise<AxiosResponse<void>> => {
    return api.delete(`/cramschool/questions/${id}/`)
  },

  searchChapters: async (query: string, subjectId: number | null = null, level: string | null = null): Promise<AxiosResponse<unknown>> => {
    const params = new URLSearchParams({ q: query })
    if (subjectId) params.append('subject', String(subjectId))
    if (level) params.append('level', level)
    return api.get(`/cramschool/questions/search_chapters/?${params.toString()}`)
  },

  getSourceOptions: async (): Promise<AxiosResponse<unknown>> => {
    return api.get('/cramschool/questions/source_options/')
  },

  previewFromWord: async (formData: FormData): Promise<AxiosResponse<unknown>> => {
    return api.post('/cramschool/questions/preview_from_word/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  importFromWord: async (formData: FormData): Promise<AxiosResponse<unknown>> => {
    return api.post('/cramschool/questions/import_from_word/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  previewFromMarkdown: async (formData: FormData): Promise<AxiosResponse<unknown>> => {
    return api.post('/cramschool/questions/preview_from_markdown/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  importFromMarkdown: async (formData: FormData): Promise<AxiosResponse<unknown>> => {
    return api.post('/cramschool/questions/import_from_markdown/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  exportToLatex: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/cramschool/questions/${id}/export_to_latex/`)
  },

  exportToMarkdown: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/cramschool/questions/${id}/export_to_markdown/`)
  }
}
