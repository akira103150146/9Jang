import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { z } from 'zod'
import type {
  User,
  LoginRequestDto,
  LoginResponse,
  RefreshTokenRequestDto,
  RefreshTokenResponse,
  ChangePasswordRequestDto,
  Student,
  CreateStudentDto,
  UpdateStudentDto,
  StudentQuery,
  StudentTuitionStatus,
  Teacher,
  CreateTeacherDto,
  UpdateTeacherDto,
  Course,
  CreateCourseDto,
  UpdateCourseDto,
  Question,
  CreateQuestionDto,
  UpdateQuestionDto,
  QuestionQuery,
  LearningResource,
  CreateLearningResourceDto,
  UpdateLearningResourceDto,
  ContentTemplate,
  CreateContentTemplateDto,
  UpdateContentTemplateDto
} from '@9jang/shared'
import {
  UserSchema,
  LoginResponseSchema,
  RefreshTokenResponseSchema,
  StudentSchema,
  StudentTuitionStatusSchema,
  TeacherSchema,
  CourseSchema,
  QuestionSchema,
  LearningResourceSchema,
  ContentTemplateSchema
} from '@9jang/shared'
import { logger } from '../utils/logger'

// 從環境變數獲取 API 基礎 URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

/**
 * API 響應包裝類型
 */
interface ApiResponse<T> {
  data: T
  status: number
  statusText: string
}

/**
 * 分頁響應類型
 */
interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

/**
 * 創建 Axios 實例
 */
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 允許發送 cookies（用於 session 支持）
})

/**
 * Token 管理工具函數
 */
const getToken = (): string | null => {
  return localStorage.getItem('access_token')
}

const getRefreshToken = (): string | null => {
  return localStorage.getItem('refresh_token')
}

export const setTokens = (access: string, refresh?: string): void => {
  localStorage.setItem('access_token', access)
  if (refresh) {
    localStorage.setItem('refresh_token', refresh)
  }
}

export const clearTokens = (): void => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
}

/**
 * 刷新 access token
 */
const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw new Error('No refresh token')
  }

  try {
    const response = await api.post<RefreshTokenResponse>('/account/token/refresh/', {
      refresh: refreshToken
    } as RefreshTokenRequestDto)
    
    // 使用 Zod 驗證響應
    const validated = RefreshTokenResponseSchema.parse(response.data)
    const { access } = validated
    localStorage.setItem('access_token', access)
    return access
  } catch (error) {
    clearTokens()
    throw error
  }
}

/**
 * 請求攔截器：添加 JWT token 和臨時角色 header
 */
api.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 添加臨時角色 header（如果存在）
    const tempRole = localStorage.getItem('temp_role')
    if (tempRole) {
      config.headers['X-Temp-Role'] = tempRole
    }

    // 添加原始管理員 ID header（如果存在，表示當前處於模擬狀態）
    const originalUser = localStorage.getItem('original_user')
    if (originalUser) {
      try {
        const adminUser = JSON.parse(originalUser) as { id?: number }
        if (adminUser.id) {
          config.headers['X-Impersonated-By'] = adminUser.id.toString()
        }
      } catch (e) {
        // 如果解析失敗，忽略
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * 回應攔截器：處理認證錯誤和 token 刷新
 */
let isRefreshing = false
interface QueuedRequest {
  resolve: (token: string) => void
  reject: (error: unknown) => void
}
const failedQueue: QueuedRequest[] = []

const processQueue = (error: unknown | null, token: string | null = null): void => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token!)
    }
  })
  failedQueue.length = 0
}

