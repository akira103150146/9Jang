/**
 * Student Group API
 */

import { AxiosResponse } from 'axios'
import { api } from '../api/index'

export const studentGroupAPI = {
  getAll: async (): Promise<AxiosResponse<unknown>> => {
    return api.get('/cramschool/student-groups/')
  },
  getById: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/cramschool/student-groups/${id}/`)
  },
  create: async (data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.post('/cramschool/student-groups/', data)
  },
  update: async (id: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.put(`/cramschool/student-groups/${id}/`, data)
  },
  delete: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.delete(`/cramschool/student-groups/${id}/`)
  },
  addStudents: async (id: number, studentIds: number[]): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/student-groups/${id}/add-students/`, { student_ids: studentIds })
  },
  removeStudents: async (id: number, studentIds: number[]): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/student-groups/${id}/remove-students/`, { student_ids: studentIds })
  }
}
