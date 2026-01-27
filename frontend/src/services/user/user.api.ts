/**
 * User API
 */

import { AxiosResponse } from 'axios'
import type { User } from '@9jang/shared'
import { UserSchema } from '@9jang/shared'
import { api } from '../api/index'

export const userAPI = {
  getAll: async (): Promise<AxiosResponse<unknown>> => {
    return api.get('/account/users/')
  },
  getById: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/account/users/${id}/`)
  },
  update: async (id: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.put(`/account/users/${id}/`, data)
  },
  getCurrentUser: async (): Promise<AxiosResponse<User>> => {
    const response = await api.get('/account/users/me/')
    return {
      ...response,
      data: UserSchema.parse(response.data)
    }
  }
}