api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    // 如果是 401 錯誤且不是登入請求，嘗試刷新 token
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/api/account/login/') {
      // 如果當前在登入頁面，不嘗試刷新 token
      if (window.location.pathname === '/login') {
        return Promise.reject(error)
      }

      // 檢查是否有 refresh token，如果沒有則不嘗試刷新
      const refreshToken = getRefreshToken()
      if (!refreshToken) {
        clearTokens()
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // 如果正在刷新，將請求加入隊列
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`
              // 重新設置臨時角色 header（如果存在）
              const tempRole = localStorage.getItem('temp_role')
              if (tempRole) {
                originalRequest.headers['X-Temp-Role'] = tempRole
              }
              // 重新設置原始管理員 header（如果存在）
              const originalUser = localStorage.getItem('original_user')
              if (originalUser) {
                try {
                  const adminUser = JSON.parse(originalUser) as { id?: number }
                  if (adminUser.id) {
                    originalRequest.headers['X-Impersonated-By'] = adminUser.id.toString()
                  }
                } catch (e) {
                  // 如果解析失敗，忽略
                }
              }
            }
            return api(originalRequest)
          })
          .catch(err => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const newToken = await refreshAccessToken()
        processQueue(null, newToken)
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          // 重新設置臨時角色 header（如果存在）
          const tempRole = localStorage.getItem('temp_role')
          if (tempRole) {
            originalRequest.headers['X-Temp-Role'] = tempRole
          }
          // 重新設置原始管理員 header（如果存在）
          const originalUser = localStorage.getItem('original_user')
          if (originalUser) {
            try {
              const adminUser = JSON.parse(originalUser) as { id?: number }
              if (adminUser.id) {
                originalRequest.headers['X-Impersonated-By'] = adminUser.id.toString()
              }
            } catch (e) {
              // 如果解析失敗，忽略
            }
          }
        }
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearTokens()
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

/**
 * 類型安全的 API 響應驗證工具
 * 使用 Zod schema 驗證響應數據
 */
function validateResponse<T>(
  response: AxiosResponse<unknown>,
  schema: z.ZodSchema<T>
): T {
  try {
    return schema.parse(response.data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.errorWithContext(
        'api.validateResponse',
        new Error('API 響應驗證失敗'),
        { errors: error.errors, data: response.data }
      )
    }
    throw error
  }
}

/**
 * Student API
 */
export const studentAPI = {
  /**
   * 獲取所有學生（支持查詢參數）
   */
  getAll: async (includeDeleted = false, queryParams: StudentQuery | string = ''): Promise<AxiosResponse<PaginatedResponse<Student> | Student[]>> => {
    const params = new URLSearchParams()
    if (includeDeleted) params.append('include_deleted', 'true')
    
    if (typeof queryParams === 'string') {
      const existingParams = new URLSearchParams(queryParams)
      existingParams.forEach((value, key) => {
        params.append(key, value)
      })
    } else {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, String(value))
        }
      })
    }
    
    const queryString = params.toString()
    const response = await api.get(`/cramschool/students/${queryString ? `?${queryString}` : ''}`)
    
    // 驗證響應數據
    if (Array.isArray(response.data)) {
      response.data = response.data.map((item: unknown) => StudentSchema.parse(item))
    } else if (response.data && typeof response.data === 'object' && 'results' in response.data) {
      const paginated = response.data as PaginatedResponse<unknown>
      paginated.results = paginated.results.map((item: unknown) => StudentSchema.parse(item))
    }
    
    return response
  },

  /**
   * 獲取單個學生
   */
  getById: async (id: number): Promise<AxiosResponse<Student>> => {
    const response = await api.get(`/cramschool/students/${id}/`)
    return {
      ...response,
      data: StudentSchema.parse(response.data)
    }
  },

  /**
   * 創建學生
   */
  create: async (data: CreateStudentDto): Promise<AxiosResponse<Student>> => {
    const response = await api.post('/cramschool/students/', data)
    return {
      ...response,
      data: StudentSchema.parse(response.data)
    }
  },

  /**
   * 更新學生
   */
  update: async (id: number, data: UpdateStudentDto): Promise<AxiosResponse<Student>> => {
    const response = await api.put(`/cramschool/students/${id}/`, data)
    return {
      ...response,
      data: StudentSchema.parse(response.data)
    }
  },

  /**
   * 刪除學生
   */
  delete: async (id: number): Promise<AxiosResponse<void>> => {
    return api.delete(`/cramschool/students/${id}/`)
  },

  /**
   * 獲取學生學費狀態
   */
  getTuitionStatus: async (id: number): Promise<AxiosResponse<StudentTuitionStatus>> => {
    const response = await api.get(`/cramschool/students/${id}/tuition_status/`)
    return {
      ...response,
      data: StudentTuitionStatusSchema.parse(response.data)
    }
  },

  /**
   * 生成學費
   */
  generateTuition: async (id: number, data: { weeks?: number }): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/students/${id}/generate_tuition/`, data)
  },

  /**
   * 批次生成所有學生的學費
   */
  batchGenerateTuitions: async (studentIds: number[] | null = null, weeks = 4): Promise<AxiosResponse<unknown>> => {
    const requestData: { weeks: number; student_ids?: number[] } = { weeks }
    if (studentIds && studentIds.length > 0) {
      requestData.student_ids = studentIds
    }
    return api.post('/cramschool/students/batch-generate-tuitions/', requestData)
  },

  /**
   * 重置學生密碼
   */
  resetPassword: async (id: number, password: string): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/students/${id}/reset-password/`, { password })
  },

  /**
   * 切換帳號狀態
   */
  toggleAccountStatus: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/students/${id}/toggle-account-status/`)
  },

  /**
   * 獲取學生出缺勤和請假記錄
   */
  getAttendanceAndLeaves: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/cramschool/students/${id}/attendance_and_leaves/`)
  },

  /**
   * 恢復已刪除的學生
   */
  restore: async (id: number): Promise<AxiosResponse<Student>> => {
    const response = await api.post(`/cramschool/students/${id}/restore/`)
    return {
      ...response,
      data: StudentSchema.parse(response.data)
    }
  }
}

/**
 * Teacher API
 */
export const teacherAPI = {
  getAll: async (): Promise<AxiosResponse<Teacher[]>> => {
    const response = await api.get('/cramschool/teachers/')
    return {
      ...response,
      data: (response.data as unknown[]).map((item) => TeacherSchema.parse(item))
    }
  },

  getById: async (id: number): Promise<AxiosResponse<Teacher>> => {
    const response = await api.get(`/cramschool/teachers/${id}/`)
    return {
      ...response,
      data: TeacherSchema.parse(response.data)
    }
  },

  create: async (data: CreateTeacherDto): Promise<AxiosResponse<Teacher>> => {
    const response = await api.post('/cramschool/teachers/', data)
    return {
      ...response,
      data: TeacherSchema.parse(response.data)
    }
  },

  update: async (id: number, data: UpdateTeacherDto): Promise<AxiosResponse<Teacher>> => {
    const response = await api.put(`/cramschool/teachers/${id}/`, data)
    return {
      ...response,
      data: TeacherSchema.parse(response.data)
    }
  },

  delete: async (id: number): Promise<AxiosResponse<void>> => {
    return api.delete(`/cramschool/teachers/${id}/`)
  }
}

/**
 * Course API
 */
export const courseAPI = {
  getAll: async (): Promise<AxiosResponse<Course[]>> => {
    const response = await api.get('/cramschool/courses/')
    return {
      ...response,
      data: (response.data as unknown[]).map((item) => CourseSchema.parse(item))
    }
  },

  getById: async (id: number): Promise<AxiosResponse<Course>> => {
    const response = await api.get(`/cramschool/courses/${id}/`)
    return {
      ...response,
      data: CourseSchema.parse(response.data)
    }
  },

  create: async (data: CreateCourseDto): Promise<AxiosResponse<Course>> => {
    const response = await api.post('/cramschool/courses/', data)
    return {
      ...response,
      data: CourseSchema.parse(response.data)
    }
  },

  update: async (id: number, data: UpdateCourseDto): Promise<AxiosResponse<Course>> => {
    const response = await api.put(`/cramschool/courses/${id}/`, data)
    return {
      ...response,
      data: CourseSchema.parse(response.data)
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
  }
}

/**
 * QuestionBank API
 */
export const questionBankAPI = {
  getAll: async (config: { params?: QuestionQuery } = {}): Promise<AxiosResponse<PaginatedResponse<Question> | Question[]>> => {
    let response: AxiosResponse<unknown>
    
    if (config.params) {
      const params = new URLSearchParams()
      Object.entries(config.params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, String(v)))
        } else if (value) {
          params.append(key, String(value))
        }
      })
      response = await api.get(`/cramschool/questions/?${params.toString()}`)
    } else {
      response = await api.get('/cramschool/questions/', config)
    }
    
    // 驗證響應數據
    if (Array.isArray(response.data)) {
      response.data = (response.data as unknown[]).map((item) => QuestionSchema.parse(item))
    } else if (response.data && typeof response.data === 'object' && 'results' in response.data) {
      const paginated = response.data as PaginatedResponse<unknown>
      paginated.results = paginated.results.map((item: unknown) => QuestionSchema.parse(item))
    }
    
    return response as AxiosResponse<PaginatedResponse<Question> | Question[]>
  },

  getById: async (id: number): Promise<AxiosResponse<Question>> => {
    const response = await api.get(`/cramschool/questions/${id}/`)
    return {
      ...response,
      data: QuestionSchema.parse(response.data)
    }
  },

  create: async (data: CreateQuestionDto): Promise<AxiosResponse<Question>> => {
    const response = await api.post('/cramschool/questions/', data)
    return {
      ...response,
      data: QuestionSchema.parse(response.data)
    }
  },

  update: async (id: number, data: UpdateQuestionDto): Promise<AxiosResponse<Question>> => {
    const response = await api.put(`/cramschool/questions/${id}/`, data)
    return {
      ...response,
      data: QuestionSchema.parse(response.data)
    }
  },

  delete: async (id: number): Promise<AxiosResponse<void>> => {
    return api.delete(`/cramschool/questions/${id}/`)
  },

  searchChapters: async (query: string, subjectId: number | null = null, level: string | null = null): Promise<AxiosResponse<unknown>> => {
    const params = new URLSearchParams({ q: query })
    if (subjectId) params.append('subject', String(subjectId))
    if (level) params.append('level', level)
    return api.get(`/cramschool/questions/search_chapters/?${params.toString()}`)
  },

  getSourceOptions: async (): Promise<AxiosResponse<unknown>> => {
    return api.get('/cramschool/questions/source_options/')
  },

  previewFromWord: async (formData: FormData): Promise<AxiosResponse<unknown>> => {
    return api.post('/cramschool/questions/preview_from_word/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  importFromWord: async (formData: FormData): Promise<AxiosResponse<unknown>> => {
    return api.post('/cramschool/questions/import_from_word/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  previewFromMarkdown: async (formData: FormData): Promise<AxiosResponse<unknown>> => {
    return api.post('/cramschool/questions/preview_from_markdown/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  importFromMarkdown: async (formData: FormData): Promise<AxiosResponse<unknown>> => {
    return api.post('/cramschool/questions/import_from_markdown/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  exportToLatex: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/cramschool/questions/${id}/export_to_latex/`)
  },

  exportToMarkdown: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/cramschool/questions/${id}/export_to_markdown/`)
  }
}

/**
 * LearningResource API
 */
export const learningResourceAPI = {
  getAll: async (params: Record<string, unknown> = {}): Promise<AxiosResponse<PaginatedResponse<LearningResource> | LearningResource[]>> => {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        query.append(key, String(value))
      }
    })
    const response = await api.get(`/cramschool/resources/?${query.toString()}`)
    
    // 驗證響應數據
    if (Array.isArray(response.data)) {
      response.data = (response.data as unknown[]).map((item) => LearningResourceSchema.parse(item))
    } else if (response.data && typeof response.data === 'object' && 'results' in response.data) {
      const paginated = response.data as PaginatedResponse<unknown>
      paginated.results = paginated.results.map((item: unknown) => LearningResourceSchema.parse(item))
    }
    
    return response as AxiosResponse<PaginatedResponse<LearningResource> | LearningResource[]>
  },

  getById: async (id: number): Promise<AxiosResponse<LearningResource>> => {
    const response = await api.get(`/cramschool/resources/${id}/`)
    return {
      ...response,
      data: LearningResourceSchema.parse(response.data)
    }
  },

  create: async (data: CreateLearningResourceDto): Promise<AxiosResponse<LearningResource>> => {
    const response = await api.post('/cramschool/resources/', data)
    return {
      ...response,
      data: LearningResourceSchema.parse(response.data)
    }
  },

  update: async (id: number, data: UpdateLearningResourceDto): Promise<AxiosResponse<LearningResource>> => {
    const response = await api.put(`/cramschool/resources/${id}/`, data)
    return {
      ...response,
      data: LearningResourceSchema.parse(response.data)
    }
  },

  delete: async (id: number): Promise<AxiosResponse<void>> => {
    return api.delete(`/cramschool/resources/${id}/`)
  },

  export: async (id: number, formatType: string): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/resources/${id}/export/`, { format_type: formatType })
  },

  grade: async (id: number, submission: unknown): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/resources/${id}/grade/`, submission)
  },

  bindToCourse: async (id: number, courseId: number, action: 'add' | 'remove' = 'add'): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/resources/${id}/bind-to-course/`, { course_id: courseId, action })
  }
}

