/**
 * usePrintWatermark
 * 處理列印浮水印邏輯
 */

import type { Ref } from 'vue'

export interface WatermarkOptions {
  enabled: Ref<boolean>
  image: Ref<string | null>
  opacity: Ref<number>
}

export function usePrintWatermark(options: WatermarkOptions) {
  const { enabled, image, opacity } = options

  /**
   * 添加浮水印到 iframe 文檔
   */
  const addWatermark = (iframeDoc: Document): void => {
    if (!enabled.value || !image.value) {
      return
    }

    // 創建浮水印容器
    const watermarkDiv = iframeDoc.createElement('div')
    watermarkDiv.className = 'watermark'
    watermarkDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      opacity: ${opacity.value / 100};
      z-index: -1;
      pointer-events: none;
    `

    // 創建浮水印圖片
    const watermarkImg = iframeDoc.createElement('img')
    watermarkImg.src = image.value
    watermarkImg.style.cssText = `
      max-width: 300px;
      max-height: 300px;
    `

    watermarkDiv.appendChild(watermarkImg)
    iframeDoc.body.appendChild(watermarkDiv)
  }

  /**
   * 生成浮水印樣式 CSS
   */
  const generateWatermarkStyles = (): string => {
    if (!enabled.value || !image.value) {
      return ''
    }

    return `
    /* 浮水印容器 */
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      opacity: ${opacity.value / 100};
      z-index: -1;
      pointer-events: none;
    }
    
    .watermark img {
      max-width: 300px;
      max-height: 300px;
    }
    `
  }

  return {
    addWatermark,
    generateWatermarkStyles,
  }
}
