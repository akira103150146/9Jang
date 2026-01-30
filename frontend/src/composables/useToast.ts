/**
 * Toast 通知系統 Composable
 * 提供全局的 Toast 通知功能
 */

import { ref, readonly } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastMessage {
  id: string
  type: ToastType
  message: string
  duration: number
}

// 全局狀態
const messages = ref<ToastMessage[]>([])

// 默認持續時間（毫秒）
const DEFAULT_DURATION = 3000

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * 顯示 Toast 通知
 */
function show(type: ToastType, message: string, duration: number = DEFAULT_DURATION): string {
  const id = generateId()
  
  const toast: ToastMessage = {
    id,
    type,
    message,
    duration,
  }
  
  messages.value.push(toast)
  
  // 自動移除
  if (duration > 0) {
    setTimeout(() => {
      remove(id)
    }, duration)
  }
  
  return id
}

/**
 * 移除指定的 Toast
 */
function remove(id: string): void {
  const index = messages.value.findIndex((msg) => msg.id === id)
  if (index !== -1) {
    messages.value.splice(index, 1)
  }
}

/**
 * 清除所有 Toast
 */
function clear(): void {
  messages.value = []
}

/**
 * Toast Composable
 */
export function useToast() {
  return {
    // 只讀的訊息列表
    messages: readonly(messages),
    
    // 顯示成功訊息
    success: (message: string, duration?: number) => show('success', message, duration),
    
    // 顯示錯誤訊息
    error: (message: string, duration?: number) => show('error', message, duration),
    
    // 顯示警告訊息
    warning: (message: string, duration?: number) => show('warning', message, duration),
    
    // 顯示資訊訊息
    info: (message: string, duration?: number) => show('info', message, duration),
    
    // 移除指定 Toast
    remove,
    
    // 清除所有 Toast
    clear,
  }
}