/**
 * ContentTemplate API
 */
export const contentTemplateAPI = {
  getAll: async (params: Record<string, unknown> = {}): Promise<AxiosResponse<PaginatedResponse<ContentTemplate> | ContentTemplate[]>> => {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        query.append(key, String(value))
      }
    })
    const response = await api.get(`/cramschool/templates/?${query.toString()}`)
    
    // 驗證響應數據
    if (Array.isArray(response.data)) {
      response.data = (response.data as unknown[]).map((item) => ContentTemplateSchema.parse(item))
    } else if (response.data && typeof response.data === 'object' && 'results' in response.data) {
      const paginated = response.data as PaginatedResponse<unknown>
      paginated.results = paginated.results.map((item: unknown) => ContentTemplateSchema.parse(item))
    }
    
    return response as AxiosResponse<PaginatedResponse<ContentTemplate> | ContentTemplate[]>
  },

  getById: async (id: number): Promise<AxiosResponse<ContentTemplate>> => {
    const response = await api.get(`/cramschool/templates/${id}/`)
    return {
      ...response,
      data: ContentTemplateSchema.parse(response.data)
    }
  },

  create: async (data: CreateContentTemplateDto): Promise<AxiosResponse<ContentTemplate>> => {
    const response = await api.post('/cramschool/templates/', data)
    return {
      ...response,
      data: ContentTemplateSchema.parse(response.data)
    }
  },

  update: async (id: number, data: UpdateContentTemplateDto): Promise<AxiosResponse<ContentTemplate>> => {
    const response = await api.put(`/cramschool/templates/${id}/`, data)
    return {
      ...response,
      data: ContentTemplateSchema.parse(response.data)
    }
  },

  delete: async (id: number): Promise<AxiosResponse<void>> => {
    return api.delete(`/cramschool/templates/${id}/`)
  }
}

