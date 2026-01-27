/**
 * Generation API
 */

import { AxiosResponse } from 'axios'
import { api } from '../api/index'

export const generationAPI = {
  generateResource: async (data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.post('/cramschool/generate-resource/', data)
  }
}
