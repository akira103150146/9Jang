/**
 * Error Log Image API
 */

import { AxiosResponse } from 'axios'
import { api } from '../api/index'

export const errorLogImageAPI = {
  update: async (id: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.put(`/cramschool/error-log-images/${id}/`, data)
  },
  delete: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.delete(`/cramschool/error-log-images/${id}/`)
  }
}
