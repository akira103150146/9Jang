/**
 * usePrintCache
 * 處理列印預覽的快取管理邏輯
 */

import type { PrintMode } from '../usePrintPreview.types'

export interface PreRenderedCacheItem {
  html: string
  timestamp: number
  mode: PrintMode
}

export interface CacheStyles {
  katexVscode?: string
  katex?: string
  print?: string
  computed?: string
}

export function usePrintCache() {
  // 預渲染快取：儲存不同模式的預渲染內容
  const preRenderedCache = new Map<string, PreRenderedCacheItem>()
  // 樣式快取：儲存樣式信息
  const stylesCache = new Map<string, CacheStyles>()

  /**
   * 生成快取鍵
   */
  const cacheKey = (mode: PrintMode): string => {
    return `print-preview-${mode}`
  }

  /**
   * 獲取快取
   */
  const getCache = (mode: PrintMode): PreRenderedCacheItem | undefined => {
    const key = cacheKey(mode)
    const cached = preRenderedCache.get(key)
    
    // 檢查快取是否過期（5分鐘）
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return cached
    }
    
    // 清除過期快取
    if (cached) {
      preRenderedCache.delete(key)
    }
    
    return undefined
  }

  /**
   * 設置快取
   */
  const setCache = (mode: PrintMode, html: string): void => {
    const key = cacheKey(mode)
    preRenderedCache.set(key, {
      html,
      timestamp: Date.now(),
      mode
    })
  }

  /**
   * 清除快取
   */
  const clearCache = (mode?: PrintMode): void => {
    if (mode) {
      const key = cacheKey(mode)
      preRenderedCache.delete(key)
    } else {
      preRenderedCache.clear()
    }
  }

  /**
   * 清除所有快取
   */
  const clearAllCache = (): void => {
    preRenderedCache.clear()
  }

  /**
   * 獲取快取大小
   */
  const getCacheSize = (): number => {
    return preRenderedCache.size
  }

  /**
   * 檢查是否有快取
   */
  const hasCache = (mode: PrintMode): boolean => {
    return getCache(mode) !== undefined
  }

  /**
   * 設置樣式快取
   */
  const setStylesCache = (mode: PrintMode, styles: CacheStyles): void => {
    const key = cacheKey(mode)
    stylesCache.set(key, styles)
  }

  /**
   * 獲取樣式快取
   */
  const getStylesCache = (mode: PrintMode): CacheStyles | undefined => {
    const key = cacheKey(mode)
    return stylesCache.get(key)
  }

  /**
   * 清除樣式快取
   */
  const clearStylesCache = (mode?: PrintMode): void => {
    if (mode) {
      const key = cacheKey(mode)
      stylesCache.delete(key)
    } else {
      stylesCache.clear()
    }
  }

  return {
    getCache,
    setCache,
    clearCache,
    clearAllCache,
    getCacheSize,
    hasCache,
    cacheKey,
    setStylesCache,
    getStylesCache,
    clearStylesCache,
  }
}