/**
 * Auth API
 */
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

/**
 * 其他 API（暫時保持原有結構，後續逐步遷移）
 * 這些 API 需要定義對應的 Schema 後再進行類型安全改造
 */

// Enrollment API
export const enrollmentAPI = {
  getAll: async (includeDeleted = false): Promise<AxiosResponse<unknown>> => {
    const params = includeDeleted ? '?include_deleted=true' : ''
    return api.get(`/cramschool/enrollments/${params}`)
  },
  getById: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/cramschool/enrollments/${id}/`)
  },
  create: async (data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.post('/cramschool/enrollments/', data)
  },
  update: async (id: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.put(`/cramschool/enrollments/${id}/`, data)
  },
  delete: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.delete(`/cramschool/enrollments/${id}/`)
  },
  restore: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/enrollments/${id}/restore/`)
  }
}

// Enrollment Period API
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

// Fee API
export const feeAPI = {
  getAll: async (includeDeleted = false): Promise<AxiosResponse<unknown>> => {
    const params = includeDeleted ? '?include_deleted=true' : ''
    return api.get(`/cramschool/fees/${params}`)
  },
  getById: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/cramschool/fees/${id}/`)
  },
  getByStudent: async (studentId: number, includeDeleted = false): Promise<AxiosResponse<unknown>> => {
    const params = new URLSearchParams({ student: String(studentId) })
    if (includeDeleted) params.append('include_deleted', 'true')
    return api.get(`/cramschool/fees/?${params.toString()}`)
  },
  batchUpdate: async (feeIds: number[], paymentStatus: string): Promise<AxiosResponse<unknown>> => {
    return api.post('/cramschool/fees/batch-update/', {
      fee_ids: feeIds,
      payment_status: paymentStatus
    })
  },
  create: async (data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.post('/cramschool/fees/', data)
  },
  update: async (id: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.put(`/cramschool/fees/${id}/`, data)
  },
  delete: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.delete(`/cramschool/fees/${id}/`)
  },
  restore: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/fees/${id}/restore/`)
  }
}

