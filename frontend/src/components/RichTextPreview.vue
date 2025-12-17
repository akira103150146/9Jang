<template>
  <div class="rich-text-preview">
    <div class="preview-content" v-html="renderedContent" @click="onPreviewClick"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useMarkdownRenderer } from '../composables/useMarkdownRenderer'

const props = defineProps({
  content: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['jump-to-line'])

const { renderMarkdownWithLatex, renderMarkdownWithLatexAndSourceMap } = useMarkdownRenderer()

const renderedContent = computed(() => {
  // 優先使用帶 source map 的渲染（用於點預覽跳回編輯）
  if (typeof renderMarkdownWithLatexAndSourceMap === 'function') {
    return renderMarkdownWithLatexAndSourceMap(props.content || '')
  }
  return renderMarkdownWithLatex(props.content || '')
})

const onPreviewClick = (event) => {
  const el = event?.target?.closest?.('[data-source-line]')
  if (!el) return
  const line = Number(el.getAttribute('data-source-line'))
  if (!Number.isFinite(line) || line < 1) return
  emit('jump-to-line', line)
}
</script>

<style scoped>
.rich-text-preview {
  min-height: 300px;
  padding: 1rem;
  background: white;
  border: 1px solid rgb(203, 213, 225);
  border-radius: 0.5rem;
}

.preview-content {
  line-height: 1.6;
  color: rgb(0, 0, 0) !important;
  background: white !important;
}

.preview-content :deep(*) {
  color: rgb(0, 0, 0) !important;
  background: transparent !important;
}

.preview-content :deep(p) {
  color: rgb(0, 0, 0) !important;
  background: transparent !important;
}

.preview-content :deep(span) {
  color: rgb(0, 0, 0) !important;
  background: transparent !important;
}

.preview-content :deep(p) {
  margin: 0.5rem 0;
}

.preview-content :deep(h1) {
  font-size: 2em;
  font-weight: bold;
  margin: 1rem 0;
}

.preview-content :deep(h2) {
  font-size: 1.5em;
  font-weight: bold;
  margin: 0.875rem 0;
}

.preview-content :deep(ul),
.preview-content :deep(ol) {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.preview-content :deep(li) {
  margin: 0.25rem 0;
}

.preview-content :deep(code) {
  background: rgb(241, 245, 249);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  font-size: 0.875em;
}

.preview-content :deep(pre) {
  background: rgb(30, 41, 59);
  color: rgb(226, 232, 240);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.preview-content :deep(pre code) {
  background: transparent;
  padding: 0;
  color: inherit;
}

.preview-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.25rem;
  margin: 1rem 0;
}

.preview-content :deep(.diagram-preview),
.preview-content :deep(.circuit-preview) {
  margin: 1rem 0;
  text-align: center;
  border: 1px dashed rgb(203, 213, 225);
  border-radius: 0.5rem;
  padding: 1rem;
  background: rgb(248, 250, 252);
}

.preview-content :deep(.diagram-placeholder) {
  margin: 1rem 0;
  padding: 2rem;
  text-align: center;
  color: rgb(148, 163, 184);
  border: 2px dashed rgb(203, 213, 225);
  border-radius: 0.5rem;
  background: rgb(248, 250, 252);
}

.preview-content :deep(.latex-error) {
  color: red;
  font-style: italic;
  background: rgba(255, 0, 0, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.preview-content :deep([data-source-line]) {
  cursor: pointer;
}

.preview-content :deep([data-source-line]:hover) {
  outline: 2px solid rgba(99, 102, 241, 0.35);
  outline-offset: 2px;
  border-radius: 0.25rem;
}
</style>
