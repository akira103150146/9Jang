import { ref, type Ref } from 'vue'
import { uploadImageAPI } from '../services/api'
import type { Editor } from '@tiptap/core'

/**
 * 圖片映射表：原檔名 -> 後端URL
 */
type ImageMappings = Map<string, string>

/**
 * 圖片上傳結果
 */
interface ImageUploadResult {
  originalName: string
  url: string
}

/**
 * 圖片替換位置信息
 */
interface ImageReplacePosition {
  type: 'image' | 'placeholder'
  pos: number
  newUrl: string
  filename: string
  alt: string
}

/**
 * 圖片管理選項
 */
export interface ImageManagementOptions {
  resourceId?: number | null
  resourceTitle?: string
  blockEditorRef?: Ref<{ editor: Editor } | null> | null
}

/**
 * 圖片管理功能 Composable
 * 處理圖片上傳、映射表管理、圖片替換等邏輯
 */
export function useImageManagement(options: ImageManagementOptions = {}) {
  const {
    resourceId = null,
    resourceTitle = 'untitled',
    blockEditorRef = null
  } = options

  // 圖片映射表: Map<原檔名, 後端URL>
  const imageMappings: Ref<ImageMappings> = ref(new Map())
  const uploadingImages: Ref<boolean> = ref(false)
  const replacingImages: Ref<boolean> = ref(false)

  /**
   * 獲取當前資源的映射表 key
   */
  const getImageMappingKey = (): string => {
    if (resourceId) {
      return `resource_${resourceId}`
    }
    return `temp_${resourceTitle || 'untitled'}`
  }

  /**
   * 載入當前資源的映射表
   */
  const loadImageMappings = (): void => {
    const key = getImageMappingKey()
    const saved = localStorage.getItem(`imageMappings_${key}`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Array<[string, string]>
        imageMappings.value = new Map(parsed)
      } catch (error) {
        console.error('載入圖片映射表失敗:', error)
        imageMappings.value = new Map()
      }
    } else {
      imageMappings.value = new Map()
    }
  }

  /**
   * 保存當前資源的映射表
   */
  const saveImageMappings = (): void => {
    const key = getImageMappingKey()
    localStorage.setItem(
      `imageMappings_${key}`,
      JSON.stringify(Array.from(imageMappings.value.entries()))
    )
  }

  /**
   * 清空當前資源的映射表
   */
  const clearImageMappings = (): void => {
    if (confirm('確定要清空當前文件的圖片映射表嗎？這不會刪除已上傳的圖片，只是清除映射關係。')) {
      imageMappings.value.clear()
      saveImageMappings()
      alert('已清空當前文件的圖片映射表')
    }
  }

  /**
   * 遷移臨時映射表到資源專屬映射表
   */
  const migrateTempMappings = (newResourceId: number): void => {
    const tempKey = getImageMappingKey()
    const resourceKey = `resource_${newResourceId}`
    const tempMappings = localStorage.getItem(`imageMappings_${tempKey}`)
    if (tempMappings) {
      localStorage.setItem(`imageMappings_${resourceKey}`, tempMappings)
      localStorage.removeItem(`imageMappings_${tempKey}`)
      loadImageMappings()
    }
  }

  /**
   * 處理圖片資料夾上傳
   */
  const handleImageFolderUpload = async (event: Event): Promise<void> => {
    const target = event.target as HTMLInputElement
    const files = Array.from(target.files || [])

    // 過濾出圖片檔案
    const imageFiles = files.filter((file) => file.type.startsWith('image/'))

    if (imageFiles.length === 0) {
      alert('未找到圖片檔案')
      target.value = ''
      return
    }

    uploadingImages.value = true

    try {
      // 批次上傳
      const uploadPromises = imageFiles.map((file) =>
        uploadImageAPI
          .upload(file)
          .then((response) => {
            const data = response.data as { url?: string; image_url?: string }
            return {
              originalName: file.name,
              url: data.url || data.image_url || ''
            }
          })
          .catch((error) => {
            console.error(`上傳 ${file.name} 失敗:`, error)
            return null
          })
      )

      const results = await Promise.all(uploadPromises)

      // 建立映射表 - 檢查檔名衝突
      const conflictWarnings: string[] = []
      const successfulUploads = results.filter((r): r is ImageUploadResult => r !== null)

      successfulUploads.forEach((result) => {
        // 檢查是否會覆蓋現有映射
        if (imageMappings.value.has(result.originalName)) {
          if (!conflictWarnings.includes(result.originalName)) {
            conflictWarnings.push(result.originalName)
          }
        }
        // 使用原始檔名作為 key
        imageMappings.value.set(result.originalName, result.url)
      })

      // 持久化到 localStorage
      saveImageMappings()

      let message = `成功上傳 ${successfulUploads.length} 張圖片`
      if (conflictWarnings.length > 0) {
        message += `\n\n注意：有 ${conflictWarnings.length} 個檔名重複（${conflictWarnings.join(', ')}），已覆蓋舊的映射。`
      }
      alert(message)
    } catch (error) {
      console.error('圖片上傳失敗:', error)
      const errorMessage = error instanceof Error ? error.message : '未知錯誤'
      alert('圖片上傳失敗: ' + errorMessage)
    } finally {
      uploadingImages.value = false
      // 清空選擇
      target.value = ''
    }
  }

  /**
   * 在單個編輯器中替換圖片的輔助函數
   */
  const replaceImagesInEditor = async (editor: Editor): Promise<number> => {
    const { state } = editor
    let replacedCount = 0
    const positions: ImageReplacePosition[] = []

    // 遍歷文檔找到所有需要替換的節點及其位置
    state.doc.descendants((node, pos) => {
      // 處理 image 節點
      if (node.type.name === 'image') {
        const title = (node.attrs?.title as string) || ''
        const alt = (node.attrs?.alt as string) || ''
        const src = (node.attrs?.src as string) || ''

        // 優先從 title 提取檔名（貼上時設置的）
        let filename: string | null = null
        if (title) {
          filename = title.split('/').pop()?.split('\\').pop() || null
        } else if (alt && !alt.startsWith('http') && !alt.includes('://')) {
          filename = alt.split('/').pop()?.split('\\').pop() || null
        } else if (src && !src.startsWith('http')) {
          filename = src.split('/').pop()?.split('\\').pop() || null
        } else if (src) {
          const urlParts = src.split('/')
          const lastPart = urlParts[urlParts.length - 1]
          if (lastPart.includes('.')) {
            filename = lastPart.split('?')[0].split('#')[0]
          }
        }

        if (filename) {
          let newUrl: string | undefined
          let matchedFilename = filename
          if (imageMappings.value.has(filename)) {
            newUrl = imageMappings.value.get(filename)
          } else {
            // 嘗試不區分大小寫匹配
            for (const [key, url] of imageMappings.value.entries()) {
              if (key.toLowerCase() === filename.toLowerCase()) {
                newUrl = url
                matchedFilename = key // 使用正確的檔名
                break
              }
            }
          }

          if (newUrl) {
            positions.push({
              type: 'image',
              pos,
              newUrl,
              filename: matchedFilename,
              alt: (node.attrs?.alt as string) || matchedFilename
            })
          }
        }
      }

      // 處理 imagePlaceholder 節點
      if (node.type.name === 'imagePlaceholder') {
        const filename = (node.attrs?.filename as string) || ''

        if (filename && imageMappings.value.has(filename)) {
          const newUrl = imageMappings.value.get(filename)
          if (newUrl) {
            positions.push({
              type: 'placeholder',
              pos,
              newUrl,
              filename,
              alt: (node.attrs?.alt as string) || filename
            })
          }
        }
      }
    })

    // 從後往前替換（避免位置偏移）
    positions.sort((a, b) => b.pos - a.pos)

    // 使用單一 transaction 來批量替換，確保所有操作原子性
    const tr = editor.state.tr

    for (const item of positions) {
      if (item.type === 'placeholder') {
        // 對於 imagePlaceholder 節點，需要獲取節點大小並使用 replaceWith
        const node = editor.state.doc.nodeAt(item.pos)
        if (node && node.type.name === 'imagePlaceholder') {
          const nodeSize = node.nodeSize
          const imageNode = editor.schema.nodes.image.create({
            src: item.newUrl,
            alt: item.alt,
            title: item.filename
          })
          tr.replaceWith(item.pos, item.pos + nodeSize, imageNode)
          replacedCount++
        }
      } else {
        // 對於已存在的 image 節點，只需要更新屬性
        const node = editor.state.doc.nodeAt(item.pos)
        if (node && node.type.name === 'image') {
          tr.setNodeMarkup(item.pos, null, {
            ...node.attrs,
            src: item.newUrl,
            alt: item.alt,
            title: item.filename
          })
          replacedCount++
        }
      }
    }

    // 一次性執行所有替換
    if (replacedCount > 0) {
      editor.view.dispatch(tr)
    }

    return replacedCount
  }

  /**
   * 替換所有圖片
   */
  const replaceAllImages = async (): Promise<void> => {
    replacingImages.value = true

    try {
      const editor = blockEditorRef?.value?.editor
      if (!editor) {
        replacingImages.value = false
        alert('編輯器未就緒，請稍後再試')
        return
      }

      const totalReplacedCount = await replaceImagesInEditor(editor)

      if (totalReplacedCount > 0) {
        alert(`成功替換 ${totalReplacedCount} 張圖片`)
      } else {
        alert('沒有找到需要替換的圖片')
      }
    } catch (error) {
      console.error('替換圖片失敗:', error)
      const errorMessage = error instanceof Error ? error.message : '未知錯誤'
      alert('替換圖片失敗: ' + errorMessage)
    } finally {
      replacingImages.value = false
    }
  }

  /**
   * 打開圖片資料夾上傳對話框
   */
  const openImageFolderUpload = (): void => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = 'image/png,image/jpeg,image/jpg,image/gif'
    input.onchange = (event: Event) => {
      handleImageFolderUpload(event)
    }
    input.click()
  }

  return {
    imageMappings,
    uploadingImages,
    replacingImages,
    loadImageMappings,
    saveImageMappings,
    clearImageMappings,
    migrateTempMappings,
    handleImageFolderUpload,
    openImageFolderUpload,
    replaceAllImages
  }
}
