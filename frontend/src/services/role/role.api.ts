/**
 * Role API
 */

import { AxiosResponse } from 'axios'
import { api } from '../api/index'

export const roleAPI = {
  getAll: async (): Promise<AxiosResponse<unknown>> => {
    return api.get('/account/roles/')
  },
  getById: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/account/roles/${id}/`)
  },
  create: async (data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.post('/account/roles/', data)
  },
  update: async (id: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.put(`/account/roles/${id}/`, data)
  },
  delete: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.delete(`/account/roles/${id}/`)
  },
  updatePermissions: async (id: number, permissions: unknown): Promise<AxiosResponse<unknown>> => {
    return api.post(`/account/roles/${id}/permissions/`, { permissions })
  }
}
