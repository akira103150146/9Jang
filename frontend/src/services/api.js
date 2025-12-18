import axios from 'axios'

// 從環境變數獲取 API 基礎 URL，如果沒有則使用默認值
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,  // 允許發送 cookies（用於 session 支持）
})

// 從 localStorage 獲取 token
const getToken = () => {
  return localStorage.getItem('access_token')
}

const getRefreshToken = () => {
  return localStorage.getItem('refresh_token')
}

// 保存 token
export const setTokens = (access, refresh) => {
  localStorage.setItem('access_token', access)
  if (refresh) {
    localStorage.setItem('refresh_token', refresh)
  }
}

// 清除 token
export const clearTokens = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
}

// 刷新 token
const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw new Error('No refresh token')
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/account/token/refresh/`, {
      refresh: refreshToken
    })
    const { access } = response.data
    localStorage.setItem('access_token', access)
    return access
  } catch (error) {
    clearTokens()
    throw error
  }
}

// 請求攔截器：添加 JWT token 和臨時角色 header
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
        const adminUser = JSON.parse(originalUser)
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

// 回應攔截器：處理認證錯誤和 token 刷新
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

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
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
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
                const adminUser = JSON.parse(originalUser)
                if (adminUser.id) {
                  originalRequest.headers['X-Impersonated-By'] = adminUser.id.toString()
                }
              } catch (e) {
                // 如果解析失敗，忽略
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
            const adminUser = JSON.parse(originalUser)
            if (adminUser.id) {
              originalRequest.headers['X-Impersonated-By'] = adminUser.id.toString()
            }
          } catch (e) {
            // 如果解析失敗，忽略
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

// Student API
export const studentAPI = {
  // 獲取所有學生
  getAll: (includeDeleted = false) => {
    const params = includeDeleted ? '?include_deleted=true' : ''
    return api.get(`/cramschool/students/${params}`)
  },

  // 獲取單個學生
  getById: (id) => api.get(`/cramschool/students/${id}/`),

  // 創建學生
  create: (data) => api.post('/cramschool/students/', data),

  // 更新學生
  update: (id, data) => api.put(`/cramschool/students/${id}/`, data),

  // 刪除學生
  delete: (id) => api.delete(`/cramschool/students/${id}/`),

  // 獲取學生學費狀態
  getTuitionStatus: (id) => api.get(`/cramschool/students/${id}/tuition_status/`),

  // 生成學費
  generateTuition: (id, data) => api.post(`/cramschool/students/${id}/generate_tuition/`, data),
  // 重置學生密碼
  resetPassword: (id, password) => api.post(`/cramschool/students/${id}/reset-password/`, { password }),
  // 切換帳號狀態
  toggleAccountStatus: (id) => api.post(`/cramschool/students/${id}/toggle-account-status/`),
  // 獲取學生出缺勤和請假記錄
  getAttendanceAndLeaves: (id) => api.get(`/cramschool/students/${id}/attendance_and_leaves/`),
  // 恢復已刪除的學生
  restore: (id) => api.post(`/cramschool/students/${id}/restore/`)
}

// Teacher API
export const teacherAPI = {
  // 獲取所有老師
  getAll: () => api.get('/cramschool/teachers/'),

  // 獲取單個老師
  getById: (id) => api.get(`/cramschool/teachers/${id}/`),

  // 創建老師
  create: (data) => api.post('/cramschool/teachers/', data),

  // 更新老師
  update: (id, data) => api.put(`/cramschool/teachers/${id}/`, data),

  // 刪除老師
  delete: (id) => api.delete(`/cramschool/teachers/${id}/`)
}

// Course API
export const courseAPI = {
  // 獲取所有課程
  getAll: () => api.get('/cramschool/courses/'),

  // 獲取單個課程
  getById: (id) => api.get(`/cramschool/courses/${id}/`),

  // 創建課程
  create: (data) => api.post('/cramschool/courses/', data),

  // 更新課程
  update: (id, data) => api.put(`/cramschool/courses/${id}/`, data),

  // 刪除課程
  delete: (id) => api.delete(`/cramschool/courses/${id}/`),

  // 獲取課程的學生狀態統計
  getStudentStatus: (id) => api.get(`/cramschool/courses/${id}/student-status/`)
}

// Enrollment API
export const enrollmentAPI = {
  // 獲取所有報名記錄
  getAll: (includeDeleted = false) => {
    const params = includeDeleted ? '?include_deleted=true' : ''
    return api.get(`/cramschool/enrollments/${params}`)
  },

  // 獲取單個報名記錄
  getById: (id) => api.get(`/cramschool/enrollments/${id}/`),

  // 創建報名記錄
  create: (data) => api.post('/cramschool/enrollments/', data),

  // 更新報名記錄
  update: (id, data) => api.put(`/cramschool/enrollments/${id}/`, data),

  // 刪除報名記錄
  delete: (id) => api.delete(`/cramschool/enrollments/${id}/`),
  // 恢復已刪除的報名記錄
  restore: (id) => api.post(`/cramschool/enrollments/${id}/restore/`)
}

// Enrollment Period API
export const enrollmentPeriodAPI = {
  // 獲取所有上課期間記錄
  getAll: () => api.get('/cramschool/enrollment-periods/'),

  // 獲取單個上課期間記錄
  getById: (id) => api.get(`/cramschool/enrollment-periods/${id}/`),

  // 根據報名ID獲取期間記錄
  getByEnrollment: (enrollmentId) => api.get(`/cramschool/enrollment-periods/?enrollment=${enrollmentId}`),

  // 創建上課期間記錄
  create: (data) => api.post('/cramschool/enrollment-periods/', data),

  // 更新上課期間記錄
  update: (id, data) => api.put(`/cramschool/enrollment-periods/${id}/`, data),

  // 刪除上課期間記錄
  delete: (id) => api.delete(`/cramschool/enrollment-periods/${id}/`)
}

// Fee API
export const feeAPI = {
  // 獲取所有費用記錄
  getAll: (includeDeleted = false) => {
    const params = includeDeleted ? '?include_deleted=true' : ''
    return api.get(`/cramschool/fees/${params}`)
  },

  // 獲取單個費用記錄
  getById: (id) => api.get(`/cramschool/fees/${id}/`),

  // 獲取特定學生的費用記錄
  getByStudent: (studentId, includeDeleted = false) => {
    const params = new URLSearchParams({ student: studentId })
    if (includeDeleted) params.append('include_deleted', 'true')
    return api.get(`/cramschool/fees/?${params.toString()}`)
  },

  // 批次更新費用記錄
  batchUpdate: (feeIds, paymentStatus) => {
    return api.post('/cramschool/fees/batch-update/', {
      fee_ids: feeIds,
      payment_status: paymentStatus
    })
  },

  // 創建費用記錄
  create: (data) => api.post('/cramschool/fees/', data),

  // 更新費用記錄
  update: (id, data) => api.put(`/cramschool/fees/${id}/`, data),

  // 刪除費用記錄（軟刪除）
  delete: (id) => api.delete(`/cramschool/fees/${id}/`),

  // 恢復已刪除的費用記錄
  restore: (id) => api.post(`/cramschool/fees/${id}/restore/`)
}

// Session API
export const sessionAPI = {
  // 獲取所有上課記錄
  getAll: () => api.get('/cramschool/sessions/'),

  // 獲取單個上課記錄
  getById: (id) => api.get(`/cramschool/sessions/${id}/`),

  // 創建上課記錄
  create: (data) => api.post('/cramschool/sessions/', data),

  // 更新上課記錄
  update: (id, data) => api.put(`/cramschool/sessions/${id}/`, data),

  // 刪除上課記錄
  delete: (id) => api.delete(`/cramschool/sessions/${id}/`)
}

// Attendance API
export const attendanceAPI = {
  // 獲取所有出席記錄
  getAll: (includeDeleted = false) => {
    const params = includeDeleted ? '?include_deleted=true' : ''
    return api.get(`/cramschool/attendances/${params}`)
  },

  // 獲取單個出席記錄
  getById: (id) => api.get(`/cramschool/attendances/${id}/`),

  // 創建出席記錄
  create: (data) => api.post('/cramschool/attendances/', data),

  // 更新出席記錄
  update: (id, data) => api.put(`/cramschool/attendances/${id}/`, data),

  // 刪除出席記錄
  delete: (id) => api.delete(`/cramschool/attendances/${id}/`),
  // 恢復已刪除的出席記錄
  restore: (id) => api.post(`/cramschool/attendances/${id}/restore/`)
}

// Leave API
export const leaveAPI = {
  // 獲取所有請假記錄
  getAll: (includeDeleted = false) => {
    const params = includeDeleted ? '?include_deleted=true' : ''
    return api.get(`/cramschool/leaves/${params}`)
  },

  // 獲取單個請假記錄
  getById: (id) => api.get(`/cramschool/leaves/${id}/`),

  // 創建請假記錄
  create: (data) => api.post('/cramschool/leaves/', data),

  // 更新請假記錄
  update: (id, data) => api.put(`/cramschool/leaves/${id}/`, data),

  // 刪除請假記錄
  delete: (id) => api.delete(`/cramschool/leaves/${id}/`),
  // 恢復已刪除的請假記錄
  restore: (id) => api.post(`/cramschool/leaves/${id}/restore/`)
}

// Subject API
export const subjectAPI = {
  // 獲取所有科目
  getAll: () => api.get('/cramschool/subjects/'),

  // 獲取單個科目
  getById: (id) => api.get(`/cramschool/subjects/${id}/`),

  // 創建科目
  create: (data) => api.post('/cramschool/subjects/', data),

  // 更新科目
  update: (id, data) => api.put(`/cramschool/subjects/${id}/`, data),

  // 刪除科目
  delete: (id) => api.delete(`/cramschool/subjects/${id}/`)
}

// QuestionBank API
export const questionBankAPI = {
  // 獲取所有題目（支援篩選參數）
  getAll: (config = {}) => {
    if (config.params) {
      const params = new URLSearchParams()
      Object.entries(config.params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v))
        } else if (value) {
          params.append(key, value)
        }
      })
      return api.get(`/cramschool/questions/?${params.toString()}`)
    }
    return api.get('/cramschool/questions/', config)
  },

  // 獲取單個題目
  getById: (id) => api.get(`/cramschool/questions/${id}/`),

  // 創建題目
  create: (data) => api.post('/cramschool/questions/', data),

  // 更新題目
  update: (id, data) => api.put(`/cramschool/questions/${id}/`, data),

  // 刪除題目
  delete: (id) => api.delete(`/cramschool/questions/${id}/`),

  // 搜尋章節
  searchChapters: (query, subjectId = null, level = null) => {
    const params = new URLSearchParams({ q: query })
    if (subjectId) params.append('subject', subjectId)
    if (level) params.append('level', level)
    return api.get(`/cramschool/questions/search_chapters/?${params.toString()}`)
  },

  // 獲取題目來源選項
  getSourceOptions: () => api.get('/cramschool/questions/source_options/'),

  // 預覽 Word 檔案中的題目（不匯入）
  previewFromWord: (formData) => api.post('/cramschool/questions/preview_from_word/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // 從 Word 匯入題目
  importFromWord: (formData) => api.post('/cramschool/questions/import_from_word/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // 導出為 LaTeX
  exportToLatex: (id) => api.get(`/cramschool/questions/${id}/export_to_latex/`),

  // 導出為 Markdown
  exportToMarkdown: (id) => api.get(`/cramschool/questions/${id}/export_to_markdown/`)
}

// Hashtag API
export const hashtagAPI = {
  // 獲取所有標籤
  getAll: () => api.get('/cramschool/hashtags/'),

  // 獲取單個標籤
  getById: (id) => api.get(`/cramschool/hashtags/${id}/`),

  // 創建標籤
  create: (data) => api.post('/cramschool/hashtags/', data),

  // 更新標籤
  update: (id, data) => api.put(`/cramschool/hashtags/${id}/`, data),

  // 刪除標籤
  delete: (id) => api.delete(`/cramschool/hashtags/${id}/`)
}

// ErrorLog API
export const errorLogAPI = {
  // 獲取所有錯題記錄（可選：按學生 ID 篩選）
  getAll: (studentId = null, includeDeleted = false) => {
    const params = new URLSearchParams()
    if (studentId) params.append('student', studentId)
    if (includeDeleted) params.append('include_deleted', 'true')
    const query = params.toString()
    const url = query ? `/cramschool/error-logs/?${query}` : '/cramschool/error-logs/'
    return api.get(url)
  },

  // 獲取單個錯題記錄
  getById: (id) => api.get(`/cramschool/error-logs/${id}/`),

  // 創建錯題記錄
  create: (data) => api.post('/cramschool/error-logs/', data),

  // 更新錯題記錄
  update: (id, data) => api.put(`/cramschool/error-logs/${id}/`, data),

  // 刪除錯題記錄（軟刪除）
  delete: (id) => api.delete(`/cramschool/error-logs/${id}/`),

  // 恢復已刪除的錯題記錄
  restore: (id) => api.post(`/cramschool/error-logs/${id}/restore/`),

  // 上傳錯題圖片（老師/會計端）
  uploadImages: (id, formData) => api.post(`/cramschool/error-logs/${id}/upload-images/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  reorderImages: (id, imageIds) => api.post(`/cramschool/error-logs/${id}/reorder-images/`, { image_ids: imageIds }),

  // 匯入題庫（老師/管理員可用；會計禁止）
  importToQuestionBank: (id) => api.post(`/cramschool/error-logs/${id}/import-to-question-bank/`),
}

