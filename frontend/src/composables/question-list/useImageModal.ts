/**
 * useImageModal
 * 處理圖片預覽 modal 的邏輯
 */

import { ref, type Ref } from 'vue'

export interface ImageModal {
  open: boolean
  url: string
  caption: string
}

export function useImageModal() {
  const imageModal: Ref<ImageModal> = ref({ open: false, url: '', caption: '' })

  /**
   * 打開圖片 modal
   */
  const openImageModal = (url: string, caption = ''): void => {
    imageModal.value = { open: true, url, caption }
  }

  /**
   * 關閉圖片 modal
   */
  const closeImageModal = (): void => {
    imageModal.value = { open: false, url: '', caption: '' }
  }

  return {
    imageModal,
    openImageModal,
    closeImageModal,
  }
}
