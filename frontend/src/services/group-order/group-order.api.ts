/**
 * Group Order API
 */

import { AxiosResponse } from 'axios'
import { api } from '../api/index'

export const groupOrderAPI = {
  getAll: async (): Promise<AxiosResponse<unknown>> => {
    return api.get('/cramschool/group-orders/')
  },
  getById: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/cramschool/group-orders/${id}/`)
  },
  create: async (data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.post('/cramschool/group-orders/', data)
  },
  update: async (id: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.put(`/cramschool/group-orders/${id}/`, data)
  },
  delete: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.delete(`/cramschool/group-orders/${id}/`)
  },
  complete: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/group-orders/${id}/complete/`)
  }
}
