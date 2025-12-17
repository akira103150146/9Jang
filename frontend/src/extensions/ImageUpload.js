import { Image } from '@tiptap/extension-image'
import { Plugin } from '@tiptap/pm/state'
import { uploadImageAPI } from '../services/api'

export const ImageUpload = Image.extend({
  name: 'imageUpload',

  addOptions() {
    return {
      ...(this.parent?.() || {}),
      inline: false,
      allowBase64: false, // 禁止 Base64
    }
  },

  addProseMirrorPlugins() {
    const extension = this
    const parentPlugins = this.parent?.() || []
    return [
      ...parentPlugins,
      new Plugin({
        key: 'imageUploadPaste',
        props: {
          handlePaste: (view, event, slice) => {
            const items = Array.from(event.clipboardData?.items || [])
            const imageItem = items.find(item => item.type.startsWith('image/'))

            if (imageItem) {
              event.preventDefault()
              const file = imageItem.getAsFile()
              if (file) {
                uploadAndInsertImage(file, extension.editor)
              }
              return true
            }
            return false
          },
          handleDrop: (view, event, slice, moved) => {
            if (moved) return false

            const files = Array.from(event.dataTransfer?.files || [])
            const imageFile = files.find(file => file.type.startsWith('image/'))

            if (imageFile) {
              event.preventDefault()
              uploadAndInsertImage(imageFile, extension.editor)
              return true
            }
            return false
          },
        },
      }),
    ]
  },
})

// 上傳圖片並插入的輔助函數
async function uploadAndInsertImage(file, editor) {
  // 檢查文件大小（5MB）
  if (file.size > 5 * 1024 * 1024) {
    alert('圖片文件大小不能超過 5MB')
    return
  }

  try {
    const response = await uploadImageAPI.upload(file)
    const imageUrl = response.data.image_url || response.data.image_path

    if (imageUrl) {
      // 確保 URL 是完整的
      let fullUrl = imageUrl
      if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        const backendBaseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
        fullUrl = imageUrl.startsWith('/') ? `${backendBaseURL}${imageUrl}` : `${backendBaseURL}/${imageUrl}`
      }

      // 插入圖片節點
      editor.commands.setImage({
        src: fullUrl,
        alt: file.name || 'image',
      })
    }
  } catch (error) {
    console.error('上傳圖片失敗：', error)
    alert('上傳圖片失敗，請稍後再試')
  }
}