// Session API
export const sessionAPI = {
  getAll: async (): Promise<AxiosResponse<unknown>> => {
    return api.get('/cramschool/sessions/')
  },
  getById: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/cramschool/sessions/${id}/`)
  },
  create: async (data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.post('/cramschool/sessions/', data)
  },
  update: async (id: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.put(`/cramschool/sessions/${id}/`, data)
  },
  delete: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.delete(`/cramschool/sessions/${id}/`)
  }
}

// Attendance API
export const attendanceAPI = {
  getAll: async (includeDeleted = false): Promise<AxiosResponse<unknown>> => {
    const params = includeDeleted ? '?include_deleted=true' : ''
    return api.get(`/cramschool/attendances/${params}`)
  },
  getById: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/cramschool/attendances/${id}/`)
  },
  create: async (data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.post('/cramschool/attendances/', data)
  },
  update: async (id: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.put(`/cramschool/attendances/${id}/`, data)
  },
  delete: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.delete(`/cramschool/attendances/${id}/`)
  },
  restore: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/attendances/${id}/restore/`)
  }
}

// Leave API
export const leaveAPI = {
  getAll: async (includeDeleted = false): Promise<AxiosResponse<unknown>> => {
    const params = includeDeleted ? '?include_deleted=true' : ''
    return api.get(`/cramschool/leaves/${params}`)
  },
  getById: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/cramschool/leaves/${id}/`)
  },
  create: async (data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.post('/cramschool/leaves/', data)
  },
  update: async (id: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.put(`/cramschool/leaves/${id}/`, data)
  },
  delete: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.delete(`/cramschool/leaves/${id}/`)
  },
  restore: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/leaves/${id}/restore/`)
  }
}

// Subject API
export const subjectAPI = {
  getAll: async (): Promise<AxiosResponse<unknown>> => {
    return api.get('/cramschool/subjects/')
  },
  getById: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/cramschool/subjects/${id}/`)
  },
  create: async (data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.post('/cramschool/subjects/', data)
  },
  update: async (id: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.put(`/cramschool/subjects/${id}/`, data)
  },
  delete: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.delete(`/cramschool/subjects/${id}/`)
  }
}

