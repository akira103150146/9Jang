import { ref, type Ref } from 'vue'

/**
 * 浮水印管理功能 Composable
 * 處理浮水印的上傳、移除、設定等邏輯
 */
export function useWatermark() {
  // 浮水印設定
  const watermarkEnabled: Ref<boolean> = ref(false)
  const watermarkImage: Ref<string | null> = ref(null)
  const watermarkOpacity: Ref<number> = ref(10) // 預設 10%
  const watermarkInput: Ref<HTMLInputElement | null> = ref(null)

  /**
   * 打開浮水印上傳對話框
   */
  const openWatermarkUpload = (): void => {
    watermarkInput.value?.click()
  }

  /**
   * 處理浮水印上傳
   */
  const handleWatermarkUpload = async (event: Event): Promise<void> => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    // 檢查檔案類型
    if (!file.type.startsWith('image/')) {
      alert('請上傳圖片檔案')
      target.value = ''
      return
    }

    // 讀取圖片為 Base64
    const reader = new FileReader()
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        watermarkImage.value = e.target.result
      }
    }
    reader.readAsDataURL(file)

    // 清空 input
    target.value = ''
  }

  /**
   * 移除浮水印
   */
  const removeWatermark = (): void => {
    watermarkImage.value = null
    watermarkEnabled.value = false
  }

  return {
    watermarkEnabled,
    watermarkImage,
    watermarkOpacity,
    watermarkInput,
    openWatermarkUpload,
    handleWatermarkUpload,
    removeWatermark
  }
}
