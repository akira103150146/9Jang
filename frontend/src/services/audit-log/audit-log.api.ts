/**
 * Audit Log API
 */

import { AxiosResponse } from 'axios'
import { api } from '../api/index'

export const auditLogAPI = {
  getAll: async (filters: Record<string, unknown> = {}): Promise<AxiosResponse<unknown>> => {
    const params = new URLSearchParams()
    if (filters.user) params.append('user', String(filters.user))
    if (filters.role) params.append('role', String(filters.role))
    if (filters.action_type) params.append('action_type', String(filters.action_type))
    if (filters.mode) params.append('mode', String(filters.mode))
    const query = params.toString()
    return api.get(`/account/audit-logs/${query ? `?${query}` : ''}`)
  },
  getById: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/account/audit-logs/${id}/`)
  }
}