// StudentMistakeNote API（學生自建錯題筆記）
export const studentMistakeNoteAPI = {
  getAll: (queryString = '') => {
    // 支持直接傳入查詢字串，例如: "student_id=123&q=關鍵字"
    if (typeof queryString === 'string' && queryString) {
      return api.get(`/cramschool/student-mistake-notes/?${queryString}`)
    }
    // 也支持物件格式（向後兼容）
    if (typeof queryString === 'object') {
      const params = new URLSearchParams()
      if (queryString.q) params.append('q', queryString.q)
      if (queryString.includeDeleted) params.append('include_deleted', 'true')
      if (queryString.student_id) params.append('student_id', queryString.student_id)
      const query = params.toString()
      return api.get(`/cramschool/student-mistake-notes/${query ? `?${query}` : ''}`)
    }
    return api.get('/cramschool/student-mistake-notes/')
  },
  getById: (id) => api.get(`/cramschool/student-mistake-notes/${id}/`),
  create: (data) => api.post('/cramschool/student-mistake-notes/', data),
  update: (id, data) => api.put(`/cramschool/student-mistake-notes/${id}/`, data),
  delete: (id) => api.delete(`/cramschool/student-mistake-notes/${id}/`),
  restore: (id) => api.post(`/cramschool/student-mistake-notes/${id}/restore/`),

  uploadImages: (id, formData) => api.post(`/cramschool/student-mistake-notes/${id}/upload-images/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  reorderImages: (id, imageIds) => api.post(`/cramschool/student-mistake-notes/${id}/reorder-images/`, { image_ids: imageIds }),
  importToQuestionBank: (id, data) => api.post(`/cramschool/student-mistake-notes/${id}/import-to-question-bank/`, data),
}

export const studentMistakeNoteImageAPI = {
  update: (id, data) => api.put(`/cramschool/student-mistake-note-images/${id}/`, data),
  delete: (id) => api.delete(`/cramschool/student-mistake-note-images/${id}/`),
}

export const errorLogImageAPI = {
  update: (id, data) => api.put(`/cramschool/error-log-images/${id}/`, data),
  delete: (id) => api.delete(`/cramschool/error-log-images/${id}/`),
}

// StudentAnswer API
export const studentAnswerAPI = {
  // 獲取所有作答記錄
  getAll: (includeDeleted = false) => {
    const params = includeDeleted ? '?include_deleted=true' : ''
    return api.get(`/cramschool/student-answers/${params}`)
  },

  // 獲取單個作答記錄
  getById: (id) => api.get(`/cramschool/student-answers/${id}/`),

  // 創建作答記錄
  create: (data) => api.post('/cramschool/student-answers/', data),

  // 更新作答記錄
  update: (id, data) => api.put(`/cramschool/student-answers/${id}/`, data),

  // 刪除作答記錄（軟刪除）
  delete: (id) => api.delete(`/cramschool/student-answers/${id}/`),

  // 恢復已刪除的作答記錄
  restore: (id) => api.post(`/cramschool/student-answers/${id}/restore/`)
}

// Image Upload API
export const uploadImageAPI = {
  // 上傳圖片
  upload: (file) => {
    const formData = new FormData()
    formData.append('image', file)
    return api.post('/cramschool/upload-image/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    })
  }
}

// Restaurant API
export const restaurantAPI = {
  getAll: () => api.get('/cramschool/restaurants/'),
  getById: (id) => api.get(`/cramschool/restaurants/${id}/`),
  create: (data) => api.post('/cramschool/restaurants/', data),
  update: (id, data) => api.put(`/cramschool/restaurants/${id}/`, data),
  delete: (id) => api.delete(`/cramschool/restaurants/${id}/`)
}

// GroupOrder API
export const groupOrderAPI = {
  getAll: () => api.get('/cramschool/group-orders/'),
  getById: (id) => api.get(`/cramschool/group-orders/${id}/`),
  create: (data) => api.post('/cramschool/group-orders/', data),
  update: (id, data) => api.put(`/cramschool/group-orders/${id}/`, data),
  delete: (id) => api.delete(`/cramschool/group-orders/${id}/`),
  complete: (id) => api.post(`/cramschool/group-orders/${id}/complete/`)
}

// Order API
export const orderAPI = {
  getAll: (groupOrderId = null, studentId = null, includeDeleted = false) => {
    const params = new URLSearchParams()
    if (groupOrderId) params.append('group_order', groupOrderId)
    if (studentId) params.append('student', studentId)
    if (includeDeleted) params.append('include_deleted', 'true')
    const query = params.toString()
    return api.get(`/cramschool/orders/${query ? `?${query}` : ''}`)
  },
  getById: (id) => api.get(`/cramschool/orders/${id}/`),
  create: (data) => api.post('/cramschool/orders/', data),
  update: (id, data) => api.put(`/cramschool/orders/${id}/`, data),
  delete: (id) => api.delete(`/cramschool/orders/${id}/`),
  restore: (id) => api.post(`/cramschool/orders/${id}/restore/`)
}

// OrderItem API
export const orderItemAPI = {
  getAll: () => api.get('/cramschool/order-items/'),
  getById: (id) => api.get(`/cramschool/order-items/${id}/`),
  create: (data) => api.post('/cramschool/order-items/', data),
  update: (id, data) => api.put(`/cramschool/order-items/${id}/`, data),
  delete: (id) => api.delete(`/cramschool/order-items/${id}/`)
}

// Role API
export const roleAPI = {
  getAll: () => api.get('/account/roles/'),
  getById: (id) => api.get(`/account/roles/${id}/`),
  create: (data) => api.post('/account/roles/', data),
  update: (id, data) => api.put(`/account/roles/${id}/`, data),
  delete: (id) => api.delete(`/account/roles/${id}/`),
  updatePermissions: (id, permissions) => api.post(`/account/roles/${id}/permissions/`, { permissions })
}

// RolePermission API
export const rolePermissionAPI = {
  getAll: (roleId = null) => {
    const url = roleId ? `/account/role-permissions/?role=${roleId}` : '/account/role-permissions/'
    return api.get(url)
  },
  getById: (id) => api.get(`/account/role-permissions/${id}/`),
  create: (data) => api.post('/account/role-permissions/', data),
  update: (id, data) => api.put(`/account/role-permissions/${id}/`, data),
  delete: (id) => api.delete(`/account/role-permissions/${id}/`)
}

// AuditLog API
export const auditLogAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.user) params.append('user', filters.user)
    if (filters.role) params.append('role', filters.role)
    if (filters.action_type) params.append('action_type', filters.action_type)
    if (filters.mode) params.append('mode', filters.mode)
    const query = params.toString()
    return api.get(`/account/audit-logs/${query ? `?${query}` : ''}`)
  },
  getById: (id) => api.get(`/account/audit-logs/${id}/`)
}

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/account/login/', { email, password })
    // 保存 token 和用戶信息
    if (response.data.access) {
      setTokens(response.data.access, response.data.refresh)
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
    }
    return response
  },
  logout: async () => {
    const refreshToken = getRefreshToken()
    try {
      await api.post('/account/logout/', { refresh: refreshToken })
    } catch (error) {
      // 即使登出失敗，也清除本地 token
      console.error('登出失敗:', error)
    } finally {
      clearTokens()
    }
  },
  refreshToken: () => api.post('/account/token/refresh/', { refresh: getRefreshToken() }),
  getCurrentUser: () => api.get('/account/users/me/'),
  changePassword: (oldPassword, newPassword) => api.post('/account/change-password/', {
    old_password: oldPassword,
    new_password: newPassword
  }),
  impersonateUser: (userId) => api.post('/account/impersonate-user/', { user_id: userId })
}

// User API
export const userAPI = {
  getAll: () => api.get('/account/users/'),
  getById: (id) => api.get(`/account/users/${id}/`),
  update: (id, data) => api.put(`/account/users/${id}/`, data),
  getCurrentUser: () => api.get('/account/users/me/')
}

// StudentGroup API
export const studentGroupAPI = {
  getAll: () => api.get('/cramschool/student-groups/'),
  getById: (id) => api.get(`/cramschool/student-groups/${id}/`),
  create: (data) => api.post('/cramschool/student-groups/', data),
  update: (id, data) => api.put(`/cramschool/student-groups/${id}/`, data),
  delete: (id) => api.delete(`/cramschool/student-groups/${id}/`),
  addStudents: (id, studentIds) => api.post(`/cramschool/student-groups/${id}/add-students/`, { student_ids: studentIds }),
  removeStudents: (id, studentIds) => api.post(`/cramschool/student-groups/${id}/remove-students/`, { student_ids: studentIds })
}

// ContentTemplate API
export const contentTemplateAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return api.get(`/cramschool/templates/?${query}`)
  },
  getById: (id) => api.get(`/cramschool/templates/${id}/`),
  create: (data) => api.post('/cramschool/templates/', data),
  update: (id, data) => api.put(`/cramschool/templates/${id}/`, data),
  delete: (id) => api.delete(`/cramschool/templates/${id}/`)
}

// LearningResource API - 統一的教學資源管理 API
export const learningResourceAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return api.get(`/cramschool/resources/?${query}`)
  },
  getById: (id) => api.get(`/cramschool/resources/${id}/`),
  create: (data) => api.post('/cramschool/resources/', data),
  update: (id, data) => api.put(`/cramschool/resources/${id}/`, data),
  delete: (id) => api.delete(`/cramschool/resources/${id}/`),
  export: (id, formatType) => api.post(`/cramschool/resources/${id}/export/`, { format_type: formatType }),
  grade: (id, submission) => api.post(`/cramschool/resources/${id}/grade/`, submission),
  bindToCourse: (id, courseId, action = 'add') => api.post(`/cramschool/resources/${id}/bind-to-course/`, { course_id: courseId, action })
}

// Generation API
export const generationAPI = {
  generateResource: (data) => api.post('/cramschool/generate-resource/', data)
}

// Role Switch API
export const roleSwitchAPI = {
  switchRole: (role) => api.post('/account/switch-role/', { role }),
  resetRole: () => api.post('/account/reset-role/'),
  getCurrentRole: () => api.get('/account/current-role/')
}

// 導出後端基礎 URL（用於圖片等靜態資源）
export const getBackendBaseURL = () => {
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

export default api
