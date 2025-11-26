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

export default api

