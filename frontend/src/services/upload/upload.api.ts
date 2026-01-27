/**
 * Upload API
 */

import { AxiosResponse } from 'axios'
import { api } from '../api/index'

export const uploadImageAPI = {
  upload: async (file: File): Promise<AxiosResponse<unknown>> => {
    const formData = new FormData()
    formData.append('image', file)
    return api.post('/cramschool/upload-image/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    })
  },
  batchUpload: async (files: File[]): Promise<AxiosResponse<unknown>> => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('images', file)
      formData.append('original_names', file.name)
    })
    return api.post('/cramschool/batch-upload-images/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    })
  }
}
