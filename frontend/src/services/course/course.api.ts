/**
 * Course API
 */

import { AxiosResponse } from 'axios'
import type {
  Course,
  CreateCourseDto,
  UpdateCourseDto
} from '@9jang/shared'
import { api } from '../api/index'
import { normalizeCourseResponse } from './course.normalize'

export const courseAPI = {
  getAll: async (): Promise<AxiosResponse<Course[]>> => {
    const response = await api.get('/cramschool/courses/')
    // 處理分頁響應格式或直接數組格式
    const dataArray = Array.isArray(response.data)
      ? response.data
      : (response.data as { results?: unknown[] }).results || []
    return {
      ...response,
      data: dataArray.map((item) => normalizeCourseResponse(item))
    }
  },

  getById: async (id: number): Promise<AxiosResponse<Course>> => {
    const response = await api.get(`/cramschool/courses/${id}/`)
    return {
      ...response,
      data: normalizeCourseResponse(response.data)
    }
  },

  create: async (data: CreateCourseDto): Promise<AxiosResponse<Course>> => {
    const response = await api.post('/cramschool/courses/', data)
    return {
      ...response,
      data: normalizeCourseResponse(response.data)
    }
  },

  update: async (id: number, data: UpdateCourseDto): Promise<AxiosResponse<Course>> => {
    const response = await api.put(`/cramschool/courses/${id}/`, data)
    return {
      ...response,
      data: normalizeCourseResponse(response.data)
    }
  },

  delete: async (id: number): Promise<AxiosResponse<void>> => {
    return api.delete(`/cramschool/courses/${id}/`)
  },

  getStudentStatus: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/cramschool/courses/${id}/student-status/`)
  },

  getResources: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/cramschool/courses/${id}/resources/`)
  },

  // PDF 相關方法
  getPdfs: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/cramschool/courses/${id}/pdfs`)
  },

  uploadPdf: async (id: number, formData: FormData): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/courses/${id}/pdfs/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  togglePdfDownload: async (courseId: number, pdfId: number, allowDownload: boolean): Promise<AxiosResponse<unknown>> => {
    return api.put(`/cramschool/courses/${courseId}/pdfs/${pdfId}/download`, {
      allow_download: allowDownload
    })
  },

  updatePdf: async (courseId: number, pdfId: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.put(`/cramschool/courses/${courseId}/pdfs/${pdfId}`, data)
  },

  deletePdf: async (courseId: number, pdfId: number): Promise<AxiosResponse<unknown>> => {
    return api.delete(`/cramschool/courses/${courseId}/pdfs/${pdfId}`)
  }
}
