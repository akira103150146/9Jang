<template>
  <teleport to="body">
    <div v-if="modelValue" class="modal-overlay" @click.self="close">
      <div class="modal-container">
        <div class="modal-header">
          <h2 class="modal-title">選擇模板</h2>
          <button @click="close" class="btn-close">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 搜尋區 -->
        <div class="filter-section">
          <div class="filter-row">
            <div class="filter-item full-width">
              <label class="filter-label">搜尋</label>
              <input v-model="searchQuery" type="text" class="filter-input" placeholder="輸入模板標題..." />
            </div>
          </div>
        </div>

        <!-- 模板列表 -->
        <div class="template-list">
          <div
            v-for="template in filteredTemplates"
            :key="template.template_id"
            class="template-item"
            :class="{ selected: selectedTemplateId === template.template_id }"
            @click="selectTemplate(template.template_id)"
          >
            <div class="template-info">
              <div class="template-header">
                <span class="template-id">T{{ template.template_id }}</span>
                <span class="template-title">{{ template.title }}</span>
              </div>
              <div class="template-description" v-if="template.description">
                {{ template.description }}
              </div>
              <div class="template-meta">
                <span class="template-blocks-count">
                  {{ template.structure?.length || 0 }} 個區塊
                </span>
              </div>
            </div>
          </div>
          <div v-if="filteredTemplates.length === 0" class="empty-state">
            沒有符合條件的模板
          </div>
        </div>

        <!-- 底部按鈕 -->
        <div class="modal-footer">
          <button @click="close" class="btn-cancel">取消</button>
          <button @click="confirm" class="btn-confirm" :disabled="!selectedTemplateId">
            確認選擇
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  templates: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'select'])

const searchQuery = ref('')
const selectedTemplateId = ref(null)

// 篩選後的模板列表
const filteredTemplates = computed(() => {
  if (!searchQuery.value) {
    return props.templates
  }
  const query = searchQuery.value.toLowerCase()
  return props.templates.filter(t => {
    return t.title?.toLowerCase().includes(query) ||
           t.description?.toLowerCase().includes(query)
  })
})

const selectTemplate = (templateId) => {
  selectedTemplateId.value = templateId
}

const confirm = () => {
  if (selectedTemplateId.value) {
    emit('select', selectedTemplateId.value)
    close()
  }
}

const close = () => {
  emit('update:modelValue', false)
  selectedTemplateId.value = null
  searchQuery.value = ''
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 2rem;
}

.modal-container {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgb(226, 232, 240);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgb(30, 41, 59);
}

.btn-close {
  padding: 0.5rem;
  border-radius: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: rgb(100, 116, 139);
  transition: all 0.2s;
}

.btn-close:hover {
  background: rgb(241, 245, 249);
  color: rgb(30, 41, 59);
}

.filter-section {
  padding: 1.5rem;
  border-bottom: 1px solid rgb(226, 232, 240);
  background: rgb(248, 250, 252);
}

.filter-row {
  display: flex;
  gap: 1rem;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-item.full-width {
  flex: 1;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(71, 85, 105);
}

.filter-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid rgb(203, 213, 225);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: white;
}

.filter-input:focus {
  outline: none;
  border-color: rgb(147, 51, 234);
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
}

.template-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.template-item {
  padding: 1rem;
  border: 2px solid rgb(226, 232, 240);
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.template-item:hover {
  border-color: rgb(147, 51, 234);
  background: rgb(250, 245, 255);
}

.template-item.selected {
  border-color: rgb(147, 51, 234);
  background: rgb(243, 232, 255);
}

.template-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.template-header {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.template-id {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  background: rgb(147, 51, 234);
  color: white;
  border-radius: 0.25rem;
}

.template-title {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(30, 41, 59);
}

.template-description {
  font-size: 0.875rem;
  color: rgb(100, 116, 139);
  line-height: 1.5;
}

.template-meta {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.template-blocks-count {
  font-size: 0.75rem;
  color: rgb(148, 163, 184);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: rgb(148, 163, 184);
  font-size: 0.875rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid rgb(226, 232, 240);
}

.btn-cancel,
.btn-confirm {
  padding: 0.5rem 1.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: white;
  border: 1px solid rgb(203, 213, 225);
  color: rgb(71, 85, 105);
}

.btn-cancel:hover {
  background: rgb(241, 245, 249);
}

.btn-confirm {
  background: rgb(147, 51, 234);
  border: none;
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  background: rgb(126, 34, 206);
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
