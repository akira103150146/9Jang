/**
 * Attendance API
 */

import { AxiosResponse } from 'axios'
import { api } from '../api/index'

export const attendanceAPI = {
  getAll: async (includeDeleted = false): Promise<AxiosResponse<unknown>> => {
    const params = includeDeleted ? '?include_deleted=true' : ''
    return api.get(`/cramschool/attendances/${params}`)
  },
  getById: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/cramschool/attendances/${id}/`)
  },
  create: async (data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.post('/cramschool/attendances/', data)
  },
  update: async (id: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.put(`/cramschool/attendances/${id}/`, data)
  },
  delete: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.delete(`/cramschool/attendances/${id}/`)
  },
  restore: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/attendances/${id}/restore/`)
  }
}
