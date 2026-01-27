/**
 * Role Switch API
 */

import { AxiosResponse } from 'axios'
import { api } from '../api/index'

export const roleSwitchAPI = {
  switchRole: async (role: string): Promise<AxiosResponse<unknown>> => {
    return api.post('/account/switch-role/', { role })
  },
  resetRole: async (): Promise<AxiosResponse<unknown>> => {
    return api.post('/account/reset-role/')
  },
  getCurrentRole: async (): Promise<AxiosResponse<unknown>> => {
    return api.get('/account/current-role/')
  }
}
