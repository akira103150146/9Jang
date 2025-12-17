<template>
  <NodeViewWrapper as="span" class="math-field-inline" :class="{ 'is-editing': isEditing }">
    <math-field
      v-if="isEditing"
      :value="localLatex"
      @input="handleInput"
      @blur="handleBlur"
      @keydown.enter.prevent="handleBlur"
      class="math-field-editor"
      ref="mathFieldRef"
      @change="handleChange"
    ></math-field>
    <span
      v-else
      @click="startEditing"
      class="math-field-display"
      v-html="renderedLatex"
    ></span>
  </NodeViewWrapper>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { NodeViewWrapper } from '@tiptap/vue-3'
import katex from 'katex'
import 'katex/dist/katex.css'
import 'mathlive'

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
  updateAttributes: {
    type: Function,
    required: true,
  },
  deleteNode: {
    type: Function,
    required: true,
  },
})

const isEditing = ref(false)
const localLatex = ref(props.node.attrs.latex || '')
const renderedLatex = ref('')
const mathFieldRef = ref(null)

const renderLatex = (latex) => {
  if (!latex) return ''
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode: false, // 行內模式
    })
  } catch (error) {
    console.error('LaTeX 渲染錯誤：', error)
    return `<span class="latex-error">${latex}</span>`
  }
}

const startEditing = async () => {
  isEditing.value = true
  localLatex.value = props.node.attrs.latex || ''
  // 等待 DOM 更新後聚焦
  await nextTick()
  if (mathFieldRef.value) {
    mathFieldRef.value.focus()
  }
}

const handleInput = (event) => {
  // MathLive 的 input 事件
  if (mathFieldRef.value) {
    localLatex.value = mathFieldRef.value.value || ''
  }
}

const handleChange = (event) => {
  // MathLive 的 change 事件
  if (mathFieldRef.value) {
    localLatex.value = mathFieldRef.value.value || ''
  }
}

const handleBlur = () => {
  isEditing.value = false
  if (localLatex.value !== props.node.attrs.latex) {
    props.updateAttributes({ latex: localLatex.value })
  }
}

watch(() => props.node.attrs.latex, (newLatex) => {
  localLatex.value = newLatex
  renderedLatex.value = renderLatex(newLatex)
}, { immediate: true })

onMounted(() => {
  renderedLatex.value = renderLatex(props.node.attrs.latex)
})
</script>

<style scoped>
.math-field-inline {
  display: inline-block;
  margin: 0 2px;
}

.math-field-display {
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 3px;
  transition: background-color 0.2s;
}

.math-field-display:hover {
  background-color: rgba(99, 102, 241, 0.1);
}

.math-field-editor {
  display: inline-block;
  min-width: 100px;
  padding: 2px 4px;
  border: 1px solid rgb(99, 102, 241);
  border-radius: 3px;
  background: white;
}

:deep(.math-field-editor math-field) {
  font-size: 14px;
}

.latex-error {
  color: red;
  font-style: italic;
}
</style>
