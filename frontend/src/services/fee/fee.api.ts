/**
 * Fee API
 */

import { AxiosResponse } from 'axios'
import { api } from '../api/index'

export const feeAPI = {
  getAll: async (includeDeleted = false): Promise<AxiosResponse<unknown>> => {
    const params = includeDeleted ? '?include_deleted=true' : ''
    return api.get(`/cramschool/fees/${params}`)
  },
  getById: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/cramschool/fees/${id}/`)
  },
  getByStudent: async (studentId: number, includeDeleted = false): Promise<AxiosResponse<unknown>> => {
    const params = new URLSearchParams({ student: String(studentId) })
    if (includeDeleted) params.append('include_deleted', 'true')
    return api.get(`/cramschool/fees/?${params.toString()}`)
  },
  batchUpdate: async (feeIds: number[], paymentStatus: string): Promise<AxiosResponse<unknown>> => {
    return api.post('/cramschool/fees/batch-update/', {
      fee_ids: feeIds,
      payment_status: paymentStatus
    })
  },
  create: async (data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.post('/cramschool/fees/', data)
  },
  update: async (id: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.put(`/cramschool/fees/${id}/`, data)
  },
  delete: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.delete(`/cramschool/fees/${id}/`)
  },
  restore: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/fees/${id}/restore/`)
  }
}
