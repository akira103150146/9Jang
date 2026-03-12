/**
 * API 核心模組
 * 提供 axios 實例和基礎配置
 *
 * 同源 API URL：使用與前端相同的 origin + /api，
 * - 透過 Nginx/Vite proxy 轉發至後端，避免 CORS 問題
 * - 支援內網/公網、不同 port（5173、8080 等）皆可正常運作
 */

import axios, { AxiosInstance } from 'axios'
import { setupRequestInterceptor, setupResponseInterceptor } from './interceptors'

/** 後端 API 端口（僅在非瀏覽器環境使用） */
const BACKEND_PORT = import.meta.env.VITE_BACKEND_PORT || '3000'

/**
 * 根據目前存取網址取得 API 基礎 URL
 * - 瀏覽器環境：使用同源 (origin + /api)，由 Nginx 或 Vite proxy 轉發至後端
 * - 非瀏覽器（SSR/測試）：使用環境變數或 localhost
 */
function getApiBaseURL(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api`
  }
  return import.meta.env.VITE_API_BASE_URL || `http://localhost:${BACKEND_PORT}/api`
}

const API_BASE_URL = getApiBaseURL()

/**
 * 創建 Axios 實例
 */
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 允許發送 cookies（用於 session 支持）
  timeout: 30000, // 30 秒超時
})

// 配置攔截器
setupRequestInterceptor(api)
setupResponseInterceptor(api)

/**
 * 獲取後端基礎 URL（用於圖片等靜態資源）
 * 使用同源，與 API 請求保持一致
 */
export const getBackendBaseURL = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  const backendURL = import.meta.env.VITE_BACKEND_URL
  if (backendURL) {
    return backendURL
  }
  return `http://localhost:${BACKEND_PORT}`
}

// 導出 api 實例供其他模組使用
export default api
