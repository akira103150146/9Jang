import { uploadImageAPI } from '../services/api'
import { parseSmartPaste } from '../components/BlockEditor/utils/smartPasteParser'
import { createNodesFromTokens } from '../components/BlockEditor/utils/nodeConverter'

/**
 * 編輯器貼上處理 Composable
 * 處理圖片和文字的智能貼上邏輯
 * 
 * @param {Object} options - 配置選項
 * @param {Object|Function} options.editor - Tiptap 編輯器實例或獲取函數
 * @param {Map|Function} options.imageMappings - 圖片映射表或獲取函數
 * @returns {Function} handlePaste 函數
 */
export function useEditorPaste(options = {}) {
  const { editor, imageMappings } = options
  
  // 獲取編輯器實例（支持 ref 或直接值）
  const getEditor = () => {
    if (typeof editor === 'function') return editor()
    return editor?.value || editor
  }
  
  // 獲取圖片映射表（支持 computed 或直接值）
  const getImageMappings = () => {
    if (typeof imageMappings === 'function') return imageMappings()
    return imageMappings?.value || imageMappings
  }

  /**
   * 處理圖片貼上
   */
  const handleImagePaste = async (event, imageItem) => {
    event.preventDefault()

    const file = imageItem.getAsFile()
    const editorInstance = getEditor()
    if (!file || !editorInstance) return true

    try {
      // 上傳圖片
      const response = await uploadImageAPI.upload(file)
      const imageUrl = response.data.url || response.data.image_url || response.data.url

      if (imageUrl && editorInstance) {
        // 使用 insertContent 插入圖片節點，這比 setImage 更可靠
        const imageNode = {
          type: 'image',
          attrs: {
            src: imageUrl,
            alt: file.name,
            title: file.name
          }
        }

        editorInstance.chain().focus().insertContent(imageNode).run()
      }

      return true
    } catch (error) {
      console.error('圖片上傳失敗:', error)
      alert('圖片上傳失敗，請稍後再試')
      return true
    }
  }

  /**
   * 處理文字貼上
   */
  const handleTextPaste = async (event, text) => {
    if (!text) return false

    try {
      // 使用智能解析器解析內容
      const tokens = parseSmartPaste(text)

      // 如果沒有特殊格式，使用預設行為
      if (tokens.length === 1 && tokens[0].type === 'paragraph' && !tokens[0].hasInlineLatex) {
        // 檢查是否包含 Markdown 格式
        const hasMarkdown = /^#{1,6}\s+|^[-*+]\s+|^\d+\.\s+/.test(text)
        if (!hasMarkdown) {
          return false // 使用預設貼上行為
        }
      }

      // 防止預設貼上行為
      event.preventDefault()

      // 創建節點，傳入圖片映射表
      const editorInstance = getEditor()
      const mappings = getImageMappings()
      const nodes = createNodesFromTokens(tokens, editorInstance, mappings)

      // 使用編輯器實例插入內容
      if (nodes.length > 0 && editorInstance) {
        editorInstance.chain().focus().insertContent(nodes).run()
      }

      return true
    } catch (error) {
      console.error('智能貼上處理失敗:', error)
      // 發生錯誤時使用預設行為
      return false
    }
  }

  /**
   * 主要的貼上處理函數
   */
  const handlePaste = async (view, event, slice) => {
    const clipboardData = event.clipboardData
    if (!clipboardData) return false

    // 檢查是否有圖片
    const items = Array.from(clipboardData.items)
    const imageItem = items.find(item => item.type.startsWith('image/'))

    if (imageItem) {
      return await handleImagePaste(event, imageItem)
    }

    // 處理文字貼上
    const text = clipboardData.getData('text/plain')
    return await handleTextPaste(event, text)
  }

  return {
    handlePaste
  }
}
