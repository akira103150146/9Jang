/**
 * Auth API
 */

import { AxiosResponse } from 'axios'
import type {
  User,
  LoginRequestDto,
  LoginResponse,
  RefreshTokenRequestDto,
  RefreshTokenResponse,
  ChangePasswordRequestDto
} from '@9jang/shared'
import {
  UserSchema,
  LoginResponseSchema,
  RefreshTokenResponseSchema
} from '@9jang/shared'
import { api } from '../api/index'
import { setTokens, getRefreshToken, clearTokens } from '../api/token'
import { logger } from '../../utils/logger'

export const authAPI = {
  login: async (email: string, password: string): Promise<AxiosResponse<LoginResponse>> => {
    const response = await api.post<LoginResponse>('/account/login/', {
      email,
      password
    } as LoginRequestDto)

    // 驗證響應
    const validated = LoginResponseSchema.parse(response.data)

    // 保存 token 和用戶信息
    if (validated.access) {
      setTokens(validated.access, validated.refresh)
      if (validated.user) {
        localStorage.setItem('user', JSON.stringify(validated.user))
      }
    }

    return {
      ...response,
      data: validated
    }
  },

  logout: async (): Promise<void> => {
    const refreshToken = getRefreshToken()
    try {
      await api.post('/account/logout/', { refresh: refreshToken })
    } catch (error) {
      logger.errorWithContext('authAPI.logout', error as Error)
    } finally {
      clearTokens()
    }
  },

  refreshToken: async (): Promise<AxiosResponse<RefreshTokenResponse>> => {
    const response = await api.post<RefreshTokenResponse>('/account/token/refresh/', {
      refresh: getRefreshToken()
    } as RefreshTokenRequestDto)
    return {
      ...response,
      data: RefreshTokenResponseSchema.parse(response.data)
    }
  },

  getCurrentUser: async (): Promise<AxiosResponse<User>> => {
    const response = await api.get('/account/users/me/')
    return {
      ...response,
      data: UserSchema.parse(response.data)
    }
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<AxiosResponse<unknown>> => {
    return api.post('/account/change-password/', {
      old_password: oldPassword,
      new_password: newPassword
    } as ChangePasswordRequestDto)
  },

  impersonateUser: async (userId: number): Promise<AxiosResponse<unknown>> => {
    return api.post('/account/impersonate-user/', { user_id: userId })
  }
}
