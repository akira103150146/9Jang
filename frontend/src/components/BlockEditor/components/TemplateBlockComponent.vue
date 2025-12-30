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
          <!-- 使用 BlockEditor 唯讀模式顯示模板內容 -->
          <div v-if="templateData.tiptap_structure && templateData.tiptap_structure.type === 'doc'" class="template-tiptap-content" ref="templateContentRef">
            <BlockEditor
              :model-value="templateData.tiptap_structure"
              :templates="[]"
              :questions="[]"
              :auto-page-break="false"
              :readonly="true"
              :show-page-numbers="false"
              :image-mappings="imageMappings"
            />
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

<script setup lang="ts">
import { ref, watch, computed, inject, nextTick, type Ref, type InjectionKey } from 'vue'
import { NodeViewWrapper, NodeViewContent, nodeViewProps, type NodeViewProps } from '@tiptap/vue-3'
import { contentTemplateAPI } from '../../../services/api'
import TemplateSelectorModal from './TemplateSelectorModal.vue'
import BlockEditor from '../BlockEditor.vue'
import type { TiptapDocument } from '@9jang/shared'

/**
 * 模板類型
 */
interface Template {
  id: number
  title: string
  tiptap_structure?: TiptapDocument
  [key: string]: unknown
}

const props = defineProps<NodeViewProps>()

// 從父組件注入可用的模板列表和圖片映射表
const TemplatesInjectionKey: InjectionKey<Ref<Template[]>> = Symbol('templates')
const ImageMappingsInjectionKey: InjectionKey<Ref<Map<string, string>>> = Symbol('imageMappings')

const availableTemplates: Ref<Template[]> = inject(TemplatesInjectionKey, ref([]))
const imageMappings: Ref<Map<string, string>> = inject(ImageMappingsInjectionKey, ref(new Map()))

const templateData: Ref<Template | null> = ref(null)
const loading: Ref<boolean> = ref(false)
const showSelector: Ref<boolean> = ref(false)
const templateContentRef: Ref<HTMLElement | null> = ref(null)

// 載入模板數據
const loadTemplate = async (templateId: number): Promise<void> => {
  if (!templateId) return

  loading.value = true
  try {
    const response = await contentTemplateAPI.getById(templateId)
    templateData.value = response.data as Template
  } catch (error) {
    console.error('Failed to load template:', error)
    templateData.value = null
  } finally {
    loading.value = false
  }
}

// 監聽 templateId 變化
watch(
  () => props.node.attrs.templateId as number | undefined,
  (newId) => {
    if (newId) {
      loadTemplate(newId)
    } else {
      templateData.value = null
    }
  },
  { immediate: true }
)

// 監聽模板內容載入完成後，檢查高度
watch(
  () => templateData.value?.tiptap_structure,
  async (newStructure) => {
    if (newStructure && templateContentRef.value) {
      await nextTick()
    }
  },
  { immediate: true }
)

const onTemplateSelected = (templateId: number): void => {
  props.updateAttributes({
    templateId
  })
}

const handleChangeTemplate = (): void => {
  // 打開選擇器而不是清除
  showSelector.value = true
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
  transition: all 0.2s;
}

/* 當區塊被選中或有焦點時的樣式 */
.template-block-wrapper.ProseMirror-selectednode .template-block,
.template-block-wrapper:has(.ProseMirror-focused) .template-block {
  border-color: rgb(126, 34, 206);
  background: rgb(243, 232, 255);
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
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

.template-tiptap-content {
  margin-top: 0.75rem;
  /* 讓內容自然決定高度，不設置最大高度或滾動 */
  height: auto;
  overflow: visible;
}

.template-tiptap-content :deep(.block-editor-container) {
  border: none;
  background: transparent;
  padding: 0;
  /* 移除所有固定高度，讓內容決定高度 */
  min-height: auto !important;
  max-height: none !important;
  height: auto !important;
  overflow: visible !important;
}

.template-tiptap-content :deep(.paper-sheet) {
  /* 移除紙張區域的固定最小高度 */
  min-height: auto !important;
  max-height: none !important;
  height: auto !important;
  /* 移除滾動，讓內容自然顯示 */
  overflow: visible !important;
}

.template-tiptap-content :deep(.editor-content) {
  padding: 0;
  min-height: auto !important;
  height: auto !important;
  overflow: visible !important;
}

.template-tiptap-content :deep(.ProseMirror) {
  padding: 0;
  min-height: auto !important;
  /* 讓內容自然決定高度 */
  height: auto !important;
  overflow: visible !important;
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
