/**
 * Enrollment Period API
 */

import { AxiosResponse } from 'axios'
import { api } from '../api/index'

export const enrollmentPeriodAPI = {
  getAll: async (): Promise<AxiosResponse<unknown>> => {
    return api.get('/cramschool/enrollment-periods/')
  },
  getById: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/cramschool/enrollment-periods/${id}/`)
  },
  getByEnrollment: async (enrollmentId: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/cramschool/enrollment-periods/?enrollment=${enrollmentId}`)
  },
  create: async (data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.post('/cramschool/enrollment-periods/', data)
  },
  update: async (id: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.put(`/cramschool/enrollment-periods/${id}/`, data)
  },
  delete: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.delete(`/cramschool/enrollment-periods/${id}/`)
  }
}
