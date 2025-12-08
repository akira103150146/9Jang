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
  delete: (id) => api.delete(`/cramschool/students/${id}/`)
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

export default api