// Hashtag API
export const hashtagAPI = {
  getAll: async (): Promise<AxiosResponse<unknown>> => {
    return api.get('/cramschool/hashtags/')
  },
  getById: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/cramschool/hashtags/${id}/`)
  },
  create: async (data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.post('/cramschool/hashtags/', data)
  },
  update: async (id: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.put(`/cramschool/hashtags/${id}/`, data)
  },
  delete: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.delete(`/cramschool/hashtags/${id}/`)
  }
}

// ErrorLog API
export const errorLogAPI = {
  getAll: async (studentId: number | null = null, includeDeleted = false): Promise<AxiosResponse<unknown>> => {
    const params = new URLSearchParams()
    if (studentId) params.append('student', String(studentId))
    if (includeDeleted) params.append('include_deleted', 'true')
    const query = params.toString()
    const url = query ? `/cramschool/error-logs/?${query}` : '/cramschool/error-logs/'
    return api.get(url)
  },
  getById: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/cramschool/error-logs/${id}/`)
  },
  create: async (data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.post('/cramschool/error-logs/', data)
  },
  update: async (id: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.put(`/cramschool/error-logs/${id}/`, data)
  },
  delete: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.delete(`/cramschool/error-logs/${id}/`)
  },
  restore: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/error-logs/${id}/restore/`)
  },
  uploadImages: async (id: number, formData: FormData): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/error-logs/${id}/upload-images/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  reorderImages: async (id: number, imageIds: number[]): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/error-logs/${id}/reorder-images/`, { image_ids: imageIds })
  },
  importToQuestionBank: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/error-logs/${id}/import-to-question-bank/`)
  }
}

// StudentMistakeNote API
export const studentMistakeNoteAPI = {
  getAll: async (queryString: string | Record<string, unknown> = ''): Promise<AxiosResponse<unknown>> => {
    if (typeof queryString === 'string' && queryString) {
      return api.get(`/cramschool/student-mistake-notes/?${queryString}`)
    }
    if (typeof queryString === 'object') {
      const params = new URLSearchParams()
      if (queryString.q) params.append('q', String(queryString.q))
      if (queryString.includeDeleted) params.append('include_deleted', 'true')
      if (queryString.student_id) params.append('student_id', String(queryString.student_id))
      const query = params.toString()
      return api.get(`/cramschool/student-mistake-notes/${query ? `?${query}` : ''}`)
    }
    return api.get('/cramschool/student-mistake-notes/')
  },
  getById: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/cramschool/student-mistake-notes/${id}/`)
  },
  create: async (data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.post('/cramschool/student-mistake-notes/', data)
  },
  update: async (id: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.put(`/cramschool/student-mistake-notes/${id}/`, data)
  },
  delete: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.delete(`/cramschool/student-mistake-notes/${id}/`)
  },
  restore: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/student-mistake-notes/${id}/restore/`)
  },
  uploadImages: async (id: number, formData: FormData): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/student-mistake-notes/${id}/upload-images/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  reorderImages: async (id: number, imageIds: number[]): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/student-mistake-notes/${id}/reorder-images/`, { image_ids: imageIds })
  },
  importToQuestionBank: async (id: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/student-mistake-notes/${id}/import-to-question-bank/`, data)
  }
}

export const studentMistakeNoteImageAPI = {
  update: async (id: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.put(`/cramschool/student-mistake-note-images/${id}/`, data)
  },
  delete: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.delete(`/cramschool/student-mistake-note-images/${id}/`)
  }
}

export const errorLogImageAPI = {
  update: async (id: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.put(`/cramschool/error-log-images/${id}/`, data)
  },
  delete: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.delete(`/cramschool/error-log-images/${id}/`)
  }
}

// StudentAnswer API
export const studentAnswerAPI = {
  getAll: async (includeDeleted = false): Promise<AxiosResponse<unknown>> => {
    const params = includeDeleted ? '?include_deleted=true' : ''
    return api.get(`/cramschool/student-answers/${params}`)
  },
  getById: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/cramschool/student-answers/${id}/`)
  },
  create: async (data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.post('/cramschool/student-answers/', data)
  },
  update: async (id: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.put(`/cramschool/student-answers/${id}/`, data)
  },
  delete: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.delete(`/cramschool/student-answers/${id}/`)
  },
  restore: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/student-answers/${id}/restore/`)
  }
}

// Image Upload API
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

// Restaurant API
export const restaurantAPI = {
  getAll: async (): Promise<AxiosResponse<unknown>> => {
    return api.get('/cramschool/restaurants/')
  },
  getById: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/cramschool/restaurants/${id}/`)
  },
  create: async (data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.post('/cramschool/restaurants/', data)
  },
  update: async (id: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.put(`/cramschool/restaurants/${id}/`, data)
  },
  delete: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.delete(`/cramschool/restaurants/${id}/`)
  }
}

