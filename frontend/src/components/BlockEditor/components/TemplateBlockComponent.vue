<template>
  <node-view-wrapper class="template-block-wrapper">
    <div class="template-block">
      <!-- 模板選擇器 - 改為按鈕 -->
      <div v-if="!node.attrs.templateId" class="template-selector">
        <button @click="showSelector = true" class="btn-select-template">
          📄 選擇模板
        </button>
      </div>
      
      <!-- 模板預覽 -->
      <div v-else class="template-preview">
        <div class="template-header">
          <div class="template-badge">📄 模板</div>
          <button @click="handleChangeTemplate" class="btn-change">
            更換模板
          </button>
        </div>
        
        <div v-if="templateData" class="template-content">
          <h4 class="template-title">{{ templateData.title }}</h4>
          <div 
            v-if="templateData.structure && templateData.structure.length > 0"
            class="template-structure"
          >
            <div
              v-for="(block, index) in templateData.structure"
              :key="index"
              class="template-block-item"
              v-html="renderTemplateBlock(block)"
            ></div>
          </div>
          <div v-else class="empty-template">
            模板內容為空
          </div>
        </div>
        
        <div v-else-if="loading" class="template-loading">
          載入中...
        </div>
        
        <div v-else class="template-error">
          無法載入模板
        </div>
      </div>
      
      <!-- 子區塊內容 -->
      <node-view-content class="content" />
    </div>

    <!-- 模板選擇器 Modal -->
    <TemplateSelectorModal
      v-model="showSelector"
      :templates="availableTemplates"
      @select="onTemplateSelected"
    />
  </node-view-wrapper>
</template>

<script setup>
import { ref, watch, computed, inject } from 'vue'
import { NodeViewWrapper, NodeViewContent, nodeViewProps } from '@tiptap/vue-3'
import { contentTemplateAPI } from '../../../services/api'
import { useMarkdownRenderer } from '../../../composables/useMarkdownRenderer'
import TemplateSelectorModal from './TemplateSelectorModal.vue'

const props = defineProps(nodeViewProps)

const { renderMarkdownWithLatex } = useMarkdownRenderer()

// 從父組件注入可用的模板列表
const availableTemplates = inject('templates', ref([]))

const templateData = ref(null)
const loading = ref(false)
const showSelector = ref(false)

// 載入模板數據
const loadTemplate = async (templateId) => {
  if (!templateId) return
  
  loading.value = true
  try {
    const response = await contentTemplateAPI.getById(templateId)
    templateData.value = response.data
  } catch (error) {
    console.error('Failed to load template:', error)
    templateData.value = null
  } finally {
    loading.value = false
  }
}

// 監聽 templateId 變化
watch(() => props.node.attrs.templateId, (newId) => {
  if (newId) {
    loadTemplate(newId)
  } else {
    templateData.value = null
  }
}, { immediate: true })

const onTemplateSelected = (templateId) => {
  props.updateAttributes({
    templateId
  })
}

const handleChangeTemplate = () => {
  // 打開選擇器而不是清除
  showSelector.value = true
}

const renderTemplateBlock = (block) => {
  if (!block || !block.content) return ''
  return renderMarkdownWithLatex(block.content)
}
</script>

<style scoped>
.template-block-wrapper {
  margin: 1rem 0;
}

.template-block {
  position: relative;
  padding: 1rem;
  border: 2px solid rgb(147, 51, 234);
  border-radius: 0.5rem;
  background: rgb(250, 245, 255);
}

.template-selector {
  padding: 1rem;
  display: flex;
  justify-content: center;
}

.btn-select-template {
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  background: white;
  border: 2px dashed rgb(203, 213, 225);
  color: rgb(100, 116, 139);
  transition: all 0.2s;
}

.btn-select-template:hover {
  border-color: rgb(147, 51, 234);
  background: rgb(250, 245, 255);
  color: rgb(147, 51, 234);
}

.template-preview {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.template-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  background: rgb(147, 51, 234);
  color: white;
  border-radius: 9999px;
}

.btn-change {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  background: white;
  border: 1px solid rgb(226, 232, 240);
  color: rgb(51, 65, 85);
  transition: all 0.2s;
}

.btn-change:hover {
  background: rgb(241, 245, 249);
}

.template-content {
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
}

.template-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgb(30, 41, 59);
  margin-bottom: 0.75rem;
}

.template-structure {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.template-block-item {
  padding: 0.75rem;
  background: rgb(249, 250, 251);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  line-height: 1.6;
}

.template-block-item :deep(.katex) {
  font-size: 1em;
}

.empty-template,
.template-loading,
.template-error {
  padding: 2rem;
  text-align: center;
  color: rgb(148, 163, 184);
  font-size: 0.875rem;
}

.template-error {
  color: rgb(239, 68, 68);
}

.content {
  margin-top: 1rem;
  padding-left: 1.5rem;
  border-left: 3px solid rgb(216, 180, 254);
}
</style>
