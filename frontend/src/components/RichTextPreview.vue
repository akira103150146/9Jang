<template>
  <div class="rich-text-preview">
    <div ref="previewRoot" class="preview-content" v-html="renderedContent" @click="onPreviewClick"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch, type Ref } from 'vue'
import { createApp, h, type App } from 'vue'
import { useMarkdownRenderer } from '../composables/useMarkdownRenderer'
import Diagram2DPreview from './Diagram2DPreview.vue'
import Diagram3DPreview from './Diagram3DPreview.vue'
import CircuitPreview from './CircuitPreview.vue'

interface Props {
  content?: string
}

const props = withDefaults(defineProps<Props>(), {
  content: ''
})

interface JumpToPayload {
  pos: number | null
  line: number | null
}

interface Emits {
  (e: 'jump-to', payload: JumpToPayload): void
}

const emit = defineEmits<Emits>()

const { renderMarkdownWithLatex, renderMarkdownWithLatexAndSourceMap } = useMarkdownRenderer()

const previewRoot: Ref<HTMLElement | null> = ref(null)
const mounted = new Map<HTMLElement, App>() // el -> app

const renderedContent = computed<string>(() => {
  // 優先使用帶 source map 的渲染（用於點預覽跳回編輯）
  if (typeof renderMarkdownWithLatexAndSourceMap === 'function') {
    return renderMarkdownWithLatexAndSourceMap(props.content || '')
  }
  return renderMarkdownWithLatex(props.content || '')
})

const unmountAll = (): void => {
  mounted.forEach((app) => {
    try {
      app.unmount()
    } catch (e) {
      // ignore
    }
  })
  mounted.clear()
}

const mountEmbeds = async (): Promise<void> => {
  await nextTick()
  unmountAll()
  const root = previewRoot.value
  if (!root) return
  const nodes = root.querySelectorAll<HTMLElement>('[data-embed-type][data-embed]')
  if (!nodes || nodes.length === 0) return

  nodes.forEach((el) => {
    const type = el.getAttribute('data-embed-type')
    const encoded = el.getAttribute('data-embed') || ''
    let raw = ''
    try {
      raw = decodeURIComponent(encoded)
    } catch (e) {
      raw = ''
    }

    let data: Record<string, unknown> = {}
    try {
      data = raw ? JSON.parse(raw) : {}
    } catch (e) {
      data = {}
    }

    let Comp: unknown = null
    if (type === 'diagram2d') Comp = Diagram2DPreview
    else if (type === 'diagram3d') Comp = Diagram3DPreview
    else if (type === 'circuit') Comp = CircuitPreview

    if (!Comp) return

    // 清空 placeholder 文字後掛載
    el.innerHTML = ''
    const app = createApp({
      render: () => h(Comp as any, { data })
    })
    app.mount(el)
    mounted.set(el, app)
  })
}

// #region agent log
// 調試函數：測量分數線位置
const measureFractionLinePosition = () => {
  const root = previewRoot.value
  if (!root) return
  
  const fractions = root.querySelectorAll('.katex .mfrac')
  if (fractions.length === 0) return
  
  fractions.forEach((mfrac, idx) => {
    const fracLine = mfrac.querySelector('.frac-line')
    if (!fracLine) return
    
    const numerator = mfrac.querySelector('.vlist-t:first-child')
    const denominator = mfrac.querySelector('.vlist-t:last-child')
    
    if (!numerator || !denominator) return
    
    const mfracRect = mfrac.getBoundingClientRect()
    const lineRect = fracLine.getBoundingClientRect()
    const numRect = numerator.getBoundingClientRect()
    const denRect = denominator.getBoundingClientRect()
    
    const mfracHeight = mfracRect.height
    const lineTop = lineRect.top - mfracRect.top
    const lineBottom = lineRect.bottom - mfracRect.top
    const numHeight = numRect.height
    const denHeight = denRect.height
    
    const marginTop = parseFloat(getComputedStyle(fracLine).marginTop) || 0
    const marginBottom = parseFloat(getComputedStyle(fracLine).marginBottom) || 0
    
    const expectedCenter = mfracHeight / 2
    const actualCenter = lineTop + (lineBottom - lineTop) / 2
    const offsetFromCenter = actualCenter - expectedCenter
    
    fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'RichTextPreview.vue:measureFractionLinePosition',
        message: `分數線位置測量 #${idx}`,
        data: {
          mfracHeight,
          lineTop,
          lineBottom,
          numHeight,
          denHeight,
          marginTop,
          marginBottom,
          expectedCenter,
          actualCenter,
          offsetFromCenter,
          cssMarginTop: getComputedStyle(fracLine).marginTop,
          cssMarginBottom: getComputedStyle(fracLine).marginBottom
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'A'
      })
    }).catch(() => {})
  })
}
// #endregion

watch(renderedContent, () => {
  mountEmbeds()
  // #region agent log
  nextTick(() => {
    setTimeout(() => {
      measureFractionLinePosition()
    }, 100)
  })
  // #endregion
})

onBeforeUnmount(() => {
  unmountAll()
})

const onPreviewClick = (event: MouseEvent): void => {
  // 移除數學公式和嵌入元件的編輯功能
  // 只保留跳轉到源代碼的功能
  const target = event.target as HTMLElement | null
  const el = target?.closest<HTMLElement>('[data-source-pos],[data-source-line]')
  if (!el) return
  const posAttr = el.getAttribute('data-source-pos')
  const lineAttr = el.getAttribute('data-source-line')
  const pos = posAttr != null ? Number(posAttr) : null
  const line = lineAttr != null ? Number(lineAttr) : null
  if (Number.isFinite(pos) && pos >= 0) {
    emit('jump-to', { pos: pos as number, line: Number.isFinite(line) ? (line as number) : null })
    return
  }
  if (Number.isFinite(line) && line >= 1) {
    emit('jump-to', { pos: null, line: line as number })
  }
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

.preview-content :deep([data-source-line]),
.preview-content :deep([data-source-pos]) {
  cursor: pointer;
}

.preview-content :deep([data-source-line]:hover),
.preview-content :deep([data-source-pos]:hover) {
  outline: 2px solid rgba(99, 102, 241, 0.35);
  outline-offset: 2px;
  border-radius: 0.25rem;
}
</style>
