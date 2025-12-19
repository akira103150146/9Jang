<template>
  <NodeViewWrapper as="span" class="inline-latex-wrapper">
    <span v-html="renderedLatex"></span>
  </NodeViewWrapper>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { NodeViewWrapper } from '@tiptap/vue-3'
import katex from 'katex'
import 'katex/dist/katex.min.css'

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
})

const renderedLatex = ref('')

// 渲染 LaTeX 公式
const renderLatex = () => {
  try {
    const formula = props.node.attrs.formula || props.node.textContent || ''
    if (formula) {
      renderedLatex.value = katex.renderToString(formula, {
        displayMode: false,
        throwOnError: false,
        output: 'html',
      })
    } else {
      renderedLatex.value = ''
    }
  } catch (error) {
    console.error('LaTeX rendering error:', error)
    renderedLatex.value = `<span class="latex-error">${props.node.textContent}</span>`
  }
}

// 初始渲染
onMounted(() => {
  renderLatex()
})

// 監聽內容變化
watch(() => props.node.attrs.formula, () => {
  renderLatex()
})

watch(() => props.node.textContent, () => {
  renderLatex()
})
</script>

<style scoped>
.inline-latex-wrapper {
  display: inline;
  margin: 0 2px;
}

.inline-latex-wrapper :deep(.katex) {
  font-size: 1em;
}

.latex-error {
  color: red;
  background: #fee;
  padding: 0 4px;
  border-radius: 2px;
}
</style>
