/**
 * Order API
 */

import { AxiosResponse } from 'axios'
import { api } from '../api/index'

export const orderAPI = {
  getAll: async (groupOrderId: number | null = null, studentId: number | null = null, includeDeleted = false): Promise<AxiosResponse<unknown>> => {
    const params = new URLSearchParams()
    if (groupOrderId) params.append('group_order', String(groupOrderId))
    if (studentId) params.append('student', String(studentId))
    if (includeDeleted) params.append('include_deleted', 'true')
    const query = params.toString()
    return api.get(`/cramschool/orders/${query ? `?${query}` : ''}`)
  },
  getById: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/cramschool/orders/${id}/`)
  },
  create: async (data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.post('/cramschool/orders/', data)
  },
  update: async (id: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.put(`/cramschool/orders/${id}/`, data)
  },
  delete: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.delete(`/cramschool/orders/${id}/`)
  },
  restore: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/orders/${id}/restore/`)
  }
}
