<template>
  <div class="rich-text-preview">
    <div ref="previewRoot" class="preview-content" v-html="renderedContent" @click="onPreviewClick"></div>
    <MathPreviewEditorModal
      v-if="mathEditor.open"
      :latex="mathEditor.latex"
      @cancel="closeMathEditor"
      @save="saveMathEditor"
    />
    <EmbedJsonEditorModal
      v-if="embedEditor.open"
      :title="embedEditor.type === 'diagram2d' ? '編輯 2D 圖形' : '編輯 3D 圖形'"
      :initial="embedEditor.raw"
      :preview-component="embedEditor.type === 'diagram2d' ? Diagram2DPreview : Diagram3DPreview"
      @cancel="closeEmbedEditor"
      @save="saveEmbedEditor"
    />
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { createApp, h } from 'vue'
import { useMarkdownRenderer } from '../composables/useMarkdownRenderer'
import Diagram2DPreview from './Diagram2DPreview.vue'
import Diagram3DPreview from './Diagram3DPreview.vue'
import CircuitPreview from './CircuitPreview.vue'
import MathPreviewEditorModal from './MathPreviewEditorModal.vue'
import EmbedJsonEditorModal from './EmbedJsonEditorModal.vue'

const props = defineProps({
  content: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['jump-to'])

const { renderMarkdownWithLatex, renderMarkdownWithLatexAndSourceMap } = useMarkdownRenderer()

const previewRoot = ref(null)
const mounted = new Map() // el -> app

const mathEditor = ref({
  open: false,
  pos: null,
  len: null,
  delim: '$',
  latex: '',
})

const embedEditor = ref({
  open: false,
  type: null,
  pos: null,
  len: null,
  raw: '{}',
})

const renderedContent = computed(() => {
  // 優先使用帶 source map 的渲染（用於點預覽跳回編輯）
  if (typeof renderMarkdownWithLatexAndSourceMap === 'function') {
    return renderMarkdownWithLatexAndSourceMap(props.content || '')
  }
  return renderMarkdownWithLatex(props.content || '')
})

const unmountAll = () => {
  mounted.forEach((app) => {
    try {
      app.unmount()
    } catch (e) {
      // ignore
    }
  })
  mounted.clear()
}

const mountEmbeds = async () => {
  await nextTick()
  unmountAll()
  const root = previewRoot.value
  if (!root) return
  const nodes = root.querySelectorAll?.('[data-embed-type][data-embed]')
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

    let data = {}
    try {
      data = raw ? JSON.parse(raw) : {}
    } catch (e) {
      data = {}
    }

    let Comp = null
    if (type === 'diagram2d') Comp = Diagram2DPreview
    else if (type === 'diagram3d') Comp = Diagram3DPreview
    else if (type === 'circuit') Comp = CircuitPreview

    if (!Comp) return

    // 清空 placeholder 文字後掛載
    el.innerHTML = ''
    const app = createApp({
      render: () => h(Comp, { data }),
    })
    app.mount(el)
    mounted.set(el, app)
  })
}

watch(renderedContent, () => {
  mountEmbeds()
})

onBeforeUnmount(() => {
  unmountAll()
})

const onPreviewClick = (event) => {
  const embedEl = event?.target?.closest?.('[data-embed-type][data-embed][data-source-pos][data-source-len]')
  if (embedEl) {
    const type = embedEl.getAttribute('data-embed-type')
    if (type === 'diagram2d' || type === 'diagram3d') {
      const pos = Number(embedEl.getAttribute('data-source-pos'))
      const len = Number(embedEl.getAttribute('data-source-len'))
      const encoded = embedEl.getAttribute('data-embed') || ''
      let raw = '{}'
      try {
        raw = decodeURIComponent(encoded) || '{}'
      } catch (e) {
        raw = '{}'
      }
      if (Number.isFinite(pos) && pos >= 0 && Number.isFinite(len) && len > 0) {
        embedEditor.value = { open: true, type, pos, len, raw }
        return
      }
    }
  }

  const mathEl = event?.target?.closest?.('[data-math-raw][data-source-pos][data-source-len]')
  if (mathEl) {
    const pos = Number(mathEl.getAttribute('data-source-pos'))
    const len = Number(mathEl.getAttribute('data-source-len'))
    const delim = mathEl.getAttribute('data-math-delim') || '$'
    const raw = mathEl.getAttribute('data-math-raw') || ''
    let latex = ''
    try {
      latex = decodeURIComponent(raw)
    } catch (e) {
      latex = ''
    }
    if (Number.isFinite(pos) && pos >= 0 && Number.isFinite(len) && len > 0) {
      mathEditor.value = { open: true, pos, len, delim, latex }
      return
    }
  }

  const el = event?.target?.closest?.('[data-source-pos],[data-source-line]')
  if (!el) return
  const posAttr = el.getAttribute('data-source-pos')
  const lineAttr = el.getAttribute('data-source-line')
  const pos = posAttr != null ? Number(posAttr) : null
  const line = lineAttr != null ? Number(lineAttr) : null
  if (Number.isFinite(pos) && pos >= 0) {
    emit('jump-to', { pos, line: Number.isFinite(line) ? line : null })
    return
  }
  if (Number.isFinite(line) && line >= 1) {
    emit('jump-to', { pos: null, line })
  }
}

const closeMathEditor = () => {
  mathEditor.value = { open: false, pos: null, len: null, delim: '$', latex: '' }
}

const saveMathEditor = (newLatex) => {
  const { pos, len, delim } = mathEditor.value
  if (!Number.isFinite(pos) || pos == null || !Number.isFinite(len) || len == null) {
    closeMathEditor()
    return
  }
  const replacement = delim === '$$' ? `$$${newLatex}$$` : `$${newLatex}$`
  emit('jump-to', { pos, line: null, replace: { pos, len, text: replacement } })
  closeMathEditor()
}

const closeEmbedEditor = () => {
  embedEditor.value = { open: false, type: null, pos: null, len: null, raw: '{}' }
}

const saveEmbedEditor = (newRaw) => {
  const { type, pos, len } = embedEditor.value
  if (!(type === 'diagram2d' || type === 'diagram3d')) {
    closeEmbedEditor()
    return
  }
  const fence = type === 'diagram2d' ? 'diagram2d' : 'diagram3d'
  const text = `\n\`\`\`${fence}\n${newRaw}\n\`\`\`\n`
  emit('jump-to', { pos, line: null, replace: { pos, len, text } })
  closeEmbedEditor()
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
