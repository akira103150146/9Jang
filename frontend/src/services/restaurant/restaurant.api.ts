/**
 * Restaurant API
 */

import { AxiosResponse } from 'axios'
import { api } from '../api/index'

export const restaurantAPI = {
  getAll: async (): Promise<AxiosResponse<unknown>> => {
    return api.get('/cramschool/restaurants/')
  },
  getById: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/cramschool/restaurants/${id}/`)
  },
  create: async (data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.post('/cramschool/restaurants/', data)
  },
  update: async (id: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.put(`/cramschool/restaurants/${id}/`, data)
  },
  delete: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.delete(`/cramschool/restaurants/${id}/`)
  }
}
