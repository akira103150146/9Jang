import { ref } from 'vue'
import { uploadImageAPI } from '../services/api'

/**
 * 圖片管理功能 Composable
 * 處理圖片上傳、映射表管理、圖片替換等邏輯
 */
export function useImageManagement(options = {}) {
    const {
        resourceId = null,
        resourceTitle = 'untitled',
        blockEditorRef = null
    } = options

    // 圖片映射表: Map<原檔名, 後端URL>
    const imageMappings = ref(new Map())
    const uploadingImages = ref(false)
    const replacingImages = ref(false)

    /**
     * 獲取當前資源的映射表 key
     */
    const getImageMappingKey = () => {
        if (resourceId) {
            return `resource_${resourceId}`
        }
        return `temp_${resourceTitle || 'untitled'}`
    }

    /**
     * 載入當前資源的映射表
     */
    const loadImageMappings = () => {
        const key = getImageMappingKey()
        const saved = localStorage.getItem(`imageMappings_${key}`)
        if (saved) {
            try {
                imageMappings.value = new Map(JSON.parse(saved))
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
    const saveImageMappings = () => {
        const key = getImageMappingKey()
        localStorage.setItem(`imageMappings_${key}`,
            JSON.stringify(Array.from(imageMappings.value.entries()))
        )
    }

    /**
     * 清空當前資源的映射表
     */
    const clearImageMappings = () => {
        if (confirm('確定要清空當前文件的圖片映射表嗎？這不會刪除已上傳的圖片，只是清除映射關係。')) {
            imageMappings.value.clear()
            saveImageMappings()
            alert('已清空當前文件的圖片映射表')
        }
    }

    /**
     * 遷移臨時映射表到資源專屬映射表
     */
    const migrateTempMappings = (newResourceId) => {
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
    const handleImageFolderUpload = async (event) => {
        const files = Array.from(event.target.files || [])

        // 過濾出圖片檔案
        const imageFiles = files.filter(file =>
            file.type.startsWith('image/')
        )

        if (imageFiles.length === 0) {
            alert('未找到圖片檔案')
            event.target.value = ''
            return
        }

        uploadingImages.value = true

        try {
            // 批次上傳
            const uploadPromises = imageFiles.map(file =>
                uploadImageAPI.upload(file).then(response => ({
                    originalName: file.name,
                    url: response.data.url || response.data.image_url || response.data.url
                })).catch(error => {
                    console.error(`上傳 ${file.name} 失敗:`, error)
                    return null
                })
            )

            const results = await Promise.all(uploadPromises)

            // 建立映射表 - 檢查檔名衝突
            const conflictWarnings = []
            const successfulUploads = results.filter(r => r !== null)

            successfulUploads.forEach(result => {
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
            alert('圖片上傳失敗: ' + (error.message || '未知錯誤'))
        } finally {
            uploadingImages.value = false
            // 清空選擇
            event.target.value = ''
        }
    }

    /**
     * 在單個編輯器中替換圖片的輔助函數
     */
    const replaceImagesInEditor = async (editor) => {
        const { state } = editor
        let replacedCount = 0
        const positions = []

        // 遍歷文檔找到所有需要替換的節點及其位置
        state.doc.descendants((node, pos) => {
            // 處理 image 節點
            if (node.type.name === 'image') {
                const title = node.attrs?.title || ''
                const alt = node.attrs?.alt || ''
                const src = node.attrs?.src || ''

                // 優先從 title 提取檔名（貼上時設置的）
                let filename = null
                if (title) {
                    filename = title.split('/').pop().split('\\').pop()
                } else if (alt && !alt.startsWith('http') && !alt.includes('://')) {
                    filename = alt.split('/').pop().split('\\').pop()
                } else if (src && !src.startsWith('http')) {
                    filename = src.split('/').pop().split('\\').pop()
                } else if (src) {
                    const urlParts = src.split('/')
                    const lastPart = urlParts[urlParts.length - 1]
                    if (lastPart.includes('.')) {
                        filename = lastPart.split('?')[0].split('#')[0]
                    }
                }

                if (filename) {
                    let newUrl = null
                    if (imageMappings.value.has(filename)) {
                        newUrl = imageMappings.value.get(filename)
                    } else {
                        // 嘗試不區分大小寫匹配
                        for (const [key, url] of imageMappings.value.entries()) {
                            if (key.toLowerCase() === filename.toLowerCase()) {
                                newUrl = url
                                filename = key // 使用正確的檔名
                                break
                            }
                        }
                    }

                    if (newUrl) {
                        positions.push({
                            type: 'image',
                            pos: pos,
                            newUrl: newUrl,
                            filename: filename,
                            alt: node.attrs?.alt || filename
                        })
                    }
                }
            }

            // 處理 imagePlaceholder 節點
            if (node.type.name === 'imagePlaceholder') {
                const filename = node.attrs?.filename || ''

                if (filename && imageMappings.value.has(filename)) {
                    const newUrl = imageMappings.value.get(filename)
                    positions.push({
                        type: 'placeholder',
                        pos: pos,
                        newUrl: newUrl,
                        filename: filename,
                        alt: node.attrs?.alt || filename
                    })
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
    const replaceAllImages = async () => {
        replacingImages.value = true

        try {
            if (!blockEditorRef?.value?.editor) {
                replacingImages.value = false
                alert('編輯器未就緒，請稍後再試')
                return
            }

            const totalReplacedCount = await replaceImagesInEditor(blockEditorRef.value.editor)

            if (totalReplacedCount > 0) {
                alert(`成功替換 ${totalReplacedCount} 張圖片`)
            } else {
                alert('沒有找到需要替換的圖片')
            }

        } catch (error) {
            console.error('替換圖片失敗:', error)
            alert('替換圖片失敗: ' + (error.message || '未知錯誤'))
        } finally {
            replacingImages.value = false
        }
    }

    /**
     * 打開圖片資料夾上傳對話框
     */
    const openImageFolderUpload = () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.multiple = true
        input.accept = 'image/png,image/jpeg,image/jpg,image/gif'
        input.onchange = (event) => {
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
