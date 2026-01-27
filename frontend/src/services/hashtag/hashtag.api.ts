/**
 * Hashtag API
 */

import { AxiosResponse } from 'axios'
import { api } from '../api/index'

export const hashtagAPI = {
  getAll: async (): Promise<AxiosResponse<unknown>> => {
    return api.get('/cramschool/hashtags/')
  },
  getById: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/cramschool/hashtags/${id}/`)
  },
  create: async (data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.post('/cramschool/hashtags/', data)
  },
  update: async (id: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.put(`/cramschool/hashtags/${id}/`, data)
  },
  delete: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.delete(`/cramschool/hashtags/${id}/`)
  }
}
