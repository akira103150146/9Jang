/**
 * API 核心模組
 * 提供 axios 實例和基礎配置
 */

import axios, { AxiosInstance } from 'axios'
import { setupRequestInterceptor, setupResponseInterceptor } from './interceptors'

// 從環境變數獲取 API 基礎 URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

/**
 * 創建 Axios 實例
 */
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 允許發送 cookies（用於 session 支持）
})

// 配置攔截器
setupRequestInterceptor(api)
setupResponseInterceptor(api)

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
