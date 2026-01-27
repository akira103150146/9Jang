/**
 * Role Permission API
 */

import { AxiosResponse } from 'axios'
import { api } from '../api/index'

export const rolePermissionAPI = {
  getAll: async (roleId: number | null = null): Promise<AxiosResponse<unknown>> => {
    const url = roleId ? `/account/role-permissions/?role=${roleId}` : '/account/role-permissions/'
    return api.get(url)
  },
  getById: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/account/role-permissions/${id}/`)
  },
  create: async (data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.post('/account/role-permissions/', data)
  },
  update: async (id: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.put(`/account/role-permissions/${id}/`, data)
  },
  delete: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.delete(`/account/role-permissions/${id}/`)
  }
}
