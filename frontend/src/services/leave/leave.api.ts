/**
 * Leave API
 */

import { AxiosResponse } from 'axios'
import { api } from '../api/index'

export const leaveAPI = {
  getAll: async (includeDeleted = false): Promise<AxiosResponse<unknown>> => {
    const params = includeDeleted ? '?include_deleted=true' : ''
    return api.get(`/cramschool/leaves/${params}`)
  },
  getById: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/cramschool/leaves/${id}/`)
  },
  create: async (data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.post('/cramschool/leaves/', data)
  },
  update: async (id: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.put(`/cramschool/leaves/${id}/`, data)
  },
  delete: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.delete(`/cramschool/leaves/${id}/`)
  },
  restore: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/leaves/${id}/restore/`)
  }
}
