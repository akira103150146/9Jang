/**
 * Course PDF API
 * 課程 PDF 講義相關 API
 */

import { AxiosResponse } from 'axios'
import { api } from '../api/index'

export interface CoursePdf {
  pdf_id: number
  title: string
  description?: string | null
  file_path: string
  file_size: number
  course_id: number
  uploaded_by_id: number
  student_group_ids: number[]
  allow_download: boolean
  is_visible_to_all: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UploadPdfData {
  title: string
  description?: string
  student_group_ids?: number[]
  is_visible_to_all?: boolean
  allow_download?: boolean
  is_active?: boolean
}

export interface UpdatePdfData {
  title?: string
  description?: string
  student_group_ids?: number[]
  is_visible_to_all?: boolean
  allow_download?: boolean
  is_active?: boolean
}

export const coursePdfAPI = {
  /**
   * 取得課程的所有 PDF 列表
   */
  getAll: async (courseId: number): Promise<AxiosResponse<CoursePdf[]>> => {
    return api.get(`/cramschool/courses/${courseId}/pdfs`)
  },

  /**
   * 上傳 PDF 檔案
   */
  upload: async (
    courseId: number,
    file: File,
    data: UploadPdfData
  ): Promise<AxiosResponse<CoursePdf>> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', data.title)
    
    if (data.description) {
      formData.append('description', data.description)
    }
    
    formData.append('is_visible_to_all', String(data.is_visible_to_all ?? false))
    formData.append('allow_download', String(data.allow_download ?? false))
    formData.append('is_active', String(data.is_active ?? true))
    
    if (data.student_group_ids && data.student_group_ids.length > 0) {
      formData.append('student_group_ids', JSON.stringify(data.student_group_ids))
    }

    return api.post(`/cramschool/courses/${courseId}/pdfs/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  /**
   * 檢視 PDF (返回 URL)
   */
  getViewUrl: (courseId: number, pdfId: number): string => {
    const baseUrl = api.defaults.baseURL || ''
    return `${baseUrl}/cramschool/courses/${courseId}/pdfs/${pdfId}/view`
  },

  /**
   * 下載 PDF (返回 URL)
   */
  getDownloadUrl: (courseId: number, pdfId: number): string => {
    const baseUrl = api.defaults.baseURL || ''
    return `${baseUrl}/cramschool/courses/${courseId}/pdfs/${pdfId}/download`
  },

  /**
   * 切換下載權限
   */
  toggleDownload: async (
    courseId: number,
    pdfId: number,
    allowDownload: boolean
  ): Promise<AxiosResponse<CoursePdf>> => {
    return api.put(`/cramschool/courses/${courseId}/pdfs/${pdfId}/download`, {
      allow_download: allowDownload
    })
  },

  /**
   * 更新 PDF 資訊
   */
  update: async (
    courseId: number,
    pdfId: number,
    data: UpdatePdfData
  ): Promise<AxiosResponse<CoursePdf>> => {
    return api.put(`/cramschool/courses/${courseId}/pdfs/${pdfId}`, data)
  },

  /**
   * 刪除 PDF
   */
  delete: async (courseId: number, pdfId: number): Promise<AxiosResponse<{ message: string }>> => {
    return api.delete(`/cramschool/courses/${courseId}/pdfs/${pdfId}`)
  }
}
