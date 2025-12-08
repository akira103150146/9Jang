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

export default api

