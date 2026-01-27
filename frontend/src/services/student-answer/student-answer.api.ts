/**
 * Student Answer API
 */

import { AxiosResponse } from 'axios'
import { api } from '../api/index'

export const studentAnswerAPI = {
  getAll: async (includeDeleted = false): Promise<AxiosResponse<unknown>> => {
    const params = includeDeleted ? '?include_deleted=true' : ''
    return api.get(`/cramschool/student-answers/${params}`)
  },
  getById: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/cramschool/student-answers/${id}/`)
  },
  create: async (data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.post('/cramschool/student-answers/', data)
  },
  update: async (id: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.put(`/cramschool/student-answers/${id}/`, data)
  },
  delete: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.delete(`/cramschool/student-answers/${id}/`)
  },
  restore: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/student-answers/${id}/restore/`)
  }
}
