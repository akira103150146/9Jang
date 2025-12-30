<template>
  <node-view-wrapper class="latex-block-wrapper">
    <div class="latex-block" :class="{ 'is-editing': isEditing }">
      <!-- 編輯模式 -->
      <div v-if="isEditing" class="latex-editor">
        <textarea
          ref="textareaRef"
          v-model="localFormula"
          @blur="handleBlur"
          @keydown.escape="handleEscape"
          placeholder="輸入 LaTeX 公式..."
          class="latex-input"
        />
        <div class="editor-actions">
          <button @click="handleSave" class="btn-save">儲存</button>
          <button @click="handleCancel" class="btn-cancel">取消</button>
        </div>
      </div>
      
      <!-- 預覽模式 -->
      <div 
        v-else 
        @click="startEditing"
        class="latex-preview"
        :class="{ 'empty': !node.attrs.formula }"
      >
        <div v-if="node.attrs.formula" v-html="renderedFormula" class="katex-container"></div>
        <div v-else class="empty-placeholder">
          點擊編輯 LaTeX 公式
        </div>
      </div>
      
      <!-- 子區塊內容 -->
      <node-view-content class="content" />
    </div>
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, type Ref } from 'vue'
import { NodeViewWrapper, NodeViewContent, nodeViewProps, type NodeViewProps } from '@tiptap/vue-3'
import katex from 'katex'
import type { LaTeXBlockAttributes } from '../extensions/LaTeXBlock'

const props = defineProps<NodeViewProps>()

const isEditing: Ref<boolean> = ref(false)
const localFormula: Ref<string> = ref((props.node.attrs.formula as string) || '')
const textareaRef: Ref<HTMLTextAreaElement | null> = ref(null)

// 渲染 LaTeX 公式
const renderedFormula = computed((): string => {
  const formula = props.node.attrs.formula as string | undefined
  if (!formula) return ''

  try {
    const displayMode = (props.node.attrs.displayMode as boolean | undefined) ?? true
    return katex.renderToString(formula, {
      displayMode,
      throwOnError: false,
      trust: true
    })
  } catch (error) {
    console.error('KaTeX render error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return `<span class="katex-error">公式錯誤: ${errorMessage}</span>`
  }
})

const startEditing = (): void => {
  isEditing.value = true
  localFormula.value = (props.node.attrs.formula as string) || ''

  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.focus()
    }
  })
}

const handleSave = (): void => {
  props.updateAttributes({
    formula: localFormula.value
  } as Partial<LaTeXBlockAttributes>)
  isEditing.value = false
}

const handleCancel = (): void => {
  localFormula.value = (props.node.attrs.formula as string) || ''
  isEditing.value = false
}

const handleBlur = (): void => {
  // 延遲處理以允許按鈕點擊
  setTimeout(() => {
    if (isEditing.value) {
      handleSave()
    }
  }, 200)
}

const handleEscape = (): void => {
  handleCancel()
}
</script>

<style scoped>
.latex-block-wrapper {
  margin: 1rem 0;
}

.latex-block {
  position: relative;
  padding: 1rem;
  border: 2px solid transparent;
  border-radius: 0.5rem;
  background: rgb(249, 250, 251);
  transition: all 0.2s;
}

.latex-block.is-editing {
  border-color: rgb(99, 102, 241);
  background: white;
}

/* 當區塊被選中或有焦點時的樣式 */
.latex-block-wrapper.ProseMirror-selectednode .latex-block:not(.is-editing),
.latex-block-wrapper:has(.ProseMirror-focused) .latex-block:not(.is-editing) {
  border-color: rgb(59, 130, 246);
  background: rgb(239, 246, 255);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.latex-editor {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.latex-input {
  width: 100%;
  min-height: 100px;
  padding: 0.75rem;
  border: 1px solid rgb(226, 232, 240);
  border-radius: 0.375rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  resize: vertical;
  outline: none;
}

.latex-input:focus {
  border-color: rgb(99, 102, 241);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.editor-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-save,
.btn-cancel {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-save {
  background: rgb(99, 102, 241);
  color: white;
}

.btn-save:hover {
  background: rgb(79, 70, 229);
}

.btn-cancel {
  background: rgb(241, 245, 249);
  color: rgb(51, 65, 85);
}

.btn-cancel:hover {
  background: rgb(226, 232, 240);
}

.latex-preview {
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 1rem;
  border-radius: 0.375rem;
  transition: background 0.2s;
}

.latex-preview:hover {
  background: rgb(241, 245, 249);
}

.latex-preview.empty {
  border: 2px dashed rgb(203, 213, 225);
}

.katex-container {
  width: 100%;
  overflow-x: auto;
}

.katex-container :deep(.katex) {
  font-size: 1.2em;
}

.empty-placeholder {
  color: rgb(148, 163, 184);
  font-size: 0.875rem;
}

.katex-error {
  color: rgb(239, 68, 68);
  font-size: 0.875rem;
}

.content {
  margin-top: 1rem;
  padding-left: 1.5rem;
  border-left: 3px solid rgb(226, 232, 240);
}
</style>
