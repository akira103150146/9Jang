import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  }
})

// Student API
export const studentAPI = {
  // 獲取所有學生
  getAll: () => api.get('/cramschool/students/'),

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
  generateTuition: (id, data) => api.post(`/cramschool/students/${id}/generate_tuition/`, data)
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
  delete: (id) => api.delete(`/cramschool/courses/${id}/`)
}

// Enrollment API
export const enrollmentAPI = {
  // 獲取所有報名記錄
  getAll: () => api.get('/cramschool/enrollments/'),

  // 獲取單個報名記錄
  getById: (id) => api.get(`/cramschool/enrollments/${id}/`),

  // 創建報名記錄
  create: (data) => api.post('/cramschool/enrollments/', data),

  // 更新報名記錄
  update: (id, data) => api.put(`/cramschool/enrollments/${id}/`, data),

  // 刪除報名記錄
  delete: (id) => api.delete(`/cramschool/enrollments/${id}/`)
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
  getAll: () => api.get('/cramschool/fees/'),

  // 獲取單個費用記錄
  getById: (id) => api.get(`/cramschool/fees/${id}/`),

  // 獲取特定學生的費用記錄
  getByStudent: (studentId) => api.get(`/cramschool/fees/?student=${studentId}`),

  // 創建費用記錄
  create: (data) => api.post('/cramschool/fees/', data),

  // 更新費用記錄
  update: (id, data) => api.put(`/cramschool/fees/${id}/`, data),

  // 刪除費用記錄
  delete: (id) => api.delete(`/cramschool/fees/${id}/`)
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
  getAll: () => api.get('/cramschool/attendances/'),

  // 獲取單個出席記錄
  getById: (id) => api.get(`/cramschool/attendances/${id}/`),

  // 創建出席記錄
  create: (data) => api.post('/cramschool/attendances/', data),

  // 更新出席記錄
  update: (id, data) => api.put(`/cramschool/attendances/${id}/`, data),

  // 刪除出席記錄
  delete: (id) => api.delete(`/cramschool/attendances/${id}/`)
}

// Leave API
export const leaveAPI = {
  // 獲取所有請假記錄
  getAll: () => api.get('/cramschool/leaves/'),

  // 獲取單個請假記錄
  getById: (id) => api.get(`/cramschool/leaves/${id}/`),

  // 創建請假記錄
  create: (data) => api.post('/cramschool/leaves/', data),

  // 更新請假記錄
  update: (id, data) => api.put(`/cramschool/leaves/${id}/`, data),

  // 刪除請假記錄
  delete: (id) => api.delete(`/cramschool/leaves/${id}/`)
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
  // 獲取所有題目
  getAll: () => api.get('/cramschool/questions/'),

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
  }
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
  getAll: (studentId = null) => {
    const url = studentId
      ? `/cramschool/error-logs/?student=${studentId}`
      : '/cramschool/error-logs/'
    return api.get(url)
  },

  // 獲取單個錯題記錄
  getById: (id) => api.get(`/cramschool/error-logs/${id}/`),

  // 創建錯題記錄
  create: (data) => api.post('/cramschool/error-logs/', data),

  // 更新錯題記錄
  update: (id, data) => api.put(`/cramschool/error-logs/${id}/`, data),

  // 刪除錯題記錄
  delete: (id) => api.delete(`/cramschool/error-logs/${id}/`)
}

// StudentAnswer API
export const studentAnswerAPI = {
  // 獲取所有作答記錄
  getAll: () => api.get('/cramschool/student-answers/'),

  // 獲取單個作答記錄
  getById: (id) => api.get(`/cramschool/student-answers/${id}/`),

  // 創建作答記錄
  create: (data) => api.post('/cramschool/student-answers/', data),

  // 更新作答記錄
  update: (id, data) => api.put(`/cramschool/student-answers/${id}/`, data),

  // 刪除作答記錄
  delete: (id) => api.delete(`/cramschool/student-answers/${id}/`)
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
  getAll: (groupOrderId = null, studentId = null) => {
    const params = new URLSearchParams()
    if (groupOrderId) params.append('group_order', groupOrderId)
    if (studentId) params.append('student', studentId)
    const query = params.toString()
    return api.get(`/cramschool/orders/${query ? `?${query}` : ''}`)
  },
  getById: (id) => api.get(`/cramschool/orders/${id}/`),
  create: (data) => api.post('/cramschool/orders/', data),
  update: (id, data) => api.put(`/cramschool/orders/${id}/`, data),
  delete: (id) => api.delete(`/cramschool/orders/${id}/`)
}

// OrderItem API
export const orderItemAPI = {
  getAll: () => api.get('/cramschool/order-items/'),
  getById: (id) => api.get(`/cramschool/order-items/${id}/`),
  create: (data) => api.post('/cramschool/order-items/', data),
  update: (id, data) => api.put(`/cramschool/order-items/${id}/`, data),
  delete: (id) => api.delete(`/cramschool/order-items/${id}/`)
}

export default api

