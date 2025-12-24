<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2>選擇圖片</h2>
        <button @click="close" class="close-btn">✕</button>
      </div>
      
      <div class="search-bar">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜尋檔名..."
          class="search-input"
        />
      </div>
      
      <div class="image-grid">
        <div 
          v-for="[filename, url] in filteredImages" 
          :key="filename"
          class="image-card"
          @click="selectImage(url)"
        >
          <img :src="url" :alt="filename" class="thumbnail" />
          <p class="image-filename">{{ filename }}</p>
        </div>
        
        <div v-if="filteredImages.length === 0" class="no-results">
          <p>找不到圖片</p>
          <p class="hint">請確認已上傳圖片或調整搜尋關鍵字</p>
        </div>
      </div>
      
      <div class="modal-footer">
        <div class="paste-hint" v-if="isOpen && !uploading">
          <span class="hint-text">💡 提示：按 Ctrl+V 可直接貼上圖片</span>
        </div>
        <div v-if="uploading" class="uploading-indicator">
          <span class="uploading-text">📤 正在上傳圖片...</span>
        </div>
        <div class="footer-buttons">
          <button @click="close" class="btn-cancel" :disabled="uploading">取消</button>
          <button @click="uploadNew" class="btn-upload" :disabled="uploading">選擇檔案上傳</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, watch, onMounted, onBeforeUnmount } from 'vue'
import { uploadImageAPI } from '../../../services/api'

const props = defineProps({
  isOpen: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'select', 'upload-new', 'image-uploaded'])

const imageMappings = inject('imageMappings', computed(() => new Map()))
const searchQuery = ref('')
const uploading = ref(false)

const filteredImages = computed(() => {
  if (!searchQuery.value) {
    return Array.from(imageMappings.value.entries())
  }
  
  const query = searchQuery.value.toLowerCase()
  return Array.from(imageMappings.value.entries()).filter(([filename]) =>
    filename.toLowerCase().includes(query)
  )
})

const close = () => {
  emit('close')
}

const selectImage = (url) => {
  emit('select', url)
  close()
}

const uploadNew = () => {
  emit('upload-new')
  close()
}

// 處理圖片貼上
const handlePaste = async (event) => {
  if (!props.isOpen) return
  
  const clipboardData = event.clipboardData
  if (!clipboardData) return
  
  // 檢查是否有圖片
  const items = Array.from(clipboardData.items)
  const imageItem = items.find(item => item.type.startsWith('image/'))
  
  if (imageItem) {
    event.preventDefault()
    event.stopPropagation()
    
    const file = imageItem.getAsFile()
    if (!file) return
    
    uploading.value = true
    
    try {
      // 上傳圖片
      const response = await uploadImageAPI.upload(file)
      const imageUrl = response.data.url || response.data.image_url || response.data.url
      
      if (imageUrl) {
        // 將圖片添加到映射表（imageMappings 是 computed，需要通過 .value 訪問實際的 Map）
        const mappings = imageMappings.value
        if (mappings && typeof mappings.set === 'function') {
          mappings.set(file.name, imageUrl)
          // 通知父組件圖片已上傳，需要保存映射表
          emit('image-uploaded', { filename: file.name, url: imageUrl })
        }
        
        // 自動選擇並插入圖片
        selectImage(imageUrl)
      }
    } catch (error) {
      console.error('圖片上傳失敗:', error)
      alert('圖片上傳失敗，請稍後再試')
    } finally {
      uploading.value = false
    }
  }
}

// 監聽 Modal 打開/關閉狀態，添加/移除 paste 事件監聽器
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    // Modal 打開時，添加 paste 事件監聽器
    document.addEventListener('paste', handlePaste, true)
  } else {
    // Modal 關閉時，移除 paste 事件監聽器
    document.removeEventListener('paste', handlePaste, true)
  }
})

// 組件卸載時清理
onBeforeUnmount(() => {
  document.removeEventListener('paste', handlePaste, true)
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #718096;
}

.search-bar {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.search-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
}

.image-grid {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.image-card {
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.image-card:hover {
  border-color: #4299e1;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.thumbnail {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
}

.image-filename {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #4a5568;
  text-align: center;
  word-break: break-all;
}

.no-results {
  grid-column: 1 / -1;
  text-align: center;
  padding: 2rem;
  color: #718096;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.paste-hint {
  text-align: center;
  padding: 0.5rem;
  background: #ebf8ff;
  border-radius: 4px;
  border: 1px solid #bee3f8;
}

.hint-text {
  font-size: 0.875rem;
  color: #2c5282;
  font-weight: 500;
}

.footer-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn-cancel, .btn-upload {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.btn-cancel {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-upload {
  background: #4299e1;
  color: white;
}

.btn-cancel:disabled,
.btn-upload:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.uploading-indicator {
  text-align: center;
  padding: 0.5rem;
  background: #fef3c7;
  border-radius: 4px;
  border: 1px solid #fde68a;
}

.uploading-text {
  font-size: 0.875rem;
  color: #92400e;
  font-weight: 500;
}
</style>
