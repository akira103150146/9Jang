/**
 * Student Mistake Note Image API
 */

import { AxiosResponse } from 'axios'
import { api } from '../api/index'

export const studentMistakeNoteImageAPI = {
  update: async (id: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.put(`/cramschool/student-mistake-note-images/${id}/`, data)
  },
  delete: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.delete(`/cramschool/student-mistake-note-images/${id}/`)
  }
}
