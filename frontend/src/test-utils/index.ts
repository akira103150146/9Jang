/**
 * 測試工具和輔助函數
 * 提供常用的測試工具函數，簡化測試編寫
 */

import { mount, type MountingOptions, type VueWrapper } from '@vue/test-utils'
import { createRouter, createWebHistory, type Router } from 'vue-router'
import { vi } from 'vitest'
import type { Component } from 'vue'

/**
 * 創建測試用的 Vue Router 實例
 */
export function createTestRouter(routes: any[] = []): Router {
  return createRouter({
    history: createWebHistory(),
    routes: routes.length > 0 ? routes : [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/login', component: { template: '<div>Login</div>' } }
    ]
  })
}

/**
 * 創建帶有 Router 的組件掛載器
 */
export function mountWithRouter<T extends Component>(
  component: T,
  options: MountingOptions<any> = {}
): VueWrapper<any> {
  const router = createTestRouter()
  return mount(component, {
    ...options,
    global: {
      ...options.global,
      plugins: [router],
      ...options.global
    }
  })
}

/**
 * Mock API 響應的輔助函數
 */
export function createMockApiResponse<T>(data: T, status = 200) {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {} as any
  }
}

/**
 * Mock API 錯誤響應
 */
export function createMockApiError(message: string, status = 400) {
  return {
    response: {
      data: { detail: message },
      status,
      statusText: 'Bad Request',
      headers: {},
      config: {} as any
    },
    message,
    isAxiosError: true
  }
}

/**
 * 等待下一個 tick
 */
export async function waitForNextTick(wrapper?: VueWrapper<any>) {
  if (wrapper) {
    await wrapper.vm.$nextTick()
  } else {
    await new Promise(resolve => setTimeout(resolve, 0))
  }
}

/**
 * 模擬用戶輸入
 */
export async function simulateInput(
  wrapper: VueWrapper<any>,
  selector: string,
  value: string
) {
  const input = wrapper.find(selector)
  await input.setValue(value)
  await wrapper.vm.$nextTick()
}

/**
 * 模擬點擊
 */
export async function simulateClick(
  wrapper: VueWrapper<any>,
  selector: string
) {
  const element = wrapper.find(selector)
  await element.trigger('click')
  await wrapper.vm.$nextTick()
}

/**
 * 創建 Mock 用戶數據
 */
export function createMockUser(overrides: Partial<any> = {}) {
  return {
    user_id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: 'admin',
    ...overrides
  }
}

/**
 * 創建 Mock 學生數據
 */
export function createMockStudent(overrides: Partial<any> = {}) {
  return {
    student_id: 1,
    name: '測試學生',
    phone: '0912345678',
    email: 'student@example.com',
    school: '測試學校',
    ...overrides
  }
}

/**
 * 創建 Mock 課程數據
 */
export function createMockCourse(overrides: Partial<any> = {}) {
  return {
    course_id: 1,
    course_name: '測試課程',
    teacher_name: '測試老師',
    status: 'active',
    ...overrides
  }
}

/**
 * Mock Axios 實例
 */
export function createMockAxios() {
  const mockAxios = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    defaults: {
      headers: {
        common: {}
      }
    }
  }
  return mockAxios
}

/**
 * 設置全局測試環境
 */
export function setupTestEnvironment() {
  // 設置全局變數
  global.console = {
    ...console,
    // 可以選擇性地禁用某些 console 方法
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}

/**
 * 清理測試環境
 */
export function cleanupTestEnvironment() {
  vi.clearAllMocks()
  vi.restoreAllMocks()
}