// GroupOrder API
export const groupOrderAPI = {
  getAll: async (): Promise<AxiosResponse<unknown>> => {
    return api.get('/cramschool/group-orders/')
  },
  getById: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/cramschool/group-orders/${id}/`)
  },
  create: async (data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.post('/cramschool/group-orders/', data)
  },
  update: async (id: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.put(`/cramschool/group-orders/${id}/`, data)
  },
  delete: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.delete(`/cramschool/group-orders/${id}/`)
  },
  complete: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/group-orders/${id}/complete/`)
  }
}

// Order API
export const orderAPI = {
  getAll: async (groupOrderId: number | null = null, studentId: number | null = null, includeDeleted = false): Promise<AxiosResponse<unknown>> => {
    const params = new URLSearchParams()
    if (groupOrderId) params.append('group_order', String(groupOrderId))
    if (studentId) params.append('student', String(studentId))
    if (includeDeleted) params.append('include_deleted', 'true')
    const query = params.toString()
    return api.get(`/cramschool/orders/${query ? `?${query}` : ''}`)
  },
  getById: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/cramschool/orders/${id}/`)
  },
  create: async (data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.post('/cramschool/orders/', data)
  },
  update: async (id: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.put(`/cramschool/orders/${id}/`, data)
  },
  delete: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.delete(`/cramschool/orders/${id}/`)
  },
  restore: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.post(`/cramschool/orders/${id}/restore/`)
  }
}

// OrderItem API
export const orderItemAPI = {
  getAll: async (): Promise<AxiosResponse<unknown>> => {
    return api.get('/cramschool/order-items/')
  },
  getById: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/cramschool/order-items/${id}/`)
  },
  create: async (data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.post('/cramschool/order-items/', data)
  },
  update: async (id: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.put(`/cramschool/order-items/${id}/`, data)
  },
  delete: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.delete(`/cramschool/order-items/${id}/`)
  }
}

// Role API
export const roleAPI = {
  getAll: async (): Promise<AxiosResponse<unknown>> => {
    return api.get('/account/roles/')
  },
  getById: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/account/roles/${id}/`)
  },
  create: async (data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.post('/account/roles/', data)
  },
  update: async (id: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.put(`/account/roles/${id}/`, data)
  },
  delete: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.delete(`/account/roles/${id}/`)
  },
  updatePermissions: async (id: number, permissions: unknown): Promise<AxiosResponse<unknown>> => {
    return api.post(`/account/roles/${id}/permissions/`, { permissions })
  }
}

// RolePermission API
export const rolePermissionAPI = {
  getAll: async (roleId: number | null = null): Promise<AxiosResponse<unknown>> => {
    const url = roleId ? `/account/role-permissions/?role=${roleId}` : '/account/role-permissions/'
    return api.get(url)
  },
  getById: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/account/role-permissions/${id}/`)
  },
  create: async (data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.post('/account/role-permissions/', data)
  },
  update: async (id: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.put(`/account/role-permissions/${id}/`, data)
  },
  delete: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.delete(`/account/role-permissions/${id}/`)
  }
}

// AuditLog API
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

// User API
export const userAPI = {
  getAll: async (): Promise<AxiosResponse<unknown>> => {
    return api.get('/account/users/')
  },
  getById: async (id: number): Promise<AxiosResponse<unknown>> => {
    return api.get(`/account/users/${id}/`)
  },
  update: async (id: number, data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.put(`/account/users/${id}/`, data)
  },
  getCurrentUser: async (): Promise<AxiosResponse<User>> => {
    const response = await api.get('/account/users/me/')
    return {
      ...response,
      data: UserSchema.parse(response.data)
    }
  }
}

// StudentGroup API
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

// Generation API
export const generationAPI = {
  generateResource: async (data: unknown): Promise<AxiosResponse<unknown>> => {
    return api.post('/cramschool/generate-resource/', data)
  }
}

// Role Switch API
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

/**
 * 獲取後端基礎 URL（用於圖片等靜態資源）
 */
export const getBackendBaseURL = (): string => {
  // 優先使用環境變數中的後端 URL
  const backendURL = import.meta.env.VITE_BACKEND_URL

  if (backendURL) {
    return backendURL
  }

  // 否則從 API baseURL 中提取
  try {
    const baseURL = api.defaults.baseURL || API_BASE_URL
    const url = new URL(baseURL)
    return `${url.protocol}//${url.host}`
  } catch (e) {
    return 'http://localhost:8000'
  }
}

// 導出 api 實例供其他模組使用
export default api
